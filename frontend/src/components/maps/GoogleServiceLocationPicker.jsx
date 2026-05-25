import { useCallback, useMemo, useRef, useState } from 'react';
import { AdvancedMarker, Map, Marker } from '@vis.gl/react-google-maps';
import toast from 'react-hot-toast';
import { LocateFixed, MapPin } from 'lucide-react';

import { DEFAULT_MAP_CENTER, GOOGLE_MAP_ID } from '../../constants/maps';
import { useGoogleReverseGeocode } from '../../hooks/useGoogleReverseGeocode';
import {
  getAccurateUserPosition,
  gpsAccuracyHint,
  zoomForGpsAccuracy,
} from '../../lib/geolocation';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';
import { MapViewToolbar, mapOptionsForViewMode } from './MapViewToolbar';

function coordsFromEvent(e) {
  const latLng = e?.latLng;
  if (!latLng) return null;
  const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
  const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/** Google Maps picker with 2D/3D/satellite views and draggable pin. */
export function GoogleServiceLocationPicker({ lat, lng, onChange, className }) {
  const hasPin = lat != null && lng != null;
  const position = useMemo(() => {
    if (hasPin) return { lat, lng };
    return DEFAULT_MAP_CENTER;
  }, [hasPin, lat, lng]);

  const [locating, setLocating] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [viewMode, setViewMode] = useState('2d');
  const { mapTypeId, tilt } = mapOptionsForViewMode(viewMode);
  const zoom = hasPin ? (gpsAccuracy != null ? zoomForGpsAccuracy(gpsAccuracy) : 17) : 12;
  const reverseGeocode = useGoogleReverseGeocode();
  const reverseSeqRef = useRef(0);

  const emitPin = useCallback(
    async (coords, meta = {}) => {
      if (!coords) return;
      const seq = ++reverseSeqRef.current;
      const base = {
        lat: coords.lat,
        lng: coords.lng,
        source: meta.source || 'map',
        ...meta,
      };

      if (reverseGeocode) {
        const address = await reverseGeocode(coords.lat, coords.lng);
        if (seq !== reverseSeqRef.current) return;
        onChange(address ? { ...base, address } : base);
        return;
      }

      onChange(base);
    },
    [onChange, reverseGeocode],
  );

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    try {
      const fix = await getAccurateUserPosition();
      setGpsAccuracy(fix.accuracyMeters);
      onChange({
        lat: fix.lat,
        lng: fix.lng,
        source: 'gps',
        accuracyMeters: fix.accuracyMeters,
      });
      const hint = gpsAccuracyHint(fix.accuracyMeters);
      if (hint) toast(hint, { icon: '📍', duration: 5000 });
      else toast.success('Location set — adjust the pin if needed.', { duration: 2800 });
    } catch (err) {
      setGpsAccuracy(null);
      toast.error(err?.message || 'Could not get your location.');
    } finally {
      setLocating(false);
    }
  }, [onChange]);

  const handleMapClick = useCallback(
    (e) => {
      setGpsAccuracy(null);
      void emitPin(coordsFromEvent(e));
    },
    [emitPin],
  );

  const handleDragEnd = useCallback(
    (e) => {
      setGpsAccuracy(null);
      void emitPin(coordsFromEvent(e));
    },
    [emitPin],
  );

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MapViewToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => void useMyLocation()}
          disabled={locating}
        >
          <LocateFixed className={cn('size-3.5', locating && 'animate-pulse')} strokeWidth={2} aria-hidden />
          {locating ? 'Getting GPS…' : 'Use my location'}
        </Button>
      </div>

      <p className="text-xs font-medium text-wg-muted">
        Tap the map, drag the pin, or use GPS — address updates via Google Maps.
      </p>

      <div className="relative overflow-hidden rounded-2xl border border-wg-border/80 shadow-inner dark:border-white/10">
        <div className="h-52 sm:h-56">
          <Map
            center={position}
            zoom={zoom}
            mapTypeId={mapTypeId}
            tilt={tilt}
            mapId={GOOGLE_MAP_ID || undefined}
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl
            fullscreenControl
            onClick={handleMapClick}
            className="h-full w-full"
            reuseMaps
          >
            {hasPin ? (
              GOOGLE_MAP_ID ? (
                <AdvancedMarker position={position} draggable onDragEnd={handleDragEnd}>
                  <span className="wg-map-pin wg-map-pin--customer block" aria-hidden />
                </AdvancedMarker>
              ) : (
                <Marker position={position} draggable onDragEnd={handleDragEnd} />
              )
            ) : null}
          </Map>
        </div>

        <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
          <MapPin className="size-3 text-emerald-300" strokeWidth={2} aria-hidden />
          {hasPin ? (
            <span className="tabular-nums">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              {gpsAccuracy != null ? ` · ±${Math.round(gpsAccuracy)}m` : ''}
            </span>
          ) : (
            <span>Tap map to set pin</span>
          )}
        </div>
      </div>
    </div>
  );
}
