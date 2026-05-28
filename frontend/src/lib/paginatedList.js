/** Shared client-side list filtering, sorting, and pagination (10 per page default). */

export const DEFAULT_PAGE_SIZE = 10;

export function normQuery(q) {
  return String(q || '')
    .toLowerCase()
    .trim();
}

export function paginateSlice(items, page, pageSize = DEFAULT_PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPagesFor(count, pageSize = DEFAULT_PAGE_SIZE) {
  return Math.max(1, Math.ceil(count / pageSize));
}

const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'in_progress']);

export function matchCustomerBookingStatus(booking, filter) {
  if (!filter || filter === 'all') return true;
  if (filter === 'active') return ACTIVE_STATUSES.has(booking.status);
  return booking.status === filter;
}

export function searchBookingRow(booking, q) {
  if (!q) return true;
  const hay = [
    booking.service_address,
    booking.status,
    booking.car_label,
    booking.customer_name,
    booking.washer_name,
    booking.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

export function compareByScheduledAt(a, b, sort = 'newest') {
  const ta = new Date(a.scheduled_at).getTime();
  const tb = new Date(b.scheduled_at).getTime();
  return sort === 'oldest' ? ta - tb : tb - ta;
}

export const CUSTOMER_BOOKING_STATUS_OPTIONS = [
  'all',
  'active',
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export function statusOptionLabel(value) {
  if (value === 'all') return 'All statuses';
  if (value === 'active') return 'Active';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
