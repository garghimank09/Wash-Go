import { Platform } from 'react-native';

/** Default request timeout (ms). */
export const API_TIMEOUT_MS = 15000;

function defaultHostUrl() {
  if (Platform.OS === 'android') {
    // Android emulator: host machine loopback
    return 'http://10.0.2.2:8000';
  }
  // iOS simulator and other platforms
  return 'http://127.0.0.1:8000';
}

/**
 * API base URL. Set EXPO_PUBLIC_API_URL in .env for physical devices (LAN IP).
 * Priority: env var > platform default.
 */
export const API_URL =
  (typeof process !== 'undefined' &&
    process.env?.EXPO_PUBLIC_API_URL?.trim()) ||
  defaultHostUrl();
