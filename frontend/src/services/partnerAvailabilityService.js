import { partnerApi } from './partnerApi';

export const partnerAvailabilityService = {
  get: () => partnerApi.get('/partner/availability').then((r) => r.data),
  update: (is_available) =>
    partnerApi.patch('/partner/availability', { is_available }).then((r) => r.data),
};
