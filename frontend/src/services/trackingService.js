import { api } from './api';
import { partnerApi } from './partnerApi';

/** @param {'customer' | 'partner'} auth */
function clientFor(auth) {
  return auth === 'partner' ? partnerApi : api;
}

export const trackingService = {
  /** Customer session (`washgo_access_token`). */
  get: (bookingId) => clientFor('customer').get(`/bookings/${bookingId}/tracking`).then((r) => r.data),

  /** Partner / washer session (`washgo_partner_token`). */
  getForPartner: (bookingId) =>
    clientFor('partner').get(`/bookings/${bookingId}/tracking`).then((r) => r.data),
};

export const partnerLocationService = {
  update: (body) => partnerApi.post('/partner/location', body),
};
