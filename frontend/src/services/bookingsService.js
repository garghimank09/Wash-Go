import { api } from './api';

export const bookingsService = {
  list: () => api.get('/bookings').then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  create: (body) => api.post('/bookings', body).then((r) => r.data),
};
