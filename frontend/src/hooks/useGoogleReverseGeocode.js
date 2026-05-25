import { useCallback, useEffect, useRef } from 'react';

import { useMapsLibrary } from '@vis.gl/react-google-maps';

/** Prefer street-level results for service drop-off. */
const ADDRESS_TYPE_PRIORITY = [
  'street_address',
  'premise',
  'subpremise',
  'establishment',
  'point_of_interest',
  'route',
  'neighborhood',
  'sublocality_level_1',
  'sublocality',
  'locality',
];

/**
 * @param {google.maps.GeocoderResult[]} results
 * @returns {string | null}
 */
export function pickBestGeocoderResult(results) {
  if (!results?.length) return null;
  for (const type of ADDRESS_TYPE_PRIORITY) {
    const row = results.find((r) => r.types?.includes(type));
    const line = row?.formatted_address?.trim();
    if (line && line.length >= 5) return line;
  }
  const fallback = results[0]?.formatted_address?.trim();
  return fallback && fallback.length >= 5 ? fallback : null;
}

/**
 * Reverse geocode lat/lng using the Maps JavaScript Geocoder (same data as the map).
 */
export function useGoogleReverseGeocode() {
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (geocodingLib && !geocoderRef.current) {
      geocoderRef.current = new geocodingLib.Geocoder();
    }
  }, [geocodingLib]);

  const reverseGeocode = useCallback(
    (lat, lng) =>
      new Promise((resolve) => {
        if (!geocoderRef.current || !Number.isFinite(lat) || !Number.isFinite(lng)) {
          resolve(null);
          return;
        }
        geocoderRef.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK') {
              resolve(pickBestGeocoderResult(results));
              return;
            }
            resolve(null);
          },
        );
      }),
    [],
  );

  return geocodingLib ? reverseGeocode : null;
}
