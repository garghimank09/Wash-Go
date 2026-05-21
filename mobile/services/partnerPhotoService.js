import { partnerApiFetch, partnerApiUpload } from './partnerApiClient';
import { API_URL } from '../lib/apiConfig';

/**
 * Booking photo helpers. Upload uses multipart (`kind` + `file`) and the
 * server returns a `BookingPhotoRead` we surface to the UI for thumbnails.
 */
export const partnerPhotoService = {
  list(bookingId, { signal } = {}) {
    return partnerApiFetch(`/bookings/${bookingId}/photos`, { auth: true, signal });
  },

  /**
   * @param {string} bookingId
   * @param {'before'|'after'} kind
   * @param {{ uri: string, name?: string, type?: string }} file
   * @param {{ onProgress?: (n: number) => void, signal?: AbortSignal }} [options]
   */
  upload(bookingId, kind, file, options = {}) {
    return partnerApiUpload(
      `/bookings/${bookingId}/photos`,
      { kind, file },
      options,
    );
  },
};

/** Resolve a relative photo path (`/uploads/...`) to a full URL. */
export function photoUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = API_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
