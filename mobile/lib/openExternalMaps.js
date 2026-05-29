import { Alert, Linking, Platform } from 'react-native';
import { geocodeService } from '../services/geocodeService';
import { numberOrNull } from './partnerMappers';

function normalizeCoords(input = {}) {
  const latitude = numberOrNull(input.latitude ?? input.lat);
  const longitude = numberOrNull(input.longitude ?? input.lng);
  if (latitude == null || longitude == null) return null;
  return { latitude, longitude };
}

function encodeLabel(label) {
  return encodeURIComponent(String(label || 'Destination').trim() || 'Destination');
}

function buildMapPinUrl({ latitude, longitude, label }) {
  const safeLabel = encodeLabel(label);
  if (Platform.OS === 'ios') {
    return `maps:0,0?q=${safeLabel}@${latitude},${longitude}`;
  }
  return `geo:${latitude},${longitude}?q=${latitude},${longitude}(${safeLabel})`;
}

function buildTurnByTurnUrls({ latitude, longitude, label }) {
  const safeLabel = encodeLabel(label);
  if (Platform.OS === 'ios') {
    return [`maps://?daddr=${latitude},${longitude}&dirflg=d`];
  }
  return [
    `google.navigation:q=${latitude},${longitude}`,
    `geo:${latitude},${longitude}?q=${latitude},${longitude}(${safeLabel})`,
    `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
  ];
}

async function openFirstAvailableUrl(urls) {
  const list = Array.isArray(urls) ? urls : [urls];
  for (const url of list) {
    try {
      await Linking.openURL(url);
      return true;
    } catch {
      /* try next scheme */
    }
  }
  return false;
}

export function showMapsError(title, message) {
  Alert.alert(title, message);
}

/**
 * Open the destination as a named pin in the platform maps app.
 */
export async function openMapPin({ latitude, longitude, label = 'Destination' }) {
  const lat = numberOrNull(latitude);
  const lng = numberOrNull(longitude);
  if (lat == null || lng == null) {
    showMapsError('Location unavailable', 'This stop does not have map coordinates yet.');
    return false;
  }

  const opened = await openFirstAvailableUrl(
    buildMapPinUrl({ latitude: lat, longitude: lng, label }),
  );
  if (!opened) {
    showMapsError('Maps unavailable', 'Could not open your maps app for this destination.');
  }
  return opened;
}

/**
 * Launch turn-by-turn navigation to a destination (uses device GPS as origin).
 */
export async function openTurnByTurnNavigation({ latitude, longitude, label = 'Destination' }) {
  const lat = numberOrNull(latitude);
  const lng = numberOrNull(longitude);
  if (lat == null || lng == null) {
    showMapsError('Location unavailable', 'This stop does not have map coordinates yet.');
    return false;
  }

  const opened = await openFirstAvailableUrl(
    buildTurnByTurnUrls({ latitude: lat, longitude: lng, label }),
  );
  if (!opened) {
    showMapsError('Navigation unavailable', 'Could not open navigation for this destination.');
  }
  return opened;
}

/**
 * Resolve coordinates from booking coords or geocode the address string.
 */
export async function resolveCoordsOrGeocode({ coords, address }) {
  const direct = normalizeCoords(coords || {});
  if (direct) return direct;

  const trimmed = String(address || '').trim();
  if (trimmed.length < 3) {
    throw new Error('Address is too short to locate on the map.');
  }

  const result = await geocodeService.resolve(trimmed);
  const latitude = numberOrNull(result?.lat);
  const longitude = numberOrNull(result?.lng);
  if (latitude == null || longitude == null || result?.found === false) {
    throw new Error('Could not locate this address on the map.');
  }
  return { latitude, longitude };
}

/**
 * Resolve coords (with geocode fallback) then open turn-by-turn navigation.
 */
export async function navigateToAddress({ coords, address, label }) {
  try {
    const resolved = await resolveCoordsOrGeocode({ coords, address });
    return openTurnByTurnNavigation({
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      label: label || address || 'Destination',
    });
  } catch (err) {
    showMapsError(
      'Navigation unavailable',
      err?.message || 'Could not locate this address for navigation.',
    );
    return false;
  }
}
