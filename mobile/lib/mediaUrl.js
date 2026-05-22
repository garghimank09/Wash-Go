import { API_URL } from './apiConfig';

/** Resolve API-relative media paths (avatars, booking photos) to full URLs. */
export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = API_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
