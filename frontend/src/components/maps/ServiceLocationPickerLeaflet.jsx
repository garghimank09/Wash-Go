import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { LocateFixed, MapPin } from 'lucide-react';

import { DELHI_CENTER } from '../../lib/geo';
import {
  getAccurateUserPosition,
  gpsAccuracyHint,
  zoomForGpsAccuracy,
} from '../../lib/geolocation';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({
  className: '',
  html: '<span class="wg-map-pin wg-map-pin--customer" aria-hidden="true"></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
});

function MapCenterSync({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom ?? map.getZoom(), { animate: true });
  }, [map, center.lat, center.lng, zoom]);
  return null;
}

function DraggablePin({ position, onPinMove }) {
  useMapEvents({
    click(e) {
      onPinMove({ lat: e.latlng.lat, lng: e.latlng.lng, source: 'map' });
    },
  });

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={pinIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          onPinMove({ lat, lng, source: 'map' });
        },
      }}
    />
  );
}

/** Leaflet + OpenStreetMap fallback when Google Maps API key is not configured. */
export function ServiceLocationPickerLeaflet({ lat, lng, onChange, className }) {
  const position = useMemo(() => {
    if (lat != null && lng != null) return { lat, lng };
    return DELHI_CENTER;
  }, [lat, lng]);

  const [locating, setLocating] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const hasPin = lat != null && lng != null;
  const zoom = hasPin ? (gpsAccuracy != null ? zoomForGpsAccuracy(gpsAccuracy) : 17) : 12;

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

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-wg-muted">
          Drag the pin, tap the map, or use your location — the service address updates automatically.
        </p>
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

      <div className="relative overflow-hidden rounded-2xl border border-wg-border/80 shadow-inner dark:border-white/10">
        <div className="h-48 sm:h-52 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={zoom}
            className="z-0 h-full w-full"
            zoomControl
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            <MapCenterSync center={position} zoom={zoom} />
            <DraggablePin
              position={position}
              onPinMove={(payload) => {
                if (payload.source === 'map') setGpsAccuracy(null);
                onChange(payload);
              }}
            />
          </MapContainer>
        </div>

        <div className="pointer-events-none absolute bottom-2 left-2 z-[400] flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
          <MapPin className="size-3 text-emerald-300" strokeWidth={2} aria-hidden />
          {hasPin ? (
            <span className="tabular-nums">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              {gpsAccuracy != null ? ` · ±${Math.round(gpsAccuracy)}m` : ''}
            </span>
          ) : (
            <span>Set pin on map</span>
          )}
        </div>
      </div>
    </div>
  );
}
