import { mediaUrl } from '../lib/mediaUrl';
import { partnerApi } from './partnerApi';

export const photoUrl = mediaUrl;

export const partnerPhotoService = {
  list: (bookingId) => partnerApi.get(`/bookings/${bookingId}/photos`).then((r) => r.data),
  upload: (bookingId, kind, file, conditionNotes) => {
    const form = new FormData();
    form.append('kind', kind);
    form.append('file', file);
    if (kind === 'arrival' && conditionNotes != null && String(conditionNotes).trim()) {
      form.append('condition_notes', String(conditionNotes).trim());
    }
    return partnerApi
      .post(`/bookings/${bookingId}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  updateArrivalNotes: (bookingId, notes) =>
    partnerApi
      .patch(`/bookings/${bookingId}/arrival-condition-notes`, { notes: notes ?? null })
      .then((r) => r.data),
};
