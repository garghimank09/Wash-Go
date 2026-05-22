/** Map API admin fleet rows to washer grid cards (live + derived metrics). */
export function fleetWashersToGridRows(fleetItems) {
  return (fleetItems || []).map((w) => {
    const rating = Number(w.rating_avg) || 0;
    const activeJobs = Number(w.active_jobs) || 0;
    const completed7d = Number(w.completed7d) || 0;
    const trustScore = Math.min(99, Math.round(78 + rating * 4 + Math.min(8, completed7d)));
    return {
      id: String(w.id),
      name: w.full_name,
      active: !!w.is_available,
      rating,
      acceptancePct: Math.min(99, 88 + Math.round(rating * 2)),
      utilizationPct: Math.min(100, activeJobs * 28 + completed7d * 3),
      completed7d,
      completed30d: completed7d * 4,
      completed: completed7d * 12,
      onTimePct: Math.min(99, 90 + Math.round(rating * 2)),
      trustScore,
      revenue7dCents: completed7d * 2200,
      trend7d: Array.from({ length: 7 }, () => completed7d),
      region: w.service_area || '—',
      topBadge: activeJobs > 0 ? 'On job' : w.is_available ? 'Available' : 'Offline',
      source: 'live',
    };
  });
}

import { parseBookingMeta } from './bookingMeta';

/** Map API admin booking rows to ops-desk table / dispatch shapes. */

export function toAdminTableRow(b) {
  const id = String(b.id);
  const shortId = id.length > 8 ? `${id.slice(0, 8)}…` : id;
  return {
    id: shortId,
    rawId: id,
    customer: b.customer_name || 'Customer',
    washer: b.washer_name || '—',
    scheduledAt: b.scheduled_at,
    status: b.status,
    priceCents: b.price_cents ?? 0,
    city: b.city || '—',
  };
}

export function toDispatchQueueItem(b, index) {
  const id = String(b.id);
  const mins = Math.round((new Date(b.scheduled_at).getTime() - Date.now()) / 60000);
  const priorityLabel =
    mins <= 120 && mins >= 0 ? `SLA · starts in ${mins}m` : mins < 0 ? 'Overdue window' : 'Scheduled';
  const { packageLabel } = parseBookingMeta(b.notes);
  return {
    id,
    customer: b.customer_name || 'Customer',
    zone: b.city || b.service_address?.split(',')[0] || 'Zone',
    scheduledAt: b.scheduled_at,
    priceCents: b.price_cents ?? 0,
    priorityLabel,
    priorityRank: index + 1,
    packageLabel: packageLabel ?? 'On-demand',
  };
}

export function washerToSuggestion(w, index) {
  return {
    washerId: w.id,
    name: w.full_name,
    distanceLabel: w.service_area || 'Available',
    score: Math.max(70, 98 - index * 4),
    priorityReason: index === 0 ? 'Highest rating · available' : 'Backup capacity',
  };
}

export function computeAdminKpis(bookings) {
  const now = Date.now();
  const d30 = now - 30 * 86400000;
  const recent = bookings.filter((b) => new Date(b.scheduled_at).getTime() >= d30);
  const completed = recent.filter((b) => b.status === 'completed');
  const revenue30dCents = completed.reduce((s, b) => s + (Number(b.price_cents) || 0), 0);
  const pendingAssignment = bookings.filter(
    (b) => b.status === 'pending' && !b.washer_id,
  ).length;
  const inProgress = bookings.filter((b) => b.status === 'in_progress').length;
  const active = bookings.filter((b) =>
    ['pending', 'confirmed', 'in_progress'].includes(b.status),
  ).length;
  const washerIds = new Set(
    bookings.filter((b) => b.washer_id).map((b) => String(b.washer_id)),
  );
  const allCompleted = bookings.filter((b) => b.status === 'completed').length;
  const allCancelled = bookings.filter((b) => b.status === 'cancelled').length;
  const csatDenom = allCompleted + allCancelled;
  const csatScore =
    csatDenom > 0 ? Math.round((allCompleted / csatDenom) * 47) / 10 : 0;
  return {
    revenue30dCents,
    bookings30d: recent.length,
    activeWashers: washerIds.size,
    openComplaints: 0,
    csatScore,
    customerGrowthPct: 0,
    avgTicketCents: completed.length
      ? Math.round(revenue30dCents / completed.length)
      : 0,
    repeatCustomerPct: 0,
    refundsPending: bookings.filter((b) => b.status === 'cancelled').length,
    avgAcceptancePct: 0,
    pendingAssignment,
    inProgress,
    active,
  };
}

export function phaseForStatus(status, washerId) {
  if (status === 'pending') return washerId ? 'Awaiting confirm' : 'Matching';
  if (status === 'confirmed') return 'Scheduled / en route';
  if (status === 'in_progress') return 'In progress';
  return status;
}

/** Human-readable lateness (minutes since scheduled_at). */
export function formatLateness(minutes) {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m}m`;
  if (m < 24 * 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  }
  const d = Math.floor(m / (24 * 60));
  const h = Math.floor((m % (24 * 60)) / 60);
  if (d >= 3) return `${d}d+`;
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

function shortId(id) {
  const s = String(id);
  return s.length > 8 ? `${s.slice(0, 8)}…` : s;
}

export function computeActiveMonitorRows(bookings) {
  const now = Date.now();
  return bookings
    .filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 12)
    .map((b) => {
      const startMs = new Date(b.scheduled_at).getTime();
      const slip =
        ['in_progress', 'confirmed'].includes(b.status) && now > startMs
          ? Math.max(0, Math.round((now - startMs) / 60000))
          : 0;
      return {
        id: shortId(b.id),
        rawId: String(b.id),
        customer: b.customer_name || 'Customer',
        washer: b.washer_name || '—',
        phase: phaseForStatus(b.status, b.washer_id),
        zone: b.city || '—',
        etaSlipMinutes: slip,
        status: b.status,
        source: 'live',
      };
    });
}

export function computeLiveHealthScores(kpis, bookings, dispatchWashers = []) {
  const dispatch = Math.max(48, Math.min(98, 96 - kpis.pendingAssignment * 5));
  const available = dispatchWashers.filter((w) => w.is_available).length;
  const total = dispatchWashers.length;
  const fleetBase = total > 0 ? Math.round((available / total) * 100) : 72;
  const fleet = Math.max(50, Math.min(98, fleetBase + Math.min(8, kpis.inProgress)));
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const csat = completed > 0 ? Math.min(96, 86 + Math.min(10, Math.floor(completed / 3))) : 91;
  return { dispatch, fleet, csat };
}

export function computeDelayedJobs(bookings) {
  const now = Date.now();
  return bookings
    .filter((b) => {
      const start = new Date(b.scheduled_at).getTime();
      const lateMin = (now - start) / 60000;
      return lateMin >= 15 && ['pending', 'confirmed', 'in_progress'].includes(b.status);
    })
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 5)
    .map((b) => {
      const minutesLate = Math.max(0, Math.round((now - new Date(b.scheduled_at).getTime()) / 60000));
      const hasWasher = Boolean(b.washer_id);
      return {
        id: shortId(b.id),
        rawId: String(b.id),
        customer: b.customer_name || 'Customer',
        washer: b.washer_name || null,
        washerLabel: b.washer_name || (hasWasher ? 'Assigned washer' : 'Unassigned'),
        status: b.status,
        phase: phaseForStatus(b.status, b.washer_id),
        minutesLate,
        latenessLabel: formatLateness(minutesLate),
        zone: b.city || '—',
        scheduledAt: b.scheduled_at,
        stale: minutesLate >= 24 * 60,
      };
    });
}

export function computeLiveOpsSnapshot(kpis, bookings, dispatchWashers = []) {
  const washersOnline = dispatchWashers.length
    ? dispatchWashers.filter((w) => w.is_available).length
    : kpis.activeWashers;
  const washersOffline = dispatchWashers.length
    ? dispatchWashers.filter((w) => !w.is_available).length
    : 0;

  return {
    activeBookings: kpis.active,
    inProgressBookings: kpis.inProgress,
    pendingAssignment: kpis.pendingAssignment,
    washersOnline,
    washersOffline,
    health: computeLiveHealthScores(kpis, bookings, dispatchWashers),
    delayedJobs: computeDelayedJobs(bookings),
  };
}

/** Last 7 days booking counts from API rows (for volume chart blend). */
export function computeBookingVolumeSeries(bookings) {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });
    const count = bookings.filter((b) => {
      const t = new Date(b.scheduled_at).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    days.push({ label, bookings: count });
  }
  const hasData = days.some((d) => d.bookings > 0);
  return hasData ? days : null;
}
