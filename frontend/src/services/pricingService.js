import { api } from './api';

export const pricingService = {
  calculate: (package_id, vehicle_size) =>
    api.post('/pricing/calculate', { package_id, vehicle_size }).then((r) => r.data),
};
