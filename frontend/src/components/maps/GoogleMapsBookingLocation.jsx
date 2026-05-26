import { APIProvider } from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';

import { GOOGLE_MAPS_API_KEY } from '../../constants/maps';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { GoogleMapsLoadGuard } from './GoogleMapsLoadGuard';
import { GoogleServiceLocationPicker } from './GoogleServiceLocationPicker';

/**
 * Booking "Where" block: Places search + Google map (requires VITE_GOOGLE_MAPS_API_KEY).
 */
export function GoogleMapsBookingLocation({
  address,
  setAddress,
  serviceLat,
  serviceLng,
  onLocationChange,
  onPlaceSelect,
  geocoding,
  geocodeError,
}) {
  const hasPin = serviceLat != null && serviceLng != null;

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'marker']} version="weekly">
      <GoogleMapsLoadGuard>
        <div className="space-y-2">
        <AddressAutocompleteInput
          value={address}
          onChange={setAddress}
          onPlaceSelect={onPlaceSelect}
          disabled={geocoding}
        />
        {geocoding ? (
          <p className="flex items-center gap-2 text-xs font-medium text-cyan-700 dark:text-cyan-300">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            {hasPin ? 'Updating location…' : 'Locating address on map…'}
          </p>
        ) : null}
        {geocodeError && !geocoding ? (
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{geocodeError}</p>
        ) : null}
        {hasPin && !geocoding && !geocodeError ? (
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Location set — drag the pin or switch map view to refine.
          </p>
        ) : null}
        </div>

        <GoogleServiceLocationPicker lat={serviceLat} lng={serviceLng} onChange={onLocationChange} />
      </GoogleMapsLoadGuard>
    </APIProvider>
  );
}
