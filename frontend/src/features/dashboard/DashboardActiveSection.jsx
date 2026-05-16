import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Calendar, Loader2, MapPin, Sparkles, UserCircle } from 'lucide-react';

import { BookingCard } from '../../components/BookingCard';
import { BookingTimeline } from '../bookings/BookingTimeline';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { EmptyState } from '../../ui/empty-state';
import { Loader } from '../../ui/loader';
import { StatusPill } from '../../ui/status-pill';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { LiveTrackingMap } from '../../components/LiveTrackingMap';
import { useBookingTracking } from '../../hooks/useBookingTracking';
import { formatCustomerWashTiming } from './dashboardEta';

function timelineProgress(timeline) {
  if (!timeline?.length) return null;
  const done = timeline.filter((s) => s.done).length;
  return Math.round((done / timeline.length) * 100);
}

export function DashboardActiveSection({
  active,
  detail,
  detailLoading,
  detailError,
  listLoading,
  listError,
  onReloadList,
  onRefreshDetail,
}) {
  const reduced = useReducedMotion();
  const timing = useMemo(() => formatCustomerWashTiming(active, detail), [active, detail]);
  const progressPct = useMemo(() => timelineProgress(detail?.timeline), [detail?.timeline]);
  const trackEnabled =
    Boolean(active?.id && detail?.washer) &&
    ['confirmed', 'in_progress'].includes(active?.status ?? '');
  const { tracking } = useBookingTracking(active?.id, { enabled: trackEnabled });

  const onRefresh = () => {
    onReloadList?.();
    onRefreshDetail?.();
  };

  return (
    <Card
      variant="glass"
      className="min-w-0 shadow-wg-card transition hover:shadow-lg hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/15"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <h2 className="wg-heading-section">Active booking</h2>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => onRefresh()} type="button">
          <Loader2 className={`size-3.5 ${listLoading || detailLoading ? 'animate-spin' : ''}`} aria-hidden />
          Refresh
        </Button>
      </div>

      {listError ? (
        <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{listError}</p>
      ) : active ? (
        <div className="mt-4 space-y-0">
          <Link
            to={`/bookings/${active.id}`}
            className="block rounded-2xl ring-offset-2 ring-offset-wg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 dark:ring-offset-wg-surface"
          >
            <BookingCard booking={active} />
          </Link>

          {trackEnabled && tracking ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-cyan-500/25 shadow-inner ring-1 ring-cyan-500/10 dark:border-cyan-500/15">
              <div className="flex items-center justify-between gap-2 border-b border-wg-border/50 bg-wg-surface/80 px-3 py-2 dark:border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Live map</p>
                <span className="text-xs font-bold tabular-nums text-cyan-700 dark:text-cyan-300">
                  {tracking.eta_minutes != null ? `${tracking.eta_minutes} min` : 'En route'}
                </span>
              </div>
              <div className="h-40 sm:h-44">
                <LiveTrackingMap tracking={tracking} compact perspective="customer" />
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 via-wg-surface/60 to-transparent p-4 dark:border-cyan-500/15 dark:from-cyan-500/12">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-wg-muted">
                <MapPin className="size-3.5 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
                Arrival & timing
              </div>
              <p className="mt-2 text-base font-black leading-snug text-wg-text">{timing.headline}</p>
              <p className="mt-1 text-xs leading-relaxed text-wg-muted">{timing.sub}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusPill status={active.status} />
              </div>
            </div>

            {detail?.washer ? (
              <div className="rounded-2xl border border-white/25 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-wg-muted">
                  <UserCircle className="size-3.5 text-indigo-600 dark:text-indigo-300" strokeWidth={2} aria-hidden />
                  Your washer
                </div>
                <p className="mt-2 text-base font-bold text-wg-text">{detail.washer.full_name}</p>
                <p className="mt-1 text-xs text-wg-muted">
                  Rating {Number(detail.washer.rating_avg).toFixed(1)}
                  {detail.washer.service_area ? ` · ${detail.washer.service_area}` : ''}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-wg-muted">
                  They will check in on arrival and update progress as each step completes.
                </p>
              </div>
            ) : (
              <div className="flex flex-col justify-center rounded-2xl border border-dashed border-wg-border bg-wg-surface/50 p-4 dark:bg-white/[0.03]">
                <p className="text-sm font-semibold text-wg-text">Washer assignment</p>
                <p className="mt-1 text-xs text-wg-muted">We will match a pro to your slot and show their profile here.</p>
              </div>
            )}
          </div>

          {detailLoading && !detail ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-wg-muted">
              <Loader compact />
              <span>Loading live progress…</span>
            </div>
          ) : null}
          {detailError ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{detailError}</p> : null}

          {progressPct != null ? (
            <div className="mt-6">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-wg-muted">
                <span>Visit progress</span>
                <span className="tabular-nums">{progressPct}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-wg-border/80 dark:bg-white/10">
                <m.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500"
                  initial={reduced ? false : { width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: reduced ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ) : null}

          {detail?.timeline?.length ? <BookingTimeline timeline={detail.timeline} noCard className="mt-2" /> : null}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={Calendar}
            title="No active wash"
            description="When you have a pending, confirmed, or in-progress booking, it shows up here with live progress."
          >
            <Link to="/booking">
              <Button size="sm">Book a wash</Button>
            </Link>
          </EmptyState>
        </div>
      )}
    </Card>
  );
}
