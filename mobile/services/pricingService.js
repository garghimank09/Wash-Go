import { apiFetch } from './apiClient';

export const PACKAGES = [
  {
    id: 'basic',
    label: 'Basic wash',
    desc: 'Exterior rinse & dry',
    features: ['Exterior rinse', 'Spot-free dry', '~30 min service'],
  },
  {
    id: 'deluxe',
    label: 'Deluxe',
    desc: 'Exterior + wheels & trim',
    features: ['Everything in Basic', 'Wheels & tires', 'Trim & shine'],
  },
  {
    id: 'premium',
    label: 'Premium',
    desc: 'Full detail-ready shine',
    features: ['Everything in Deluxe', 'Hand wax', 'Interior vacuum'],
  },
];

export const VEHICLE_SIZES = [
  { id: 'compact', label: 'Compact' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV / Large' },
];

export const pricingService = {
  async calculate(packageId, vehicleSize) {
    return apiFetch('/pricing/calculate', {
      method: 'POST',
      auth: true,
      body: {
        package_id: packageId,
        vehicle_size: vehicleSize,
      },
    });
  },
};

export function getPackage(packageId) {
  return PACKAGES.find((p) => p.id === packageId) || PACKAGES[1];
}

export function getVehicleSize(sizeId) {
  return VEHICLE_SIZES.find((s) => s.id === sizeId) || VEHICLE_SIZES[1];
}
