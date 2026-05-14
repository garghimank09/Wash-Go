import { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { m } from 'framer-motion';
import { ArrowRight, Briefcase, CheckCircle2, CircleDollarSign, Clock, ShieldCheck, Zap } from 'lucide-react';

import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { usePartnerBookings } from '../../hooks/usePartnerBookings';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { getPartnerTrustDemo } from '../../lib/partnerFieldDemo';
import { formatCents } from '../../utils/format';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { CustomerBookingStatusPill } from '../../features/bookings/CustomerBookingStatusPill';
import { WasherDashboardOpsBanner } from '../../features/washer/WasherDashboardOpsBanner';
import { dailyEarningsDemo } from '../../features/washer/mock/earningsDemo';

const ACTIVE = ['pending', 'confirmed', 'in_progress'];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function isSameDay(a, b) {
  return startOfDay(a) === startOfDay(b);
}

export function WasherDashboardPage() {
  const av = useOutletContext();
  const { user } = usePartnerAuth();
  const { items, loading, error } = usePartnerBookings();
  const reduced = useReducedMotion();
  const trust = useMemo(() => getPartnerTrustDemo(user), [user]);

  const { today, active, completed, weekCents } = useMemo(() => {
    const list = items || [];
    const now = new Date();
    const todayList = list.filter((b) => isSameDay(new Date(b.scheduled_at), now));
    const activeList = list.filter((b) => ACTIVE.includes(b.status));
    const completedList = list.filter((b) => b.status === 'completed');
    // eslint-disable-next-line react-hooks/purity -- rolling 7-day window from "now"
    const weekAgo = Date.now() - 7 * 86400000;
    const weekSum = list
      .filter((b) => b.status === 'completed' && new Date(b.scheduled_at).getTime() >= weekAgo)
      .reduce((s, b) => s + (Number(b.price_cents) || 0), 0);
    return {
      today: todayList.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)),
      active: activeList.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)),
      completed: completedList.length,
      weekCents: weekSum,
    };
  }, [items]);

  const demoDay = dailyEarningsDemo();

  return (
    <div className="space-y-5">
      <WasherDashboardOpsBanner online={Boolean(av?.online)} />

      <m.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black tracking-tight text-wg-text">Operations</h1>
        <p className="mt-1 text-sm text-wg-muted">Today&apos;s runs, live offers, and payout pulse — driver-app density.</p>
      </m.div>

      <Card variant="glass" className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-transparent dark:border-emerald-500/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Availability</p>
            <p className="mt-1 text-lg font-black text-wg-text">{av.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant={av.acceptingJobs ? 'primary' : 'outline'} onClick={() => av.setAcceptingJobs(!av.acceptingJobs)} disabled={!av.online}>
              {av.acceptingJobs ? 'Accepting' : 'Paused'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => av.setBusy(!av.busy)} disabled={!av.online || av.onBreak}>
              {av.busy ? 'Busy' : 'Mark busy'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => av.setOnBreak(!av.onBreak)} disabled={!av.online}>
              Break
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="glass" className="border-white/15 bg-gradient-to-br from-white/35 to-transparent p-4 ring-1 ring-white/10 dark:from-white/[0.05] dark:to-transparent dark:ring-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-wg-muted">Partner trust (demo profile)</p>
            <p className="mt-1 text-sm font-bold text-wg-text">
              {trust.rating} rating · {trust.onTimePct}% on-time · trust {trust.trustScore}
            </p>
            <p className="mt-1 text-xs text-wg-muted">
              {trust.acceptancePct}% acceptance · {trust.completionStreak}-job completion streak
              {trust.safetyVerified ? ' · safety checks current' : ''}.
            </p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-200">
            <ShieldCheck className="size-6" strokeWidth={1.75} aria-hidden />
          </span>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {loading
          ? [0, 1, 2].map((k) => (
              <div
                key={k}
                className="h-[5.75rem] animate-pulse rounded-2xl border border-wg-border/40 bg-gradient-to-br from-wg-border/30 to-transparent dark:border-white/5 dark:from-white/5"
              />
            ))
          : (
              <>
                <Card variant="glass" className="p-4 transition-shadow hover:shadow-lg">
                  <Clock className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
                  <p className="mt-2 text-[10px] font-bold uppercase text-wg-muted">Today</p>
                  <p className="text-2xl font-black tabular-nums text-wg-text">{today.length}</p>
                  <p className="text-xs text-wg-muted">Bookings</p>
                </Card>
                <Card variant="glass" className="p-4 transition-shadow hover:shadow-lg">
                  <Briefcase className="size-5 text-indigo-600 dark:text-indigo-300" strokeWidth={1.75} aria-hidden />
                  <p className="mt-2 text-[10px] font-bold uppercase text-wg-muted">Active</p>
                  <p className="text-2xl font-black tabular-nums text-wg-text">{active.length}</p>
                  <p className="text-xs text-wg-muted">Jobs in motion</p>
                </Card>
                <Card variant="glass" className="p-4 transition-shadow hover:shadow-lg">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} aria-hidden />
                  <p className="mt-2 text-[10px] font-bold uppercase text-wg-muted">Completed</p>
                  <p className="text-2xl font-black tabular-nums text-wg-text">{completed}</p>
                  <p className="text-xs text-wg-muted">All time</p>
                </Card>
              </>
            )}
      </div>

      <Card variant="glass" className="border-cyan-500/20 bg-gradient-to-r from-cyan-500/8 to-indigo-500/8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Earnings snapshot</p>
            <p className="mt-1 text-xl font-black text-wg-text">{formatCents(weekCents || demoDay.cents, 'USD')}</p>
            <p className="text-xs text-wg-muted">7-day total (API) + demo fill when empty</p>
          </div>
          <CircleDollarSign className="size-8 text-cyan-600 opacity-80 dark:text-cyan-400" strokeWidth={1.25} aria-hidden />
        </div>
        <Link to="/partner/earnings" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
          Open earnings
          <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
        </Link>
      </Card>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-wg-muted">Today&apos;s line</h2>
        <Link to="/partner/requests" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
          <Zap className="size-3.5" strokeWidth={2} aria-hidden />
          New offers
        </Link>
      </div>
      {loading ? (
        <ul className="space-y-2">
          {[1, 2, 3].map((k) => (
            <li key={k} className="h-[4.5rem] animate-pulse rounded-2xl bg-gradient-to-r from-wg-border/40 to-transparent dark:from-white/10" />
          ))}
        </ul>
      ) : today.length === 0 ? (
        <Card variant="glass" className="border-dashed border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.07] to-transparent py-10 text-center">
          <p className="text-sm font-bold text-wg-text">No roster sync for today yet</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-wg-muted">
            Open <strong className="text-wg-text">Offers</strong> for instant mock dispatch or launch the{' '}
            <Link to="/partner/jobs/demo" className="font-bold text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-400">
              demo job
            </Link>{' '}
            for the full premium field flow.
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {today.map((b) => (
            <li key={b.id}>
              <Link to={`/partner/jobs/${b.id}`} className="block">
                <Card variant="glass" className="transition hover:ring-1 hover:ring-cyan-500/25">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CustomerBookingStatusPill booking={b} />
                      <p className="mt-2 truncate text-sm font-bold text-wg-text">{b.service_address}</p>
                      <p className="text-xs text-wg-muted">{new Date(b.scheduled_at).toLocaleString()}</p>
                    </div>
                    <span className="shrink-0 text-sm font-black tabular-nums text-wg-text">
                      {formatCents(b.price_cents, b.currency)}
                    </span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-wg-muted">Active jobs</h2>
      </div>
      {active.length === 0 ? (
        <Card variant="glass" className="py-8 text-center text-sm text-wg-muted">
          No active jobs from API. Run the <Link to="/partner/jobs/demo" className="font-bold text-cyan-600 dark:text-cyan-400">demo job</Link> for a full field-ops walkthrough.
        </Card>
      ) : (
        <ul className="space-y-2">
          {active.map((b) => (
            <li key={b.id}>
              <Link to={`/partner/jobs/${b.id}`}>
                <Button variant="outline" className="h-auto w-full justify-between py-3 text-left">
                  <span className="truncate font-semibold">{b.service_address}</span>
                  <ArrowRight className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
