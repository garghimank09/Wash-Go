import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Activity, AlertTriangle, ArrowRight, Clock, Gauge, Radio, Truck } from 'lucide-react';

import { useReducedMotion } from '../../../lib/useReducedMotion';
import { cn } from '../../../lib/cn';
import { Card } from '../../../ui/card';

function scoreTone(value) {
  if (value >= 85) return 'text-emerald-600 dark:text-emerald-400';
  if (value >= 72) return 'text-amber-700 dark:text-amber-300';
  return 'text-rose-600 dark:text-rose-400';
}

function scoreBarTone(value) {
  if (value >= 85) return 'bg-emerald-500';
  if (value >= 72) return 'bg-amber-500';
  return 'bg-rose-500';
}

function HealthScore({ label, value }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-wg-border/60 bg-wg-surface/80 px-3 py-3 dark:border-white/10 dark:bg-black/20">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-wg-muted">{label}</span>
        <span className={cn('text-xl font-black tabular-nums', scoreTone(value))}>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-wg-border/80 dark:bg-white/10">
        <div
          className={cn('h-full rounded-full', scoreBarTone(value))}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function AdminLiveOpsCommandBar({ snapshot }) {
  const reduced = useReducedMotion();
  if (!snapshot) return null;

  const washerTotal = (snapshot.washersOnline ?? 0) + (snapshot.washersOffline ?? 0);

  return (
    <Card
      variant="glass"
      className="min-w-0 overflow-hidden border border-white/25 p-0 shadow-wg-card dark:border-white/10"
    >
      <div className="flex flex-col gap-4 border-b border-wg-border/60 bg-gradient-to-r from-cyan-500/[0.08] via-transparent to-indigo-500/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <m.span
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200"
              animate={reduced ? undefined : { opacity: [1, 0.7, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Radio className="size-3" strokeWidth={2.5} aria-hidden />
              Live sync
            </m.span>
            <h2 className="text-base font-black tracking-tight text-wg-text sm:text-lg">Live operations</h2>
          </div>
          <p className="mt-1 text-sm text-wg-muted">Bookings + fleet counters refresh via SSE (~4s).</p>
        </div>
        <Link
          to="/admin/operations"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400"
        >
          Open dispatch
          <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:gap-4 lg:p-5">
        <div className="rounded-xl border border-wg-border/80 bg-wg-surface-elevated/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-wg-muted">
            <Activity className="size-4 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
            Active bookings
          </p>
          <p className="mt-2 text-3xl font-black tabular-nums text-wg-text">{snapshot.activeBookings}</p>
          <p className="mt-1 text-xs text-wg-muted">{snapshot.inProgressBookings} in progress</p>
        </div>
        <div className="rounded-xl border border-wg-border/80 bg-wg-surface-elevated/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-wg-muted">
            <Clock className="size-4 text-amber-600 dark:text-amber-400" strokeWidth={2} aria-hidden />
            Needs assignment
          </p>
          <p className="mt-2 text-3xl font-black tabular-nums text-amber-700 dark:text-amber-300">{snapshot.pendingAssignment}</p>
          <p className="mt-1 text-xs text-wg-muted">Pending washer match</p>
        </div>
        <div className="rounded-xl border border-wg-border/80 bg-wg-surface-elevated/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-wg-muted">
            <Truck className="size-4 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
            Field partners
          </p>
          <p className="mt-2 text-3xl font-black tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400">{snapshot.washersOnline}</span>
            <span className="ml-1.5 text-lg font-bold text-wg-muted">online</span>
          </p>
          <p className="mt-1 text-xs text-wg-muted">
            {washerTotal > 0 ? `${snapshot.washersOffline} offline · ${washerTotal} roster` : 'No roster data'}
          </p>
        </div>
      </div>

      <div className="border-t border-wg-border/60 px-4 pb-4 pt-3 dark:border-white/10 lg:px-5 lg:pb-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Gauge className="size-4 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
          <p className="text-[11px] font-bold uppercase tracking-wide text-wg-muted">Platform health</p>
          <span className="text-[10px] text-wg-muted">· from live queue + fleet</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <HealthScore label="Dispatch" value={snapshot.health.dispatch} />
          <HealthScore label="Fleet" value={snapshot.health.fleet} />
          <HealthScore label="CSAT" value={snapshot.health.csat} />
        </div>
      </div>

      {snapshot.delayedJobs?.length ? (
        <div className="mt-4 border-t border-white/10 pt-4 dark:border-white/5">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-amber-900 dark:text-amber-100">
            <AlertTriangle className="size-3.5" strokeWidth={2} aria-hidden />
            Delayed jobs
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {snapshot.delayedJobs.map((j) => (
              <li key={j.id}>
                <Link
                  to="/admin/bookings"
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-950 transition hover:bg-amber-500/20 dark:text-amber-50"
                >
                  <span className="font-mono text-[10px] text-wg-muted">{j.id}</span>
                  {j.customer} · +{j.minutesLate}m · {j.zone}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
