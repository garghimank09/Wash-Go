import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@washgo_profile_preferences';

const DEFAULTS = {
  pushNotifications: true,
  bookingReminders: true,
  marketingEmails: false,
  language: 'English',
  darkMode: 'system',
};

export async function loadProfilePreferences() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveProfilePreferences(partial) {
  const current = await loadProfilePreferences();
  const next = { ...current, ...partial };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
