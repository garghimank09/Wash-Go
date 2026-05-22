import { apiFetch } from './apiClient';
import { DEFAULT_CURRENCY } from '../lib/formatCurrency';

/**
 * Keep ids in sync with backend pricing_schema + pricing_routes and web config.
 */
export const PACKAGES = [
  {
    id: 'basic',
    label: 'Basic',
    desc: 'Quick exterior refresh',
    badge: null,
    icon: 'water-drop',
    features: ['Exterior rinse & dry', 'Tyre splash clean', 'Standard scheduling'],
  },
  {
    id: 'deluxe',
    label: 'Deluxe',
    desc: 'Everyday deep clean',
    badge: null,
    icon: 'auto-awesome',
    features: ['Everything in Basic', 'Wheel & trim detail', 'Door jamb wipe'],
  },
  {
    id: 'super_deluxe',
    label: 'Super Deluxe',
    desc: 'Inside + out shine',
    badge: 'Popular',
    icon: 'star',
    features: [
      'Everything in Deluxe',
      'Interior vacuum',
      'Dashboard & console wipe',
      'Window interiors',
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    desc: 'Showroom-ready finish',
    badge: 'Best value',
    icon: 'diamond',
    features: [
      'Everything in Super Deluxe',
      'Wax / sealant coat',
      'Tyre dressing',
      'Priority washer match',
    ],
  },
];

export const VEHICLE_SIZES = [
  { id: 'compact', label: 'Compact' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV / large' },
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
  return PACKAGES.find((p) => p.id === packageId) || PACKAGES[2];
}

export function getVehicleSize(sizeId) {
  return VEHICLE_SIZES.find((s) => s.id === sizeId) || VEHICLE_SIZES[1];
}

export { DEFAULT_CURRENCY };
