import { Platform } from 'react-native';

/** WashGo backend port (see backend `API_PORT` / `run.py`). */
export const API_PORT = 8001;

/** Default request timeout (ms). */
export const API_TIMEOUT_MS = 15000;

function defaultHostUrl() {
  const host = `http://127.0.0.1:${API_PORT}`;
  if (Platform.OS === 'android') {
    // Android emulator: host machine loopback
    return `http://10.0.2.2:${API_PORT}`;
  }
  return host;
}

/**
 * API base URL. Set EXPO_PUBLIC_API_URL in .env for physical devices (LAN IP).
 * Priority: env var > platform default.
 */
export const API_URL =
  (typeof process !== 'undefined' &&
    process.env?.EXPO_PUBLIC_API_URL?.trim()) ||
  defaultHostUrl();
