import { api } from './api';

export const carsService = {
  list: () => api.get('/cars').then((r) => r.data),
  create: (body) => api.post('/cars', body).then((r) => r.data),
  remove: (id) => api.delete(`/cars/${id}`),
};
