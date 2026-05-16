import { API_URL } from '../constants/config';
import { partnerApi } from './partnerApi';

export function photoUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = API_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const partnerPhotoService = {
  list: (bookingId) => partnerApi.get(`/bookings/${bookingId}/photos`).then((r) => r.data),
  upload: (bookingId, kind, file) => {
    const form = new FormData();
    form.append('kind', kind);
    form.append('file', file);
    return partnerApi
      .post(`/bookings/${bookingId}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
