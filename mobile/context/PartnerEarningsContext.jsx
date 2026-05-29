import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import usePartnerBookings from '../hooks/usePartnerBookings';
import { onPartnerBookingsSync } from '../lib/partnerSyncEvents';
import {
  computePartnerEarningsFromBookings,
  PARTNER_EARNINGS_PERCENT,
  partnerEarningsCents,
} from '../lib/partnerEarnings';
import {
  historyPayoutCents,
  selectCompletedWashHistory,
} from '../lib/partnerWashHistory';
import { buildWeeklySeries } from '../lib/partnerMappers';
import { partnerEarningsService } from '../services/partnerEarningsService';

const PartnerEarningsContext = createContext(null);

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function mapApiSummary(summary) {
  if (!summary) return null;
  const series = (summary.series || []).map((d) => ({
    day: d.day,
    cents: d.cents ?? 0,
    jobs: d.jobs ?? 0,
  }));
  return {
    sharePercent: summary.share_percent ?? PARTNER_EARNINGS_PERCENT,
    weekPartnerCents: summary.week_partner_cents ?? 0,
    lifetimePartnerCents: summary.lifetime_partner_cents ?? 0,
    pendingWeeklyCents: summary.pending_weekly_cents ?? 0,
    weekJobs: summary.week_jobs ?? 0,
    lifetimeJobs: summary.lifetime_jobs ?? 0,
    series,
  };
}

function computeWeekGrowth(bookings) {
  const todayMs = startOfDay(new Date());
  const startOfWeekMs = todayMs - 6 * DAY;
  const prevWeekStartMs = startOfWeekMs - 7 * DAY;
  const prevWeekEndMs = startOfWeekMs - 1;

  let thisWeekCents = 0;
  let prevWeekCents = 0;

  for (const b of bookings) {
    if (b.status !== 'completed') continue;
    const ts = new Date(b.updated_at || b.scheduled_at).getTime();
    if (!Number.isFinite(ts)) continue;
    const cents = partnerEarningsCents(b.price_cents);
    if (ts >= startOfWeekMs) thisWeekCents += cents;
    else if (ts >= prevWeekStartMs && ts <= prevWeekEndMs) prevWeekCents += cents;
  }

  if (prevWeekCents <= 0) return thisWeekCents > 0 ? 100 : 0;
  return ((thisWeekCents - prevWeekCents) / prevWeekCents) * 100;
}

/**
 * Partner earnings from GET /partner/earnings (90% share), with booking-list
 * fallback and refresh on booking sync.
 */
export function PartnerEarningsProvider({ children }) {
  const { items, loading: bookingsLoading, refreshing, reload: reloadBookings } =
    usePartnerBookings();
  const [apiSummary, setApiSummary] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState(null);

  const reloadEarnings = useCallback(async (silent = false) => {
    if (!silent) setEarningsLoading(true);
    setEarningsError(null);
    try {
      const data = await partnerEarningsService.getSummary();
      setApiSummary(mapApiSummary(data));
    } catch (e) {
      setEarningsError(e?.message || 'Could not load earnings');
      setApiSummary(mapApiSummary(computePartnerEarningsFromBookings(items)));
    } finally {
      if (!silent) setEarningsLoading(false);
    }
  }, [items]);

  useEffect(() => {
    void reloadEarnings(false);
  }, [reloadEarnings]);

  useEffect(() => onPartnerBookingsSync(() => void reloadEarnings(true)), [reloadEarnings]);

  const reload = useCallback(async () => {
    await Promise.all([reloadBookings(), reloadEarnings(true)]);
  }, [reloadBookings, reloadEarnings]);

  const value = useMemo(() => {
    const summary =
      apiSummary || mapApiSummary(computePartnerEarningsFromBookings(items));
    const weeklySeries =
      summary.series?.length > 0 ? summary.series : buildWeeklySeries(items);

    const bestDayEntry =
      weeklySeries.reduce(
        (best, day) => (day.cents > (best?.cents ?? 0) ? day : best),
        null,
      ) || null;

    const growthPct = computeWeekGrowth(items);

    const thisWeek = {
      totalCents: summary.weekPartnerCents,
      jobs: summary.weekJobs,
      growthPct,
      bestDay: bestDayEntry?.day || weeklySeries[0]?.day || '—',
    };

    const lifetime = {
      totalCents: summary.lifetimePartnerCents,
      jobs: summary.lifetimeJobs,
    };

    const pending = {
      totalCents: summary.pendingWeeklyCents,
    };

    let activeCount = 0;
    for (const b of items) {
      if (b.status === 'confirmed' || b.status === 'in_progress') activeCount += 1;
    }

    const stats = {
      completedJobs: summary.lifetimeJobs,
      acceptanceRate: null,
      activeJobs: activeCount,
      averageRating: null,
    };

    const completedPayouts = selectCompletedWashHistory(items).map((b) => ({
      id: b.id,
      customer: b.customer_name || 'Customer',
      amountCents: historyPayoutCents(b),
      currency: b.currency || 'INR',
      date: new Date(b.updated_at || b.scheduled_at).getTime(),
      status: 'pending',
      method: 'Weekly partner payout',
    }));

    return {
      loading: earningsLoading || bookingsLoading,
      refreshing,
      reload,
      error: earningsError,
      sharePercent: summary.sharePercent,
      thisWeek,
      lifetime,
      pending,
      weeklySeries,
      stats,
      payouts: completedPayouts.slice(0, 12),
    };
  }, [
    apiSummary,
    items,
    earningsLoading,
    bookingsLoading,
    refreshing,
    reload,
    earningsError,
  ]);

  return (
    <PartnerEarningsContext.Provider value={value}>
      {children}
    </PartnerEarningsContext.Provider>
  );
}

export function usePartnerEarnings() {
  const ctx = useContext(PartnerEarningsContext);
  if (!ctx) {
    throw new Error('usePartnerEarnings must be used within PartnerEarningsProvider');
  }
  return ctx;
}
