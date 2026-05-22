import { API_URL, API_TIMEOUT_MS } from '../lib/apiConfig';
import { getToken } from '../lib/sessionStore';
import { apiFetch, parseErrorDetail } from './apiClient';

async function authMultipartFetch(path, formData) {
  const token = await getToken();
  if (!token) {
    throw new Error('Not signed in. Please log in again.');
  }

  const base = API_URL.replace(/\/$/, '');
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Upload timed out. Try again.');
    }
    throw new Error('Cannot reach the server. Check your connection.');
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(parseErrorDetail(data, `Upload failed (${response.status})`));
  }
  return data;
}

export const customerProfileService = {
  get: () => apiFetch('/users/me/profile', { auth: true }),

  update: (body) =>
    apiFetch('/users/me/profile', {
      method: 'PATCH',
      auth: true,
      body,
    }),

  /**
   * @param {{ uri: string, fileName?: string, mimeType?: string }} file
   */
  uploadAvatar: ({ uri, fileName = 'avatar.jpg', mimeType = 'image/jpeg' }) => {
    const form = new FormData();
    form.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    });
    return authMultipartFetch('/users/me/avatar', form);
  },
};
