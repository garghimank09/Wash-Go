import { Platform } from 'react-native';
import { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

/**
 * Android uses Google Maps (requires GOOGLE_MAPS_API_KEY in app.config.js / .env).
 * iOS uses Apple Maps via the default provider.
 */
export const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;
