/** API base — override with VITE_API_URL in .env */
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

/** ISO 4217 — bookings, pricing, and UI formatting */
export const DEFAULT_CURRENCY = 'INR';

export const TOKEN_KEY = 'washgo_access_token';

/** Separate JWT for partner (washer) app — keeps customer and field sessions independent. */
export const PARTNER_TOKEN_KEY = 'washgo_partner_token';

/**
 * Per-wash tiers shown in customer booking (/booking) and parsed from booking notes.
 * Keep ids in sync with backend pricing_schema + pricing_routes.
 */
export const PACKAGES = [
  {
    id: 'basic',
    label: 'Basic',
    desc: 'Quick exterior refresh',
    badge: null,
    features: ['Exterior rinse & dry', 'Tyre splash clean', 'Standard scheduling'],
  },
  {
    id: 'deluxe',
    label: 'Deluxe',
    desc: 'Everyday deep clean',
    badge: null,
    features: ['Everything in Basic', 'Wheel & trim detail', 'Door jamb wipe'],
  },
  {
    id: 'super_deluxe',
    label: 'Super Deluxe',
    desc: 'Inside + out shine',
    badge: 'Popular',
    features: ['Everything in Deluxe', 'Interior vacuum', 'Dashboard & console wipe', 'Window interiors'],
  },
  {
    id: 'premium',
    label: 'Premium',
    desc: 'Showroom-ready finish',
    badge: 'Best value',
    features: ['Everything in Super Deluxe', 'Wax / sealant coat', 'Tyre dressing', 'Priority washer match'],
  },
];

export const VEHICLE_SIZES = [
  { id: 'compact', label: 'Compact' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV / large' },
];

/** Monthly membership preview (landing / dashboard) — maps to default wash tier. */
export const MEMBERSHIP_PLANS = [
  {
    id: 'spark',
    title: 'Spark',
    price: '₹499',
    includedPackageId: 'basic',
    perks: ['2 Basic washes / month', '1 vehicle in My Garage', 'Live status in app', 'Email support'],
  },
  {
    id: 'gleam',
    title: 'Gleam',
    price: '₹999',
    highlighted: true,
    includedPackageId: 'super_deluxe',
    perks: [
      '5 washes / month (Super Deluxe)',
      '2 vehicles · priority scheduling',
      'Live GPS tracking & AI recap',
      '1 free reschedule per booking',
    ],
  },
  {
    id: 'apex',
    title: 'Apex Fleet',
    price: '₹2,499',
    includedPackageId: 'premium',
    perks: [
      '12 shared washes / month',
      'Up to 5 vehicles · fleet dashboard',
      '4× Premium + 8× Super Deluxe',
      'Dedicated manager & GST invoices',
    ],
  },
];
