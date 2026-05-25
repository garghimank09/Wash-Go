import { partnerApi } from './partnerApi';

export const partnerBookingsService = {
  list: () => partnerApi.get('/bookings').then((r) => r.data),
  listOffers: () => partnerApi.get('/bookings/offers').then((r) => r.data),
  get: (id) => partnerApi.get(`/bookings/${id}`).then((r) => r.data),
  getReview: (id) => partnerApi.get(`/bookings/${id}/reviews`).then((r) => r.data),
  listMyReviews: () => partnerApi.get('/partner/reviews').then((r) => r.data),
  accept: (id) => partnerApi.post(`/bookings/${id}/accept`).then((r) => r.data),
  updateStatus: (id, status) =>
    partnerApi.patch(`/bookings/${id}/status`, { status }).then((r) => r.data),
};
