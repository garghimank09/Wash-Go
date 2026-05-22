import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Radio } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import { bearingDeg, haversineKm } from '../lib/geo';
import { cn } from '../lib/cn';

const DEFAULT_CENTER = [28.6139, 77.209];
const ANIM_MS = 900;

const customerIcon = L.divIcon({
  className: '',
  html: '<span class="wg-map-pin wg-map-pin--customer" aria-hidden="true"></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
});

function buildVehicleIcon(headingDeg, live) {
  const rot = headingDeg != null ? Math.round(headingDeg) : 0;
  const pulse = live ? ' wg-vehicle-marker--live' : '';
  const html = `<div class="wg-vehicle-marker${pulse}" style="transform: rotate(${rot}deg)" aria-hidden="true">
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#0e7490" stroke="#fff" stroke-width="2"/>
      <path d="M10 20c0-3.3 2.7-8 6-8s6 4.7 6 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="11" cy="21" r="2.5" fill="#fff"/>
      <circle cx="21" cy="21" r="2.5" fill="#fff"/>
      <path d="M13 11h6l1 4h-8l1-4z" fill="#22d3ee"/>
    </svg>
  </div>`;
  return L.divIcon({
    className: 'wg-vehicle-icon-wrap',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function useAnimatedPoint(target) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target) {
      setDisplay(null);
      return undefined;
    }
    if (!display) {
      setDisplay(target);
      return undefined;
    }

    const from = { lat: display.lat, lng: display.lng };
    const to = target;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / ANIM_MS);
      const ease = t * (2 - t);
      setDisplay({
        lat: from.lat + (to.lat - from.lat) * ease,
        lng: from.lng + (to.lng - from.lng) * ease,
      });
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate toward latest target only
  }, [target?.lat, target?.lng]);

  return display ?? target;
}

/** Frame route once per booking; never override after user pans/zooms. */
function FitBoundsOnce({ points, compact, bookingId }) {
  const map = useMap();
  const userAdjusted = useRef(false);
  const didInitialFit = useRef(false);
  const lastBooking = useRef(bookingId);

  useEffect(() => {
    if (bookingId !== lastBooking.current) {
      lastBooking.current = bookingId;
      userAdjusted.current = false;
      didInitialFit.current = false;
    }
  }, [bookingId]);

  useEffect(() => {
    const markUserAdjusted = () => {
      userAdjusted.current = true;
    };
    map.on('zoomstart', markUserAdjusted);
    map.on('dragstart', markUserAdjusted);
    map.on('touchstart', markUserAdjusted);
    return () => {
      map.off('zoomstart', markUserAdjusted);
      map.off('dragstart', markUserAdjusted);
      map.off('touchstart', markUserAdjusted);
    };
  }, [map]);

  useEffect(() => {
    if (!points.length || userAdjusted.current || didInitialFit.current) return;

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    const spanKm =
      points.length >= 2 ? haversineKm(points[0], points[points.length - 1]) : 0;
    let maxZoom = compact ? 15 : 16;
    if (spanKm < 2) maxZoom = compact ? 16 : 17;
    if (spanKm < 0.5) maxZoom = 17;
    map.fitBounds(bounds, { padding: [48, 48], maxZoom });
    didInitialFit.current = true;
  }, [map, points, compact]);

  return null;
}

function resolveHeading(washer, customer, route) {
  if (washer?.heading != null && washer.heading >= 0) return washer.heading;
  if (customer && washer) return bearingDeg(washer, customer);
  if (route?.length >= 2) {
    const a = route[0];
    const b = route[Math.min(1, route.length - 1)];
    return bearingDeg(a, b);
  }
  return 0;
}

const LABELS = {
  customer: {
    washer: 'Washer en route',
    drop: 'Your location',
  },
  washer: {
    washer: 'You',
    drop: 'Customer',
  },
};

/**
 * Rapido-style live map: vehicle marker, smooth movement, washer → customer route.
 * @param {'customer' | 'washer'} perspective
 */
export function LiveTrackingMap({
  tracking,
  className,
  compact = false,
  perspective = 'customer',
  /** Hide badges/legend when parent (e.g. WasherEtaRouteCard) provides its own chrome. */
  embedded = false,
}) {
  const customer = tracking?.customer;
  const washerTarget = tracking?.washer;
  const route = tracking?.route ?? [];
  const live = Boolean(tracking?.live);
  const simulated = Boolean(tracking?.simulated);
  const warning = tracking?.gps_warning;
  const labels = LABELS[perspective] ?? LABELS.customer;

  const washerAnimated = useAnimatedPoint(
    washerTarget ? { lat: washerTarget.lat, lng: washerTarget.lng } : null,
  );

  const heading = resolveHeading(washerTarget, customer, route);
  const vehicleIcon = useMemo(
    () => buildVehicleIcon(heading, live),
    [heading, live],
  );

  const routeLatLngs = useMemo(() => route.map((p) => [p.lat, p.lng]), [route]);

  /** Stable fit anchors (customer + last server washer) — not animation frames. */
  const fitPoints = useMemo(() => {
    const pts = [];
    if (customer) pts.push(customer);
    if (washerTarget) pts.push(washerTarget);
    return pts;
  }, [customer, washerTarget?.lat, washerTarget?.lng]);

  const center = useMemo(() => {
    if (customer && washerAnimated) {
      return [(customer.lat + washerAnimated.lat) / 2, (customer.lng + washerAnimated.lng) / 2];
    }
    if (customer) return [customer.lat, customer.lng];
    if (washerAnimated) return [washerAnimated.lat, washerAnimated.lng];
    return DEFAULT_CENTER;
  }, [customer, washerAnimated]);

  const mapKey = tracking?.booking_id ?? 'tracking-map';

  if (!customer) {
    return (
      <div
        className={cn(
          'flex h-full items-center justify-center bg-slate-900/80 text-xs text-white/60',
          className,
        )}
      >
        Map loading…
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative h-full w-full [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full',
        className,
      )}
    >
      {warning ? (
        <div className="absolute inset-x-0 top-0 z-[450] border-b border-amber-400/30 bg-amber-950/90 px-3 py-1.5 text-[10px] font-medium leading-snug text-amber-50">
          {warning}
        </div>
      ) : null}

      {!embedded ? (
        <div className="absolute inset-x-0 top-2 z-[450] flex justify-center px-2 pointer-events-none">
          {live ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
              <Radio className="size-3 wg-partner-live-dot" strokeWidth={2} aria-hidden />
              Live GPS
            </span>
          ) : simulated ? (
            <span className="rounded-full border border-cyan-400/35 bg-cyan-900/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-50 shadow-lg">
              Estimated route
            </span>
          ) : null}
        </div>
      ) : null}

      <MapContainer
        key={mapKey}
        center={center}
        zoom={15}
        className="h-full w-full z-0"
        zoomControl
        attributionControl={!compact}
        scrollWheelZoom
        touchZoom
        doubleClickZoom
        boxZoom
        dragging
        zoomSnap={0.5}
        zoomDelta={0.5}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        {routeLatLngs.length > 1 ? (
          <Polyline
            positions={routeLatLngs}
            pathOptions={{
              color: '#3b82f6',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        ) : null}
        {washerAnimated ? (
          <Marker
            key={`washer-${Math.round(heading)}-${live}`}
            position={[washerAnimated.lat, washerAnimated.lng]}
            icon={vehicleIcon}
          />
        ) : null}
        <Marker position={[customer.lat, customer.lng]} icon={customerIcon} />
        {fitPoints.length ? (
          <FitBoundsOnce points={fitPoints} compact={compact} bookingId={mapKey} />
        ) : null}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-2 left-2 z-[400] flex flex-col gap-1 rounded-lg border border-white/20 bg-black/55 px-2.5 py-1.5 text-[10px] font-bold text-white/90 backdrop-blur-md">
        {washerAnimated ? (
          <span className="flex items-center gap-1.5">
            <span
              className={cn('size-2.5 rounded-full bg-cyan-400', live && 'wg-map-pin--live')}
              aria-hidden
            />
            {labels.washer}
          </span>
        ) : null}
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_rgb(52_211_153/0.8)]"
            aria-hidden
          />
          {labels.drop}
        </span>
        {tracking?.distance_km != null ? (
          <span className="font-normal text-white/70">
            {tracking.distance_km} km · {tracking.eta_minutes ?? '—'} min
          </span>
        ) : null}
      </div>
    </div>
  );
}
