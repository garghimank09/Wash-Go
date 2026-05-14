import { api } from './api';

export const bookingsService = {
  list: () => api.get('/bookings').then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  create: (body) => api.post('/bookings', body).then((r) => r.data),
  cancel: (id, body) => api.post(`/bookings/${id}/cancel`, body).then((r) => r.data),
  reschedule: (id, body) => api.patch(`/bookings/${id}/schedule`, body).then((r) => r.data),
};
