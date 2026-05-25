/** Google Maps Platform (browser). Set in frontend/.env */
export const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

/** Optional vector Map ID from Cloud Console → Map Management (enables 3D buildings when tilted). */
export const GOOGLE_MAP_ID = (import.meta.env.VITE_GOOGLE_MAP_ID || '').trim();

export function isGoogleMapsConfigured() {
  return GOOGLE_MAPS_API_KEY.length > 0;
}

/** Default center: Delhi NCR */
export const DEFAULT_MAP_CENTER = { lat: 28.6139, lng: 77.209 };
