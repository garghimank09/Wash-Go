import { partnerApiFetch } from './partnerApiClient';

/**
 * Booking endpoints used by the partner app.
 *
 * Mirrors `frontend/src/services/partnerBookingsService.js` so the same
 * backend contracts power both surfaces.
 */
export const partnerBookingsService = {
  /** GET /bookings — bookings assigned to the current washer. */
  list({ signal } = {}) {
    return partnerApiFetch('/bookings', { auth: true, signal });
  },

  /** GET /bookings/offers — open dispatch pool (pending, unassigned). */
  listOffers({ signal } = {}) {
    return partnerApiFetch('/bookings/offers', { auth: true, signal });
  },

  /** GET /bookings/{id} — detail incl. customer, timeline, photos. */
  getById(id, { signal } = {}) {
    return partnerApiFetch(`/bookings/${id}`, { auth: true, signal });
  },

  /** POST /bookings/{id}/accept — claim an open offer. */
  accept(id) {
    return partnerApiFetch(`/bookings/${id}/accept`, {
      method: 'POST',
      auth: true,
    });
  },

  /** PATCH /bookings/{id}/status — washer status transition. */
  updateStatus(id, status) {
    return partnerApiFetch(`/bookings/${id}/status`, {
      method: 'PATCH',
      auth: true,
      body: { status },
    });
  },

  /** POST /bookings/{id}/handoff/request — notify customer for review. */
  requestHandoff(id) {
    return partnerApiFetch(`/bookings/${id}/handoff/request`, {
      method: 'POST',
      auth: true,
    });
  },

  /** GET /bookings/sync — versioned fingerprint for polling diffs. */
  sync({ signal } = {}) {
    return partnerApiFetch('/bookings/sync', { auth: true, signal });
  },
};
