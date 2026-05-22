import { api } from './api';

export const membershipPlansService = {
  list: () => api.get('/membership-plans').then((r) => r.data),
};
