import { partnerApi } from './partnerApi';

export const partnerBookingsService = {
  list: () => partnerApi.get('/bookings').then((r) => r.data),
  get: (id) => partnerApi.get(`/bookings/${id}`).then((r) => r.data),
};
