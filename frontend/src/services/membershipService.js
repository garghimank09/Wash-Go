import { api } from './api';

export const membershipService = {
  getMine: () => api.get('/memberships/me').then((r) => r.data),
  subscribe: (planSlug) =>
    api.post('/memberships/subscribe', { plan_slug: planSlug }).then((r) => r.data),
};
