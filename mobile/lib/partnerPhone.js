import { Alert, Linking } from 'react-native';
import Constants from 'expo-constants';

/**
 * True on physical phones; false on iOS Simulator / Android Emulator.
 */
export function isPhoneCallAvailable() {
  return Constants.isDevice !== false;
}

/**
 * Strip to characters valid inside a tel: URI (digits and leading +).
 * @returns {string} normalized dial string, or '' if unusable
 */
export function normalizeForTel(raw) {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';

  const hasPlus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');
  if (!digits || digits.length < 7) return '';

  if (hasPlus) return `+${digits}`;
  return digits;
}

export function canDialPhone(raw) {
  return normalizeForTel(raw).length >= 7;
}

function reportDialError(message, onError) {
  if (onError) {
    onError(message);
    return;
  }
  Alert.alert('Call unavailable', message);
}

/**
 * Open the native dialer with the customer number (iOS Phone / Android dialer).
 * Simulators show a clear message; real devices use tel: directly (no canOpenURL gate).
 */
export async function openPhoneCall(raw, { onError } = {}) {
  if (!canDialPhone(raw)) {
    reportDialError('No valid phone number for this customer.', onError);
    return false;
  }

  if (!isPhoneCallAvailable()) {
    reportDialError(
      'Calling requires a physical device. Simulators and emulators cannot place calls.',
      onError,
    );
    return false;
  }

  const url = `tel:${normalizeForTel(raw)}`;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    reportDialError('Could not start the call. Try again.', onError);
    return false;
  }
}
