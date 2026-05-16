import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed, MapPin } from 'lucide-react';

import { DELHI_CENTER } from '../lib/geo';
import { cn } from '../lib/cn';
import { Button } from '../ui/button';
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

function DraggablePin({ position, onDragEnd }) {
  useMapEvents({
    click(e) {
      onDragEnd({ lat: e.latlng.lat, lng: e.latlng.lng });
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
          onDragEnd({ lat, lng });
        },
      }}
    />
  );
}

/** Pick exact service coordinates (Rapido-style drop pin). */
export function ServiceLocationPicker({ lat, lng, onChange, className }) {
  const position = useMemo(() => {
    if (lat != null && lng != null) return { lat, lng };
    return DELHI_CENTER;
  }, [lat, lng]);

  const [locating, setLocating] = useState(false);
  const hasPin = lat != null && lng != null;
  const zoom = hasPin ? 16 : 12;

  const useMyLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  }, [onChange]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-wg-muted">
          Drag the pin or tap the map for your exact spot (gate, parking, building).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={useMyLocation}
          disabled={locating}
        >
          <LocateFixed className="size-3.5" strokeWidth={2} aria-hidden />
          {locating ? 'Locating…' : 'Use my location'}
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
            <DraggablePin position={position} onDragEnd={onChange} />
          </MapContainer>
        </div>

        <div className="pointer-events-none absolute bottom-2 left-2 z-[400] flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
          <MapPin className="size-3 text-emerald-300" strokeWidth={2} aria-hidden />
          {hasPin ? (
            <span className="tabular-nums">
              {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </span>
          ) : (
            <span>Set pin on map</span>
          )}
        </div>
      </div>
    </div>
  );
}
