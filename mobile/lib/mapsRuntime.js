import Constants from 'expo-constants';
import { HAS_GOOGLE_MAPS_KEY } from '../constants/maps';

/** True when running inside the Expo Go app (custom native Maps key is not used). */
export const IS_EXPO_GO = Constants.appOwnership === 'expo';

/**
 * Android map tiles need a dev build with GOOGLE_MAPS_API_KEY baked in via app.config.js.
 * Expo Go cannot use your project's key from mobile/.env.
 */
export function shouldShowMapsSetupBanner() {
  return IS_EXPO_GO || !HAS_GOOGLE_MAPS_KEY;
}

export function mapsSetupMessage() {
  if (IS_EXPO_GO) {
    return 'Maps need a development build. Run npm run android after setting your Google Maps key in mobile/.env.';
  }
  if (!HAS_GOOGLE_MAPS_KEY) {
    return 'Add GOOGLE_MAPS_API_KEY to mobile/.env, then run npm run android to rebuild.';
  }
  return '';
}
