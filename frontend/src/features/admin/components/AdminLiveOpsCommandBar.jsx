import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Activity, AlertTriangle, Clock, Radio, Truck, Users } from 'lucide-react';

import { useReducedMotion } from '../../../lib/useReducedMotion';
import { cn } from '../../../lib/cn';
import { Card } from '../../../ui/card';

function HealthPill({ label, value }) {
  const tone =
    value >= 85 ? 'text-emerald-700 dark:text-emerald-300' : value >= 72 ? 'text-amber-800 dark:text-amber-200' : 'text-rose-700 dark:text-rose-300';
  return (
    <div className="flex min-w-[5.5rem] flex-col rounded-xl border border-white/15 bg-white/40 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="text-[9px] font-bold uppercase tracking-wide text-wg-muted">{label}</span>
      <span className={cn('text-lg font-black tabular-nums', tone)}>{value}</span>
    </div>
  );
}

export function AdminLiveOpsCommandBar({ snapshot }) {
  const reduced = useReducedMotion();
  if (!snapshot) return null;

  return (
    <Card
      variant="glass"
      className="min-w-0 border-l-4 border-l-cyan-500/70 border-white/25 bg-gradient-to-br from-cyan-500/[0.07] via-transparent to-indigo-500/[0.06] p-4 shadow-wg-card dark:border-white/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <m.span
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-100"
            animate={reduced ? undefined : { opacity: [1, 0.72, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Radio className="size-3.5" strokeWidth={2} aria-hidden />
            Live ops
          </m.span>
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-wg-muted">Command strip</h2>
        </div>
        <Link
          to="/admin/operations"
          className="shrink-0 text-xs font-bold text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-300"
        >
          Dispatch desk →
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <div className="rounded-xl border border-white/15 bg-black/[0.02] p-3 dark:bg-white/[0.03]">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-wg-muted">
            <Activity className="size-3" strokeWidth={2} aria-hidden />
            Active bookings
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">{snapshot.activeBookings}</p>
          <p className="text-[10px] text-wg-muted">{snapshot.inProgressBookings} in progress</p>
        </div>
        <div className="rounded-xl border border-white/15 bg-black/[0.02] p-3 dark:bg-white/[0.03]">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-wg-muted">
            <Clock className="size-3" strokeWidth={2} aria-hidden />
            Assignment queue
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-amber-800 dark:text-amber-200">{snapshot.pendingAssignment}</p>
          <p className="text-[10px] text-wg-muted">Pending match</p>
        </div>
        <div className="rounded-xl border border-white/15 bg-black/[0.02] p-3 dark:bg-white/[0.03]">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-wg-muted">
            <Truck className="size-3" strokeWidth={2} aria-hidden />
            Washers
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">
            <span className="text-emerald-600 dark:text-emerald-400">{snapshot.washersOnline}</span>
            <span className="mx-0.5 text-wg-muted">/</span>
            <span className="text-wg-muted">{snapshot.washersOffline}</span>
          </p>
          <p className="text-[10px] text-wg-muted">Online / offline</p>
        </div>
        <div className="rounded-xl border border-white/15 bg-black/[0.02] p-3 dark:bg-white/[0.03]">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-wg-muted">
            <Users className="size-3" strokeWidth={2} aria-hidden />
            Health
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <HealthPill label="Dispatch" value={snapshot.health.dispatch} />
            <HealthPill label="Fleet" value={snapshot.health.fleet} />
            <HealthPill label="CSAT" value={snapshot.health.csat} />
          </div>
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
