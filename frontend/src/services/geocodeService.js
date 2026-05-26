import { api } from './api';

export const geocodeService = {
  /** @param {string} address */
  resolve: (address) =>
    api.get('/geocode', { params: { address: address.trim() } }).then((r) => r.data),

  /** @param {number} lat @param {number} lng */
  reverse: (lat, lng) =>
    api.get('/geocode/reverse', { params: { lat, lng } }).then((r) => r.data),
};
