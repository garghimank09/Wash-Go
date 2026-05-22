import { VEHICLE_SIZES } from '../constants/config';

const WASHGO_PREFIX = /^WashGo\|/i;

/**
 * @param {string | null | undefined} notes
 * @param {{ id: string, label?: string }[] | undefined} tiers
 */
export function parseBookingMeta(notes, tiers) {
  const raw = (notes || '').trim();
  if (!raw) {
    return {
      packageId: null,
      vehicleSize: null,
      packageLabel: null,
      vehicleSizeLabel: null,
      customerNotes: null,
    };
  }

  const packageId = raw.match(/(?:^|\|)package:([a-z0-9_]+)/i)?.[1]?.toLowerCase() ?? null;
  const vehicleSize = raw.match(/(?:^|\|)vehicle:([a-z]+)/i)?.[1]?.toLowerCase() ?? null;

  const packageLabel = packageId
    ? (tiers?.find((p) => p.id === packageId)?.label ?? packageId)
    : null;
  const vehicleSizeLabel = vehicleSize
    ? (VEHICLE_SIZES.find((v) => v.id === vehicleSize)?.label ?? vehicleSize)
    : null;

  let customerNotes = raw;
  if (WASHGO_PREFIX.test(raw)) {
    const parts = raw.split('|').filter((p) => {
      const s = p.trim();
      if (!s || /^WashGo$/i.test(s)) return false;
      if (/^package:/i.test(s) || /^vehicle:/i.test(s)) return false;
      return true;
    });
    customerNotes = parts.join(' · ').trim() || null;
  }

  return {
    packageId,
    vehicleSize,
    packageLabel,
    vehicleSizeLabel,
    customerNotes,
  };
}

/**
 * @param {object} booking API row with optional notes + packageLabel
 * @param {{ id: string, label?: string }[] | undefined} tiers
 */
export function withBookingMeta(booking, tiers) {
  if (!booking) return booking;
  const meta = parseBookingMeta(booking.notes, tiers);
  return {
    ...booking,
    packageId: meta.packageId ?? booking.packageId ?? null,
    vehicleSize: meta.vehicleSize ?? booking.vehicleSize ?? null,
    packageLabel: meta.packageLabel ?? booking.packageLabel ?? null,
    vehicleSizeLabel: meta.vehicleSizeLabel ?? booking.vehicleSizeLabel ?? null,
    notes: meta.customerNotes ?? (meta.packageId ? null : booking.notes),
  };
}
