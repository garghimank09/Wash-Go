/** API base — override with VITE_API_URL in .env */
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/** ISO 4217 — bookings, pricing, and UI formatting */
export const DEFAULT_CURRENCY = 'INR';

export const TOKEN_KEY = 'washgo_access_token';

/** Separate JWT for partner (washer) app — keeps customer and field sessions independent. */
export const PARTNER_TOKEN_KEY = 'washgo_partner_token';

/** Wash tiers are loaded from GET /wash-tiers (see useWashTiers / WashTiersProvider). */

export const VEHICLE_SIZES = [
  { id: 'compact', label: 'Compact' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV / large' },
];

/** @deprecated Use GET /membership-plans — kept for legacy references only. */
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
