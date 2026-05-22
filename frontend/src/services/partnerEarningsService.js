import { partnerApi } from './partnerApi';

export const partnerEarningsService = {
  getSummary: () => partnerApi.get('/partner/earnings').then((r) => r.data),
};
