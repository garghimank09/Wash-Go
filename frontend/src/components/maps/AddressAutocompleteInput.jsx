import { useEffect, useRef } from 'react';

import { useMapsLibrary } from '@vis.gl/react-google-maps';

import { cn } from '../../lib/cn';

/**
 * Google Places Autocomplete on a text input (India-biased).
 * @param {{ value: string, onChange: (v: string) => void, onPlaceSelect: (p: { address: string, lat: number, lng: number }) => void, disabled?: boolean, className?: string }} props
 */
export function AddressAutocompleteInput({ value, onChange, onPlaceSelect, disabled, className }) {
  const inputRef = useRef(null);
  const places = useMapsLibrary('places');
  const onPlaceSelectRef = useRef(onPlaceSelect);
  onPlaceSelectRef.current = onPlaceSelect;

  useEffect(() => {
    if (!places || !inputRef.current) return undefined;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'in' },
      fields: ['formatted_address', 'geometry', 'name', 'address_components', 'place_id'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const loc = place?.geometry?.location;
      if (!loc) return;

      const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
      const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const name = (place.name || '').trim();
      const formatted = (place.formatted_address || '').trim();
      let address = formatted;
      if (name && formatted && !formatted.toLowerCase().startsWith(name.toLowerCase())) {
        address = `${name}, ${formatted}`;
      } else if (!formatted && name) {
        address = name;
      }

      if (address.length < 5) return;

      onPlaceSelectRef.current({ address, lat, lng, source: 'places' });
    });

    return () => {
      if (listener && typeof window !== 'undefined' && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [places]);

  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-sm font-medium text-wg-muted">Service address</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Search address (Google Maps)"
        autoComplete="off"
        className={cn(
          'w-full rounded-xl border border-wg-border bg-wg-surface-elevated/90 px-4 py-2.5 text-wg-text shadow-inner backdrop-blur-sm',
          'placeholder:text-wg-muted/70 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30',
        )}
      />
    </label>
  );
}
