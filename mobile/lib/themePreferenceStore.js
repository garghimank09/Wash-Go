import AsyncStorage from '@react-native-async-storage/async-storage';

/** @deprecated Global key — migrated once into the first scoped key that loads. */
export const LEGACY_THEME_STORAGE_KEY = '@washgo_theme_preference';

const STORAGE_PREFIX = '@washgo_theme:v1';

export const THEME_PREFERENCES = ['system', 'light', 'dark'];

export function themeStorageKey(portal, userId) {
  if (!portal || userId == null || userId === '') return null;
  return `${STORAGE_PREFIX}:${portal}:${String(userId)}`;
}

export function isValidThemePreference(value) {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Customer stack routes live outside `(customer)` — keep theme scoped to customer portal.
 */
export function portalFromSegments(segments) {
  const root = segments?.[0] ?? '';
  if (root === '(partner)') return 'partner';
  if (root === '(customer)') return 'customer';
  if (['booking', 'new-wash', 'add-vehicle', 'vehicle'].includes(root)) {
    return 'customer';
  }
  return null;
}

export async function loadThemePreference(portal, userId) {
  const key = themeStorageKey(portal, userId);
  if (!key) return 'system';

  try {
    let saved = await AsyncStorage.getItem(key);
    if (!saved) {
      const legacy = await AsyncStorage.getItem(LEGACY_THEME_STORAGE_KEY);
      if (isValidThemePreference(legacy)) {
        await AsyncStorage.setItem(key, legacy);
        saved = legacy;
      }
    }
    return isValidThemePreference(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

export async function saveThemePreference(portal, userId, preference) {
  const key = themeStorageKey(portal, userId);
  if (!key || !isValidThemePreference(preference)) return;
  await AsyncStorage.setItem(key, preference);
}
