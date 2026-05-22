/** Derive admin charts, directory rows, and ops signals from live booking + fleet API data. */

import { computeDelayedJobs } from './adminBookingsMap';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HEATMAP_HOUR_LABELS = ['6–8', '8–10', '10–12', '12–14', '14–16', '16–18', '18–20', '20–22', '22–24', '0–2', '2–4', '4–6'];

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d) {
  return d.toLocaleDateString(undefined, { month: 'short' });
}

function slotIndex(hour) {
  if (hour >= 6 && hour < 8) return 0;
  if (hour < 10) return 1;
  if (hour < 12) return 2;
  if (hour < 14) return 3;
  if (hour < 16) return 4;
  if (hour < 18) return 5;
  if (hour < 20) return 6;
  if (hour < 22) return 7;
  if (hour < 24) return 8;
  if (hour < 2) return 9;
  if (hour < 4) return 10;
  return 11;
}

export function computeRepeatCustomerPct(bookings, windowDays = 30) {
  const cutoff = Date.now() - windowDays * 86400000;
  const recent = bookings.filter((b) => new Date(b.scheduled_at).getTime() >= cutoff);
  if (!recent.length) return 0;
  const counts = new Map();
  for (const b of recent) {
    const key = String(b.customer_id || b.customer_name || b.id);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const repeat = [...counts.values()].filter((n) => n >= 2).length;
  return Math.round((repeat / counts.size) * 1000) / 10;
}

/** Last 6 calendar months — revenue in INR (rupees) for charting. */
export function computeRevenueSeries(bookings) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: monthLabel(d), revenue: 0 });
  }
  const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
  for (const b of bookings) {
    if (b.status !== 'completed') continue;
    const d = new Date(b.scheduled_at);
    const k = monthKey(d);
    if (byKey[k]) byKey[k].revenue += (Number(b.price_cents) || 0) / 100;
  }
  return months.map(({ label, revenue }) => ({ label, revenue: Math.round(revenue) }));
}

/** New customers per month (first booking) + cumulative. */
export function computeCustomerGrowth(bookings) {
  const firstByCustomer = new Map();
  for (const b of bookings) {
    const key = String(b.customer_id || b.customer_name || '');
    if (!key) continue;
    const t = new Date(b.created_at || b.scheduled_at).getTime();
    const prev = firstByCustomer.get(key);
    if (prev == null || t < prev) firstByCustomer.set(key, t);
  }
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: monthLabel(d), signups: 0, cumulative: 0 });
  }
  const monthStarts = months.map((m) => {
    const [y, mo] = m.key.split('-').map(Number);
    return { ...m, start: new Date(y, mo - 1, 1).getTime() };
  });
  for (const ts of firstByCustomer.values()) {
    const d = new Date(ts);
    const k = monthKey(d);
    const row = monthStarts.find((m) => m.key === k);
    if (row) row.signups += 1;
  }
  let cumulative = 0;
  const beforeWindow = [...firstByCustomer.values()].filter((ts) => ts < monthStarts[0]?.start).length;
  cumulative = beforeWindow;
  return monthStarts.map((m) => {
    cumulative += m.signups;
    return { label: m.label, signups: m.signups, cumulative };
  });
}

export function computeZonePerformance(bookings) {
  const zones = new Map();
  for (const b of bookings) {
    const zone = b.city || 'Unknown';
    if (!zones.has(zone)) zones.set(zone, { zone, bookings: 0, revenueCents: 0, customers: new Set() });
    const z = zones.get(zone);
    z.bookings += 1;
    if (b.status === 'completed') z.revenueCents += Number(b.price_cents) || 0;
    z.customers.add(String(b.customer_id || b.customer_name || ''));
  }
  return [...zones.values()]
    .map((z) => ({
      zone: z.zone,
      bookings: z.bookings,
      revenueCents: z.revenueCents,
      repeatPct: 0,
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 8);
}

export function computeEarningsBreakdown(kpis) {
  const gross = kpis.revenue30dCents || 0;
  const platformFeesCents = Math.round(gross * 0.15);
  const washerPayoutsCents = Math.round(gross * 0.75);
  const pendingSettlementCents = Math.max(0, gross - platformFeesCents - washerPayoutsCents);
  return { grossCents: gross, platformFeesCents, washerPayoutsCents, pendingSettlementCents };
}

export function computeHeatmap(bookings) {
  const matrix = Array.from({ length: 7 }, () => Array(12).fill(0));
  for (const b of bookings) {
    const d = new Date(b.scheduled_at);
    const di = d.getDay();
    const hi = slotIndex(d.getHours());
    matrix[di][hi] += 1;
  }
  return { matrix, dayLabels: DAY_LABELS, hourLabels: HEATMAP_HOUR_LABELS };
}

export function computePeakHourInsight(bookings) {
  const { matrix, dayLabels, hourLabels } = computeHeatmap(bookings);
  let max = 0;
  let di = 0;
  let hi = 0;
  for (let r = 0; r < matrix.length; r += 1) {
    for (let c = 0; c < matrix[r].length; c += 1) {
      if (matrix[r][c] > max) {
        max = matrix[r][c];
        di = r;
        hi = c;
      }
    }
  }
  if (max === 0) {
    return {
      title: 'Peak load',
      body: 'Book more jobs to surface demand patterns by weekday and time block.',
      peakLabel: '—',
      liftPct: 0,
    };
  }
  const total = matrix.flat().reduce((s, n) => s + n, 0);
  const avg = total / matrix.flat().length;
  const liftPct = avg > 0 ? Math.round(((max - avg) / avg) * 100) : 0;
  return {
    title: 'Peak load',
    body: `${dayLabels[di]} ${hourLabels[hi]} shows the highest booking density in your dataset — align washer capacity ahead of this window.`,
    peakLabel: `${dayLabels[di]} ${hourLabels[hi]}`,
    liftPct: Math.max(0, liftPct),
  };
}

/** NPS-style split from completion vs cancellation (proxy until survey API exists). */
export function computeSatisfactionSegments(bookings) {
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
  const total = completed + cancelled;
  if (!total) {
    return [
      { name: 'Promoters', value: 0, fill: 'var(--wg-brand-from)' },
      { name: 'Passive', value: 0, fill: 'rgb(148 163 184)' },
      { name: 'Detractors', value: 0, fill: 'rgb(248 113 113)' },
    ];
  }
  const promoters = Math.round((completed / total) * 100);
  const detractors = Math.round((cancelled / total) * 100);
  const passive = Math.max(0, 100 - promoters - detractors);
  return [
    { name: 'Promoters', value: promoters, fill: 'var(--wg-brand-from)' },
    { name: 'Passive', value: passive, fill: 'rgb(148 163 184)' },
    { name: 'Detractors', value: detractors, fill: 'rgb(248 113 113)' },
  ];
}

export function computeTopPerformers(fleetWashers) {
  return [...(fleetWashers || [])]
    .sort((a, b) => (Number(b.completed7d) || 0) - (Number(a.completed7d) || 0))
    .slice(0, 3)
    .map((w, i) => ({
      washerId: String(w.id),
      name: w.full_name,
      badge: i === 0 ? 'Velocity' : i === 1 ? 'Reliability' : 'Capacity',
      metric: `${Number(w.completed7d) || 0} completes / 7d`,
      sub: w.service_area || 'Partner fleet',
    }));
}

export function computeSurgeZones(bookings) {
  const now = Date.now();
  const next24 = now + 86400000;
  const zones = new Map();
  for (const b of bookings) {
    const t = new Date(b.scheduled_at).getTime();
    if (t < now || t > next24) continue;
    if (!['pending', 'confirmed', 'in_progress'].includes(b.status)) continue;
    const name = b.city || 'General';
    zones.set(name, (zones.get(name) || 0) + 1);
  }
  const sorted = [...zones.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (!sorted.length) return [];
  const max = sorted[0][1];
  return sorted.map(([name, count], i) => ({
    id: `zone-${i}`,
    name,
    multiplier: Math.round((1 + count / Math.max(1, max)) * 100) / 100,
    window: 'Next 24h',
    demandIndex: Math.min(99, 50 + count * 12),
  }));
}

export function computeSlaAlerts(bookings, kpis) {
  const now = Date.now();
  const alerts = [];
  for (const b of bookings) {
    if (b.status !== 'pending' || b.washer_id) continue;
    const start = new Date(b.scheduled_at).getTime();
    const mins = Math.round((start - now) / 60000);
    if (mins >= 0 && mins <= 45) {
      alerts.push({
        id: `sla-unassigned-${b.id}`,
        title: `Unassigned · ${b.customer_name || 'Customer'}`,
        zone: b.city || '—',
        minutesToBreach: mins,
        severity: mins <= 15 ? 'critical' : 'warn',
      });
    }
  }
  for (const row of computeDelayedJobsForAlerts(bookings)) {
    alerts.push({
      id: `sla-late-${row.id}`,
      title: `Late · ${row.customer} (${row.latenessLabel})`,
      zone: `${row.zone} · ${row.phase} · ${row.washerLabel}`,
      minutesToBreach: row.minutesLate,
      severity: row.minutesLate >= 30 ? 'critical' : 'warn',
    });
  }
  if (kpis.pendingAssignment > 2) {
    alerts.push({
      id: 'sla-pool',
      title: `${kpis.pendingAssignment} bookings awaiting assignment`,
      zone: 'Dispatch',
      minutesToBreach: 30,
      severity: 'warn',
    });
  }
  return alerts.slice(0, 6);
}

function computeDelayedJobsForAlerts(bookings) {
  return computeDelayedJobs(bookings)
    .slice(0, 3)
    .map((row) => ({
      id: row.rawId?.slice(0, 8) ?? row.id,
      customer: row.customer,
      minutesLate: row.minutesLate,
      zone: row.zone,
      latenessLabel: row.latenessLabel,
      phase: row.phase,
      washerLabel: row.washerLabel,
    }));
}

export function computeEscalations(bookings) {
  const now = Date.now();
  return bookings
    .filter((b) => {
      const start = new Date(b.scheduled_at).getTime();
      const lateMin = (now - start) / 60000;
      return lateMin >= 45 && ['pending', 'in_progress'].includes(b.status);
    })
    .slice(0, 4)
    .map((b) => {
      const ageHours = Math.max(1, Math.round((now - new Date(b.updated_at || b.scheduled_at).getTime()) / 3600000));
      return {
        id: `esc-${b.id}`,
        subject: `${b.customer_name || 'Customer'} · ${b.status}`,
        stage: b.status === 'pending' ? 'Dispatch' : 'Field ops',
        owner: 'Ops queue',
        ageHours,
      };
    });
}

export function buildDirectoryCustomers(bookings) {
  const byCustomer = new Map();
  for (const b of bookings) {
    const key = String(b.customer_id || b.customer_name || '');
    if (!key) continue;
    if (!byCustomer.has(key)) {
      byCustomer.set(key, {
        id: key,
        fullName: b.customer_name || 'Customer',
        email: '—',
        active: true,
        joinedAt: (b.created_at || b.scheduled_at || '').slice(0, 10),
        bookingsCount: 0,
        loyaltyTier: '—',
        lifetimeValueCents: 0,
        recentActivityAt: b.updated_at || b.scheduled_at,
        recentActivityLabel: `${b.status} · ${b.city || 'Booking'}`,
        complaintsStatus: 'none',
        notes: '',
      });
    }
    const row = byCustomer.get(key);
    row.bookingsCount += 1;
    if (b.status === 'completed') row.lifetimeValueCents += Number(b.price_cents) || 0;
    const t = new Date(b.updated_at || b.scheduled_at).getTime();
    if (t > new Date(row.recentActivityAt).getTime()) {
      row.recentActivityAt = b.updated_at || b.scheduled_at;
      row.recentActivityLabel = `${b.status} · ${b.city || 'Booking'}`;
    }
    if (row.bookingsCount >= 10) row.loyaltyTier = 'Gold';
    else if (row.bookingsCount >= 5) row.loyaltyTier = 'Silver';
  }
  return [...byCustomer.values()].sort(
    (a, b) => new Date(b.recentActivityAt).getTime() - new Date(a.recentActivityAt).getTime(),
  );
}

export function buildDirectoryPartners(fleetWashers) {
  return (fleetWashers || []).map((w) => ({
    id: String(w.id),
    fullName: w.full_name,
    email: '—',
    active: true,
    joinedAt: (w.updated_at || '').slice(0, 10) || '—',
    online: !!w.is_available,
    acceptancePct: Math.min(99, 88 + Math.round((Number(w.rating_avg) || 0) * 2)),
    completionPct: Math.min(99, 90 + Math.round((Number(w.rating_avg) || 0) * 2)),
    trustScore: Math.min(99, 78 + Math.round((Number(w.rating_avg) || 0) * 4)),
    earningsYtdCents: (Number(w.completed7d) || 0) * 2200 * 52,
    activeJobs: Number(w.active_jobs) || 0,
    operationalState: (Number(w.active_jobs) || 0) > 0 ? 'busy' : w.is_available ? 'available' : 'off_shift',
    territory: w.service_area || '—',
    notes: w.is_available ? 'Available for dispatch' : 'Offline',
  }));
}

export function buildDirectoryStaff(authUser) {
  if (!authUser || authUser.role !== 'admin') return [];
  return [
    {
      id: String(authUser.id),
      fullName: authUser.full_name || authUser.email || 'Admin',
      email: authUser.email || '—',
      active: true,
      joinedAt: '—',
      staffRole: 'admin',
      permissionsSummary: 'Full platform console',
      operationalAccess: 'production',
      activityState: 'active',
      lastLoginAt: new Date().toISOString(),
      notes: 'Signed-in admin session',
    },
  ];
}

/** Partner weekly earnings from completed jobs (last 7 days). */
export function computeWeeklyEarningsSeries(bookings) {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });
    const dayBookings = bookings.filter((b) => {
      if (b.status !== 'completed') return false;
      const t = new Date(b.scheduled_at).getTime();
      return t >= d.getTime() && t < next.getTime();
    });
    days.push({
      day: label,
      cents: dayBookings.reduce((s, b) => s + (Number(b.price_cents) || 0), 0),
      jobs: dayBookings.length,
    });
  }
  return days;
}
