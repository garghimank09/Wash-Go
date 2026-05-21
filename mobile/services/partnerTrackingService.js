import { partnerApiFetch } from './partnerApiClient';

/**
 * Tracking endpoints — booking-side payload + the partner's live GPS upload.
 */
export const partnerTrackingService = {
  /** GET /bookings/{id}/tracking — washer + customer markers, route, ETA. */
  getBookingTracking(id, { signal } = {}) {
    return partnerApiFetch(`/bookings/${id}/tracking`, { auth: true, signal });
  },

  /** POST /partner/location — heartbeat called while on active jobs. */
  reportLocation({ latitude, longitude, heading } = {}) {
    return partnerApiFetch('/partner/location', {
      method: 'POST',
      auth: true,
      body: {
        latitude,
        longitude,
        ...(heading != null ? { heading } : {}),
      },
    });
  },
};
