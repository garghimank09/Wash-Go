import { api } from './api';

export const bookingsService = {
  list: () => api.get('/bookings').then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  downloadReceipt: (id) => api.get(`/bookings/${id}/receipt`, { responseType: 'blob' }),
  create: (body) => api.post('/bookings', body).then((r) => r.data),
  cancel: (id, body) => api.post(`/bookings/${id}/cancel`, body).then((r) => r.data),
  reschedule: (id, body) => api.patch(`/bookings/${id}/schedule`, body).then((r) => r.data),
  approveArrival: (id) => api.post(`/bookings/${id}/approve-arrival`).then((r) => r.data),
  submitReview: (id, body) => api.post(`/bookings/${id}/reviews`, body).then((r) => r.data),
  getReview: (id) => api.get(`/bookings/${id}/reviews`).then((r) => r.data),
};
