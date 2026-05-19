import { apiFetch } from './apiClient';

export const garageService = {
  async getVehicles() {
    const data = await apiFetch('/cars', { auth: true });
    return Array.isArray(data) ? data : [];
  },

  async addVehicle(vehicle) {
    return apiFetch('/cars', {
      method: 'POST',
      auth: true,
      body: vehicle,
    });
  },

  async deleteVehicle(vehicleId) {
    await apiFetch(`/cars/${vehicleId}`, {
      method: 'DELETE',
      auth: true,
    });
    return true;
  },
};
