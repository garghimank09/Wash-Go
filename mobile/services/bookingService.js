import { apiFetch } from './apiClient';
import { deriveCustomerPhase, isPhaseActive } from '../lib/customerBookingPhase';
import { formatCents, DEFAULT_CURRENCY } from '../lib/formatCurrency';

function encodeNotes({ packageId, vehicleSize, extra }) {
  const base = `WashGo|package:${packageId || 'super_deluxe'}|vehicle:${vehicleSize || 'sedan'}`;
  return extra ? `${base}|${extra}` : base;
}

export function decodeBookingMeta(notes) {
  if (!notes || typeof notes !== 'string') {
    return { packageId: null, vehicleSize: null };
  }
  const parts = notes.split('|');
  let packageId = null;
  let vehicleSize = null;
  for (const part of parts) {
    const [k, v] = part.split(':');
    if (k === 'package') packageId = v;
    if (k === 'vehicle') vehicleSize = v;
  }
  return { packageId, vehicleSize };
}

export const bookingService = {
  async getBookings() {
    const data = await apiFetch('/bookings', { auth: true });
    return Array.isArray(data) ? data : data.items ?? [];
  },

  async getBookingById(bookingId) {
    return apiFetch(`/bookings/${bookingId}`, { auth: true });
  },

  async create({
    carId,
    scheduledAt,
    serviceAddress,
    latitude,
    longitude,
    priceCents,
    packageId,
    vehicleSize,
    currency = DEFAULT_CURRENCY,
  }) {
    return apiFetch('/bookings', {
      method: 'POST',
      auth: true,
      body: {
        car_id: carId,
        washer_id: null,
        scheduled_at: scheduledAt,
        service_address: serviceAddress,
        latitude,
        longitude,
        price_cents: priceCents,
        currency,
        notes: encodeNotes({ packageId, vehicleSize }),
      },
    });
  },

  async cancelBooking(bookingId, { reasonKey, reasonDetail } = {}) {
    const body = { reason_key: reasonKey || 'other' };
    if (reasonDetail) body.reason_detail = reasonDetail;
    return apiFetch(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      auth: true,
      body,
    });
  },

  async rescheduleBooking(bookingId, scheduledAtIso) {
    return apiFetch(`/bookings/${bookingId}/schedule`, {
      method: 'PATCH',
      auth: true,
      body: { scheduled_at: scheduledAtIso },
    });
  },

  async getTracking(bookingId) {
    return apiFetch(`/bookings/${bookingId}/tracking`, { auth: true });
  },

  async getActiveBooking() {
    const bookings = await this.getBookings();
    return (
      bookings.find((b) => isPhaseActive(deriveCustomerPhase(b))) ?? null
    );
  },

  async sync() {
    return apiFetch('/bookings/sync', { auth: true });
  },

  async confirmHandoff(bookingId) {
    return apiFetch(`/bookings/${bookingId}/handoff/confirm`, {
      method: 'POST',
      auth: true,
    });
  },

  async reportHandoffIssue(bookingId, { reasonKey, reasonDetail } = {}) {
    const body = { reason_key: reasonKey || 'other' };
    if (reasonDetail) body.reason_detail = reasonDetail;
    return apiFetch(`/bookings/${bookingId}/handoff/report-issue`, {
      method: 'POST',
      auth: true,
      body,
    });
  },
};

export const CANCEL_REASONS = [
  { key: 'change_of_plans', label: 'Change of plans' },
  { key: 'wrong_time', label: 'Wrong time' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'price_issue', label: 'Price concern' },
  { key: 'vehicle_unavailable', label: 'Vehicle unavailable' },
  { key: 'other', label: 'Other' },
];

export const HANDOFF_ISSUE_REASONS = [
  { key: 'quality_issue', label: 'Quality not satisfactory' },
  { key: 'incomplete_wash', label: 'Wash incomplete' },
  { key: 'damage_concern', label: 'Possible damage' },
  { key: 'missing_items', label: 'Missing personal items' },
  { key: 'other', label: 'Other' },
];

/** @deprecated Prefer formatCents from lib/formatCurrency */
export function formatPriceCents(cents, currency = DEFAULT_CURRENCY) {
  return formatCents(cents, currency);
}
