import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Isolated partner (washer) session — kept separate from the customer
 * session so a single device can hold both without one overriding the other.
 *
 * Customer side lives in {@link ./sessionStore}.
 */

const SECURE_TOKEN_KEY = 'washgo_partner_token';
const USER_KEY = '@washgo_partner_user';
const LAST_ROLE_KEY = '@washgo_last_role';

let unauthorizedHandler = null;

export function setPartnerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function notifyPartnerUnauthorized() {
  await clearPartnerSession();
  if (unauthorizedHandler) {
    await unauthorizedHandler();
  }
}

export async function getPartnerToken() {
  try {
    return await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getCachedPartnerUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setPartnerSession(token, user) {
  await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
  if (user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  await AsyncStorage.setItem(LAST_ROLE_KEY, 'partner');
}

export async function clearPartnerSession() {
  try {
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
  } catch {
    /* ignore */
  }
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getLastActiveRole() {
  try {
    return await AsyncStorage.getItem(LAST_ROLE_KEY);
  } catch {
    return null;
  }
}

export async function setLastActiveRole(role) {
  try {
    if (role) {
      await AsyncStorage.setItem(LAST_ROLE_KEY, role);
    } else {
      await AsyncStorage.removeItem(LAST_ROLE_KEY);
    }
  } catch {
    /* ignore */
  }
}
