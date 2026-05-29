/**
 * Adapters from backend DTOs to UI view-models.
 *
 * Keep all field-name massaging in this file so the screens stay agnostic
 * about API shape changes. Existing presentational components (cards,
 * timelines, sheets) already speak the camelCase shape mirrored here.
 */

import { photoUrl } from '../services/partnerPhotoService';
import { decodeBookingMeta } from '../services/bookingService';
import { getPackage, getVehicleSize } from '../services/pricingService';
import { DEFAULT_CURRENCY } from './formatCurrency';
import { partnerEarningsCents } from './partnerEarnings';
import { formatPartnerServiceDescriptor } from './partnerServiceDescriptor';
import { buildFieldBriefing } from './parseBookingBriefing';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function initialOf(name) {
  if (!name) return '?';
  const trimmed = String(name).trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}

function safeDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isoDateKey(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Coerce numeric backend decimals to plain numbers (latitude/longitude). */
export function numberOrNull(value) {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Map a `BookingRead` (assigned to washer) to the schedule/active-job card
 * shape the UI already consumes.
 */
export function mapBookingToCard(booking) {
  if (!booking) return null;
  const scheduledAt = booking.scheduled_at;
  const customerName = booking.customer_name || booking.customer?.full_name || 'Customer';
  return {
    id: booking.id,
    bookingId: booking.id,
    status: booking.status,
    scheduledAt,
    customer: {
      name: customerName,
      initial: initialOf(customerName),
      phoneMasked: booking.customer_phone || null,
    },
    address: booking.service_address || '',
    coords: {
      lat: numberOrNull(booking.latitude),
      lng: numberOrNull(booking.longitude),
    },
    priceCents: booking.price_cents || 0,
    partnerPayoutCents: partnerEarningsCents(booking.price_cents),
    currency: booking.currency || DEFAULT_CURRENCY,
    packageLabel: booking.notes ?? null,
    vehicleLabel: booking.car_label ?? null,
  };
}

/** Map a `BookingOfferRead` into the offer card shape used on the offers tab. */
export function mapOfferCard(offer) {
  if (!offer) return null;
  const customerName = offer.customer_name || 'Customer';
  return {
    id: offer.id,
    customer: {
      name: customerName,
      initial: initialOf(customerName),
    },
    address: offer.service_address || '',
    scheduledAt: offer.scheduled_at,
    priceCents: offer.price_cents || 0,
    partnerPayoutCents: partnerEarningsCents(offer.price_cents),
    currency: offer.currency || DEFAULT_CURRENCY,
    packageLabel: null,
    vehicleLabel: offer.car_label ?? null,
  };
}

/**
 * Map a `BookingDetailRead` to the active-job view-model used by the job
 * screen.  Customer info, briefing tags, package, address, and photo URLs
 * are surfaced for the existing premium components.
 */
export function mapBookingDetail(detail) {
  if (!detail) return null;
  const customerName = detail.customer_name || 'Customer';
  const lat = numberOrNull(detail.latitude);
  const lng = numberOrNull(detail.longitude);
  const pkgTitle = formatPartnerServiceDescriptor(detail.notes);
  const { packageId, vehicleSize } = decodeBookingMeta(detail.notes);
  const pkgMeta = packageId ? getPackage(packageId) : null;
  const sizeMeta = vehicleSize ? getVehicleSize(vehicleSize) : null;

  return {
    id: detail.id,
    bookingId: detail.id,
    customerId: detail.customer_id ?? null,
    status: detail.status,
    service_phase: detail.service_phase ?? null,
    arrival_condition_notes: detail.arrival_condition_notes ?? null,
    handoff_status: detail.handoff_status || 'none',
    handoff_requested_at: detail.handoff_requested_at ?? null,
    handoff_resolved_at: detail.handoff_resolved_at ?? null,
    scheduledAt: detail.scheduled_at,
    currency: detail.currency || DEFAULT_CURRENCY,
    payoutCents: partnerEarningsCents(detail.price_cents),
    surgeBonusCents: 0,
    customer: {
      name: customerName,
      initial: initialOf(customerName),
      phone: detail.customer_phone || null,
      phoneMasked: detail.customer_phone || null,
      premium: false,
      rating: null,
      completedWashes: null,
    },
    address: {
      line1: detail.service_address || '',
      line2: '',
      city: '',
      full: detail.service_address || '',
      coords: lat != null && lng != null ? { latitude: lat, longitude: lng } : null,
    },
    vehicle: {
      label: detail.car_label ?? '',
      plate: '',
      color: '',
      type: sizeMeta?.label ?? '',
    },
    package: {
      label: pkgTitle || pkgMeta?.label || null,
      durationMins: null,
      items: Array.isArray(pkgMeta?.features) ? pkgMeta.features : [],
    },
    briefing: buildFieldBriefing({
      notes: detail.notes,
      arrivalConditionNotes: detail.arrival_condition_notes,
    }),
    timeline: Array.isArray(detail.timeline) ? detail.timeline : [],
    photos: Array.isArray(detail.photos)
      ? detail.photos.map((p) => ({
          id: p.id,
          kind: p.kind,
          url: photoUrl(p.url),
          createdAt: p.created_at,
        }))
      : [],
    etaMinutes: detail.eta_minutes,
    washer: detail.washer || null,
  };
}

/** Map `BookingTrackingRead` to a coords-friendly shape for the map card. */
export function mapTracking(tracking) {
  if (!tracking) return null;
  const washer = tracking.washer
    ? { latitude: tracking.washer.lat, longitude: tracking.washer.lng }
    : null;
  const customer = tracking.customer
    ? { latitude: tracking.customer.lat, longitude: tracking.customer.lng }
    : null;
  const route = Array.isArray(tracking.route)
    ? tracking.route.map((p) => ({ latitude: p.lat, longitude: p.lng }))
    : [];
  return {
    washerCoord: washer,
    customerCoord: customer,
    route,
    etaMinutes: tracking.eta_minutes ?? null,
    distanceKm: tracking.distance_km ?? null,
    live: !!tracking.live,
    simulated: !!tracking.simulated,
  };
}

/**
 * Aggregate stats from the washer's booking list. Used for the home stats
 * grid + earnings charts in the absence of a dedicated earnings API.
 */
export function summarizeBookings(items = []) {
  const startOfTodayMs = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const startOfWeekMs = startOfTodayMs - 6 * DAY;

  let todayCount = 0;
  let activeCount = 0;
  let completedToday = 0;
  let earningsTodayCents = 0;
  let earningsWeekCents = 0;

  for (const b of items) {
    const d = safeDate(b.scheduled_at);
    if (!d) continue;
    const ms = d.getTime();
    if (ms >= startOfTodayMs && ms < startOfTodayMs + DAY) todayCount += 1;
    if (['confirmed', 'in_progress'].includes(b.status)) activeCount += 1;
    if (b.status === 'completed' && ms >= startOfTodayMs) {
      completedToday += 1;
      earningsTodayCents += partnerEarningsCents(b.price_cents);
    }
    if (b.status === 'completed' && ms >= startOfWeekMs) {
      earningsWeekCents += partnerEarningsCents(b.price_cents);
    }
  }

  return {
    todayBookings: todayCount,
    activeJobs: activeCount,
    completedToday,
    earningsTodayCents,
    earningsWeekCents,
  };
}

/** Group bookings by `YYYY-MM-DD` for the schedule day selector. */
export function groupBookingsByDate(items = []) {
  const map = new Map();
  for (const b of items) {
    const d = safeDate(b.scheduled_at);
    if (!d) continue;
    const key = isoDateKey(d);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(b);
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  }
  return map;
}

/** Build a 14-day schedule window starting today, with booking counts. */
export function buildScheduleDays(items = [], days = 14) {
  const grouped = groupBookingsByDate(items);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = isoDateKey(d);
    result.push({
      key,
      date: d.toISOString(),
      weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString(undefined, { month: 'short' }),
      isToday: i === 0,
      bookings: grouped.get(key) || [],
    });
  }
  return result;
}

/** Weekly earnings series for the chart (last 7 days incl. today). */
export function buildWeeklySeries(items = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      key: isoDateKey(d),
      day: d.toLocaleDateString(undefined, { weekday: 'short' }),
      cents: 0,
      jobs: 0,
    };
  });
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const b of items) {
    if (b.status !== 'completed') continue;
    const d = safeDate(b.updated_at || b.scheduled_at);
    if (!d) continue;
    d.setHours(0, 0, 0, 0);
    const slot = byKey.get(isoDateKey(d));
    if (!slot) continue;
    slot.cents += partnerEarningsCents(b.price_cents);
    slot.jobs += 1;
  }
  return buckets;
}

