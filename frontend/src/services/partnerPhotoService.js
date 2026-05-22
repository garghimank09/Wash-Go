import { mediaUrl } from '../lib/mediaUrl';
import { partnerApi } from './partnerApi';

export const photoUrl = mediaUrl;

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
