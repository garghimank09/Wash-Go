import { API_URL, API_TIMEOUT_MS } from '../lib/apiConfig';
import { getToken, notifyUnauthorized } from '../lib/sessionStore';

export function parseErrorDetail(data, fallback) {
  const detail = data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0]?.msg ?? detail[0] ?? fallback;
  }
  return fallback;
}

function buildUrl(path) {
  const base = API_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Centralized fetch with timeout, optional auth, and global 401 handling.
 */
export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    auth = false,
    timeout = API_TIMEOUT_MS,
    headers: extraHeaders = {},
    skipUnauthorized = false,
  } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (auth) {
    const token = await getToken();
    if (!token) {
      throw new Error('Not signed in. Please log in again.');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

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
      'Cannot reach the server. Check that the backend is running and EXPO_PUBLIC_API_URL is set correctly for your device.'
    );
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && auth && !skipUnauthorized) {
    await notifyUnauthorized();
    throw new Error('Session expired. Please sign in again.');
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
        'If another app uses port 8000, set EXPO_PUBLIC_API_URL in mobile/.env to your WashGo URL.';
    }
    throw new Error(message);
  }

  return data;
}

export { API_URL, API_TIMEOUT_MS };
