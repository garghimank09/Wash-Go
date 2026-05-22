import { apiFetch } from './apiClient';

export const geocodeService = {
  /**
   * Resolve address to coordinates via backend GET /geocode.
   * @returns {{ lat: number, lng: number, found: boolean, approximate: boolean }}
   */
  async resolve(address) {
    const trimmed = (address || '').trim();
    if (trimmed.length < 3) {
      throw new Error('Enter at least 3 characters');
    }
    const params = new URLSearchParams({ address: trimmed });
    return apiFetch(`/geocode?${params.toString()}`, { auth: true });
  },
};
