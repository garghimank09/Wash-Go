import { partnerApiFetch } from './partnerApiClient';

export const partnerEarningsService = {
  getSummary: (signal) =>
    partnerApiFetch('/partner/earnings', { auth: true, signal }),
};
