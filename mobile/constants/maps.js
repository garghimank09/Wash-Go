import Constants from 'expo-constants';

/**
 * Google Maps API key exposed via app.config.js `extra` (from mobile/.env).
 * Native map tiles use the key baked into the binary at build time; this is for
 * optional runtime checks or future JS SDK usage.
 */
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
  Constants.expoConfig?.extra?.googleMapsApiKey?.trim() ||
  '';

export const HAS_GOOGLE_MAPS_KEY = GOOGLE_MAPS_API_KEY.length > 0;
