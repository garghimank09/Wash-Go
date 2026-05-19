import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// SecureStore keys: alphanumeric, ".", "-", "_" only (no "@" prefix).
const SECURE_TOKEN_KEY = 'washgo_auth_token';
const LEGACY_ASYNC_TOKEN_KEY = '@washgo_token';
const USER_KEY = '@washgo_user';
const ROLE_KEY = '@washgo_role';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function notifyUnauthorized() {
  await clearSession();
  if (unauthorizedHandler) {
    await unauthorizedHandler();
  }
}

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getCachedUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setSession(token, user) {
  await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
  if (user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(ROLE_KEY, user.role ?? 'customer');
  }
}

export async function clearSession() {
  try {
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
  } catch {
    // ignore
  }
  await AsyncStorage.multiRemove([USER_KEY, ROLE_KEY]);
}

/** Migrate legacy token from AsyncStorage (@washgo_token) into SecureStore. */
export async function migrateLegacyToken() {
  try {
    const legacy = await AsyncStorage.getItem(LEGACY_ASYNC_TOKEN_KEY);
    if (legacy) {
      await SecureStore.setItemAsync(SECURE_TOKEN_KEY, legacy);
      await AsyncStorage.removeItem(LEGACY_ASYNC_TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}
