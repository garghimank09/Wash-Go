import { createContext, useContext, useMemo } from 'react';
import usePartnerBookings from '../hooks/usePartnerBookings';
import { buildWeeklySeries } from '../lib/partnerMappers';

const PartnerEarningsContext = createContext(null);

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Aggregate earnings statistics from the partner's completed bookings.
 *
 * The backend has no dedicated `/earnings` or `/payouts` endpoint yet, so we
 * derive everything from the booking list with full transparency: figures
 * that cannot be computed from the available data (acceptance rate, average
 * rating, scheduled payout date) are surfaced as `null` and the UI renders
 * a neutral placeholder rather than fabricating a number.
 */
export function PartnerEarningsProvider({ children }) {
  const { items, loading, refreshing, reload } = usePartnerBookings();

  const value = useMemo(() => {
    const todayMs = startOfDay(new Date());
    const startOfWeekMs = todayMs - 6 * DAY;
    const prevWeekStartMs = startOfWeekMs - 7 * DAY;
    const prevWeekEndMs = startOfWeekMs - 1;

    let thisWeekCents = 0;
    let thisWeekJobs = 0;
    let prevWeekCents = 0;
    let lifetimeCents = 0;
    let lifetimeJobs = 0;
    let activeCount = 0;
    const completedPayouts = [];

    for (const b of items) {
      const ts = b.scheduled_at ? new Date(b.scheduled_at).getTime() : null;
      if (b.status === 'completed' && ts != null) {
        lifetimeCents += b.price_cents || 0;
        lifetimeJobs += 1;
        if (ts >= startOfWeekMs) {
          thisWeekCents += b.price_cents || 0;
          thisWeekJobs += 1;
        } else if (ts >= prevWeekStartMs && ts <= prevWeekEndMs) {
          prevWeekCents += b.price_cents || 0;
        }
        completedPayouts.push({
          id: b.id,
          customer: b.customer_name || 'Customer',
          amountCents: b.price_cents || 0,
          currency: b.currency || 'USD',
          date: ts,
          status: 'paid',
          method: 'Booking',
        });
      }
      if (b.status === 'confirmed' || b.status === 'in_progress') activeCount += 1;
    }

    const weeklySeries = buildWeeklySeries(items);
    const bestDayEntry =
      weeklySeries.reduce((best, day) => (day.cents > (best?.cents ?? 0) ? day : best), null) || null;

    const growthPct = (() => {
      if (prevWeekCents <= 0) return thisWeekCents > 0 ? 100 : 0;
      return ((thisWeekCents - prevWeekCents) / prevWeekCents) * 100;
    })();

    const thisWeek = {
      totalCents: thisWeekCents,
      jobs: thisWeekJobs,
      growthPct,
      prevWeekCents,
      bestDay: bestDayEntry?.day || weeklySeries[0]?.day || '—',
    };

    const lifetime = {
      totalCents: lifetimeCents,
      jobs: lifetimeJobs,
    };

    const stats = {
      completedJobs: lifetimeJobs,
      // No dispatch-decision API yet — surface as null and the UI shows a dash.
      acceptanceRate: null,
      activeJobs: activeCount,
      // Backend has no ratings endpoint either.
      averageRating: null,
    };

    completedPayouts.sort((a, b) => b.date - a.date);

    return {
      loading,
      refreshing,
      reload,
      thisWeek,
      lifetime,
      weeklySeries,
      stats,
      payouts: completedPayouts.slice(0, 12),
    };
  }, [items, loading, refreshing, reload]);

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
