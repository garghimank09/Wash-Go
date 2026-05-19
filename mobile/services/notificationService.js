import AsyncStorage from '@react-native-async-storage/async-storage';

const DISMISSED_KEY = '@washgo_notif_dismissed';
const LAST_READ_KEY = '@washgo_notif_last_read';

export async function loadDismissedIds() {
  try {
    const raw = await AsyncStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveDismissedIds(ids) {
  try {
    await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('Failed to save dismissed notifications:', err);
  }
}

export async function loadLastReadAt() {
  try {
    const raw = await AsyncStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;
    const ts = Number(raw);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

export async function saveLastReadAt(timestamp) {
  try {
    await AsyncStorage.setItem(LAST_READ_KEY, String(timestamp));
  } catch (err) {
    console.warn('Failed to save last read timestamp:', err);
  }
}

export async function clearNotificationStorage() {
  try {
    await AsyncStorage.multiRemove([DISMISSED_KEY, LAST_READ_KEY]);
  } catch (err) {
    console.warn('Failed to clear notification storage:', err);
  }
}
