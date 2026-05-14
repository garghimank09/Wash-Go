/** API base — override with VITE_API_URL in .env */
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const TOKEN_KEY = 'washgo_access_token';

/** Separate JWT for partner (washer) app — keeps customer and field sessions independent. */
export const PARTNER_TOKEN_KEY = 'washgo_partner_token';

export const PACKAGES = [
  { id: 'basic', label: 'Basic wash', desc: 'Exterior rinse & dry' },
  { id: 'deluxe', label: 'Deluxe', desc: 'Exterior + wheels & trim' },
  { id: 'premium', label: 'Premium', desc: 'Full detail-ready shine' },
];

export const VEHICLE_SIZES = [
  { id: 'compact', label: 'Compact' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV / large' },
];
