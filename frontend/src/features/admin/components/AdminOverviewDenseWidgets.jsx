import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Radio, TrendingUp, Zap } from 'lucide-react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';
import { formatCents, formatDateTime, formatRupeesAxis } from '../../../utils/format';

const SLA_RING = {
  critical: 'border-l-4 border-l-rose-500/70 bg-rose-500/[0.04]',
  warn: 'border-l-4 border-l-amber-500/60 bg-amber-500/[0.04]',
  info: 'border-l-4 border-l-cyan-500/50 bg-cyan-500/[0.03]',
};

/** Read-only dispatch queue slice — live from API when bookings exist. */
export function AdminDispatchQueuePreview({ queue, isLive = false }) {
  const rows = (queue || []).slice(0, 4);
  return (
    <Card variant="enterprise" className="flex min-w-0 flex-col border-l-4 border-l-violet-500/55 border-white/20 dark:border-white/10">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 px-4 py-3 dark:border-white/5">
        <div>
          <h2 className="wg-heading-section">Dispatch monitor</h2>
          <p className="mt-0.5 text-xs text-wg-muted">
            Unassigned queue · live from API (SSE).
          </p>
        </div>
        <Link
          to="/admin/operations"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-cyan-700 wg-focus-ring hover:underline dark:text-cyan-300"
        >
          Desk <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <ul
        className={cn(
          'divide-y divide-wg-border/50',
          rows.length > 3 && 'max-h-[200px] overflow-y-auto',
        )}
      >
        {rows.length === 0 ? (
          <li className="px-4 py-4 text-center text-xs text-wg-muted">Queue clear.</li>
        ) : (
          rows.map((q) => (
            <li key={q.id} className="px-4 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-wg-muted">{q.id}</span>
                <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-950 dark:text-amber-100">
                  {q.priorityLabel}
                </span>
              </div>
              <p className="mt-0.5 truncate text-sm font-bold text-wg-text">{q.customer}</p>
              <p className="mt-0.5 text-[11px] text-wg-muted">
                {q.zone} · {q.packageLabel}
              </p>
              <p className="mt-0.5 text-[10px] tabular-nums text-wg-muted">{formatDateTime(q.scheduledAt)}</p>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}

export function AdminSlaAlertsCard({ items }) {
  const list = items || [];
  return (
    <Card variant="enterprise" className="flex min-w-0 flex-col border-white/20 dark:border-white/10">
      <div className="border-b border-white/10 px-4 py-3 dark:border-white/5">
        <h2 className="wg-heading-section">SLA alerts</h2>
        <p className="mt-0.5 text-xs text-wg-muted">Time-to-breach watchlist from live queue.</p>
      </div>
      <ul
        className={cn(
          'space-y-2 p-3',
          list.length > 4 && 'max-h-[200px] overflow-y-auto',
        )}
      >
        {list.length === 0 ? (
          <li className="px-2 py-4 text-center text-xs text-wg-muted">No SLA risks in the queue.</li>
        ) : null}
        {list.map((a) => (
          <li
            key={a.id}
            className={cn(
              'rounded-xl border border-white/10 bg-white/[0.02] p-2.5 pl-3 dark:bg-white/[0.03]',
              SLA_RING[a.severity] || SLA_RING.info,
            )}
          >
            <p className="text-xs font-bold leading-snug text-wg-text">{a.title}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[10px] text-wg-muted">
              <span>{a.zone}</span>
              <span className="inline-flex items-center gap-0.5 font-semibold tabular-nums text-wg-text">
                <Clock className="size-3" aria-hidden />
                {a.minutesToBreach}m
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function AdminEscalationTrackerCard({ items }) {
  const list = items || [];
  return (
    <Card variant="enterprise" className="flex min-w-0 flex-col border-l-4 border-l-rose-500/45 border-white/20 dark:border-white/10">
      <div className="border-b border-white/10 px-4 py-3 dark:border-white/5">
        <h2 className="wg-heading-section">Escalation tracker</h2>
        <p className="mt-0.5 text-xs text-wg-muted">Cross-team queue · aging from late jobs.</p>
      </div>
      <ul
        className={cn(
          'divide-y divide-wg-border/40 text-xs',
          list.length > 4 && 'max-h-[200px] overflow-y-auto',
        )}
      >
        {list.length === 0 ? (
          <li className="px-4 py-4 text-center text-xs text-wg-muted">No escalations — fleet on track.</li>
        ) : null}
        {list.map((e) => (
          <li key={e.id} className="px-4 py-2.5">
            <p className="font-semibold leading-snug text-wg-text">{e.subject}</p>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-wg-muted">
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-bold text-wg-text">{e.stage}</span>
              <span>{e.owner}</span>
              <span className="tabular-nums">{e.ageHours}h open</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function AdminRevenuePulseCard({ series, kpis }) {
  const s = series || [];
  const last = s[s.length - 1];
  const prev = s[s.length - 2];
  const pct =
    prev?.revenue && last?.revenue ? Math.round(((last.revenue - prev.revenue) / prev.revenue) * 1000) / 10 : null;
  const up = pct != null && pct >= 0;

  return (
    <Card variant="enterprise" className="min-w-0 border-l-4 border-l-emerald-500/50 border-white/20 p-4 dark:border-white/10">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.14em] text-wg-muted">Revenue pulse</h2>
          <p className="mt-2 text-2xl font-black tabular-nums text-wg-text">
            {last ? formatRupeesAxis(last.revenue) : '—'}
            {last?.label ? <span className="ml-1 text-sm font-bold text-wg-muted">{last.label}</span> : null}
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
          <TrendingUp className="size-5" strokeWidth={2} aria-hidden />
        </span>
      </div>
      {pct != null ? (
        <p className={cn('mt-2 text-xs font-bold tabular-nums', up ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
          {up ? '+' : ''}
          {pct}% vs prior month
        </p>
      ) : null}
      {kpis?.revenue30dCents != null ? (
        <p className="mt-2 border-t border-white/10 pt-2 text-[10px] leading-relaxed text-wg-muted dark:border-white/5">
          Trailing 30d gross <span className="font-bold text-wg-text">{formatCents(kpis.revenue30dCents)}</span> · aligns with revenue chart.
        </p>
      ) : null}
    </Card>
  );
}

export function AdminPeakHourInsightCard({ insight }) {
  if (!insight) return null;
  return (
    <Card variant="enterprise" className="min-w-0 border-l-4 border-l-amber-500/50 border-white/20 p-4 dark:border-white/10">
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-800 dark:text-amber-200">
          <Zap className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="wg-heading-section">{insight.title}</h2>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-wg-muted">
              {insight.peakLabel}
            </span>
            <span className="text-xs font-black tabular-nums text-amber-800 dark:text-amber-200">+{insight.liftPct}%</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-wg-muted">{insight.body}</p>
        </div>
        <Link
          to="/admin/revenue"
          className="inline-flex shrink-0 items-center gap-1 self-center text-[11px] font-bold text-cyan-700 wg-focus-ring hover:underline dark:text-cyan-300"
        >
          Revenue <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

/** Compact “fleet heartbeat” strip — reuses snapshot numbers (mock). */
export function AdminFleetStatusStrip({ snapshot }) {
  if (!snapshot) return null;
  return (
    <Card variant="enterprise" className="min-w-0 border-white/20 p-3 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold text-wg-text">
          <Radio className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Fleet status
        </span>
        <span className="h-4 w-px bg-white/15 dark:bg-white/10" aria-hidden />
        <span className="text-wg-muted">
          Online <strong className="tabular-nums text-wg-text">{snapshot.washersOnline}</strong>
        </span>
        <span className="text-wg-muted">
          Offline <strong className="tabular-nums text-wg-text">{snapshot.washersOffline}</strong>
        </span>
        <span className="text-wg-muted">
          Assign pending <strong className="tabular-nums text-amber-800 dark:text-amber-200">{snapshot.pendingAssignment}</strong>
        </span>
        <span className="text-wg-muted">
          In progress <strong className="tabular-nums text-wg-text">{snapshot.inProgressBookings}</strong>
        </span>
      </div>
    </Card>
  );
}
