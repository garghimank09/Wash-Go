import { API_URL, API_TIMEOUT_MS } from '../lib/apiConfig';
import { parseErrorDetail } from './apiClient';
import {
  getPartnerToken,
  notifyPartnerUnauthorized,
} from '../lib/partnerSessionStore';

/**
 * Fetch wrapper used by every partner service.
 *
 * Always sends the partner token (separate SecureStore key), normalizes
 * FastAPI error payloads into `Error.message`, and routes 401s through
 * {@link notifyPartnerUnauthorized} so the partner auth gate can boot the user
 * out without each screen re-implementing the same logic.
 */

function buildUrl(path) {
  const base = API_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function authHeader(auth) {
  if (!auth) return {};
  const token = await getPartnerToken();
  if (!token) {
    throw new Error('Partner session is missing. Please sign in again.');
  }
  return { Authorization: `Bearer ${token}` };
}

async function handleResponse(response, { auth, skipUnauthorized }) {
  const isJson = (response.headers.get('content-type') || '').includes(
    'application/json',
  );
  const data = isJson ? await response.json().catch(() => ({})) : null;

  if (response.status === 401 && auth && !skipUnauthorized) {
    await notifyPartnerUnauthorized();
    throw new Error('Session expired. Please sign in again.');
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const fallback = `Request failed (${response.status})`;
    let message = parseErrorDetail(data, fallback);
    if (
      response.status === 404 &&
      typeof message === 'string' &&
      message.toLowerCase() === 'not found' &&
      (path.startsWith('/auth') || path.startsWith('/bookings') || path.startsWith('/partner'))
    ) {
      message =
        'WashGo API not found on this URL. Start the backend (python run.py) — default port 8001. ' +
        'Set EXPO_PUBLIC_API_URL in mobile/.env if needed.';
    }
    throw new Error(message);
  }

  return data;
}

/**
 * JSON-bodied fetch (GET/POST/PATCH/DELETE).
 *
 * @param {string} path
 * @param {{
 *   method?: string,
 *   body?: any,
 *   auth?: boolean,
 *   timeout?: number,
 *   headers?: Record<string,string>,
 *   skipUnauthorized?: boolean,
 *   signal?: AbortSignal,
 * }} [options]
 */
export async function partnerApiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    auth = false,
    timeout = API_TIMEOUT_MS,
    headers: extraHeaders = {},
    skipUnauthorized = false,
    signal: externalSignal,
  } = options;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(await authHeader(auth)),
    ...extraHeaders,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', () => controller.abort());
  }

  let response;
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    throw new Error(
      'Cannot reach the server. Check that the backend is running and EXPO_PUBLIC_API_URL is set correctly for your device.',
    );
  } finally {
    clearTimeout(timer);
  }

  return handleResponse(response, { auth, skipUnauthorized });
}

/**
 * Multipart upload for booking photos.
 *
 * Uses XMLHttpRequest so we get an actual upload progress stream (fetch on
 * RN cannot observe upload bytes). The server expects `kind` + `file` in a
 * form-data body and an `Authorization: Bearer <token>` header.
 *
 * @param {string} path
 * @param {{ kind: string, file: { uri: string, name: string, type: string } }} payload
 * @param {{
 *   onProgress?: (fraction: number) => void,
 *   timeout?: number,
 *   signal?: AbortSignal,
 * }} [options]
 */
export function partnerApiUpload(path, payload, options = {}) {
  const { onProgress, timeout = 60_000, signal } = options;

  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    let settled = false;

    const finish = (fn) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const onAbort = () => finish(() => {
      try { xhr.abort(); } catch { /* noop */ }
      reject(new Error('Upload cancelled'));
    });

    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener('abort', onAbort, { once: true });
    }

    (async () => {
      try {
        const token = await getPartnerToken();
        if (!token) {
          return finish(() => reject(new Error('Partner session is missing. Please sign in again.')));
        }

        const form = new FormData();
        form.append('kind', payload.kind);
        form.append('file', {
          uri: payload.file.uri,
          name: payload.file.name || 'photo.jpg',
          type: payload.file.type || 'image/jpeg',
        });

        xhr.open('POST', buildUrl(path));
        xhr.timeout = timeout;
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        if (xhr.upload && typeof onProgress === 'function') {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
              onProgress(event.loaded / event.total);
            }
          };
        }

        xhr.onload = async () => {
          finish(() => {
            const status = xhr.status;
            let parsed = null;
            try {
              parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            } catch {
              parsed = null;
            }

            if (status === 401) {
              notifyPartnerUnauthorized().catch(() => {});
              return reject(new Error('Session expired. Please sign in again.'));
            }

            if (status >= 200 && status < 300) {
              return resolve(parsed);
            }

            return reject(new Error(parseErrorDetail(parsed, `Upload failed (${status})`)));
          });
        };

        xhr.onerror = () => finish(() => reject(new Error('Network error while uploading photo.')));
        xhr.ontimeout = () => finish(() => reject(new Error('Upload timed out. Try again on a stronger connection.')));

        xhr.send(form);
      } catch (err) {
        finish(() => reject(err));
      }
    })();
  });
}

export { API_URL, API_TIMEOUT_MS };
