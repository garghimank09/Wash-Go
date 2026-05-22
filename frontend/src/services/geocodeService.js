import { api } from './api';

export const geocodeService = {
  /** @param {string} address */
  resolve: (address) =>
    api.get('/geocode', { params: { address: address.trim() } }).then((r) => r.data),
};
