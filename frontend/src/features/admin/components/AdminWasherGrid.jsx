import { useId, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Award, CheckCircle2, ChevronDown, Clock, MapPin } from 'lucide-react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { formatCents } from '../../../utils/format';
import { AdminDataSourceBadge } from './AdminDataSourceBadge';

function trustTone(score) {
  const n = Number(score) || 0;
  if (n >= 92) return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100';
  if (n >= 88) return 'border-cyan-500/35 bg-cyan-500/10 text-cyan-900 dark:text-cyan-100';
  return 'border-white/15 bg-white/[0.06] text-wg-muted';
}

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AdminWasherGrid({ washers }) {
  const reduced = useReducedMotion();
  const [expandedId, setExpandedId] = useState(null);
  const list = washers || [];
  const headingId = useId();

  return (
    <Card variant="enterprise" className="min-w-0 border-white/35 dark:border-white/10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={headingId} className="wg-heading-section">
            Washer performance
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-wg-muted">
            Partner roster and performance metrics from the fleet API (SSE).
          </p>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-wg-muted">Scroll →</p>
      </div>

      <div className="relative mt-5 min-w-0">
        <div
          className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 pt-0.5 [scrollbar-width:thin] md:gap-5"
          role="list"
          aria-labelledby={headingId}
        >
          {list.map((w, i) => {
            const open = expandedId === w.id;
            const trust = w.trustScore != null ? Number(w.trustScore) : null;
            return (
              <m.article
                key={w.id}
                role="listitem"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduced ? undefined : { y: -2 }}
                className={cn(
                  'relative flex w-[min(100%,320px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-wg-surface-elevated/55 p-5 shadow-sm backdrop-blur-md transition dark:bg-wg-surface-elevated/35',
                  'border-white/25 hover:border-cyan-500/35 hover:shadow-md dark:border-white/10',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="relative">
                    {w.active && !reduced ? (
                      <m.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-400/25"
                        animate={{ opacity: [0.35, 0.08, 0.35], scale: [1, 1.08, 1] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    ) : null}
                    <div
                      className={cn(
                        'relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-black tracking-tight ring-2 ring-white/25 shadow-inner dark:ring-white/10',
                        'from-brand-from/25 to-brand-to/20 text-cyan-900 dark:text-cyan-100',
                      )}
                      aria-hidden
                    >
                      {initials(w.name)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {w.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/12 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-900 shadow-sm dark:text-emerald-100">
                        <span className="relative flex size-2">
                          {!reduced ? (
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                          ) : null}
                          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-wg-muted">
                        <Clock className="size-3.5 shrink-0 opacity-80" aria-hidden />
                        Offline
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black leading-tight tracking-tight text-wg-text">{w.name}</h3>
                  {w.source ? <AdminDataSourceBadge source={w.source} /> : null}
                </div>
                {w.region ? (
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium leading-snug text-wg-muted">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-cyan-600/80 dark:text-cyan-400/90" strokeWidth={2} aria-hidden />
                    <span className="[overflow-wrap:anywhere]">{w.region}</span>
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {trust != null ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider',
                        trustTone(trust),
                      )}
                    >
                      Trust {trust}
                    </span>
                  ) : null}
                  {w.topBadge ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-950 dark:text-amber-100">
                      <Award className="size-3.5 shrink-0" aria-hidden />
                      {w.topBadge}
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-white/12 bg-white/[0.04] p-3 dark:border-white/8 dark:bg-white/[0.03]">
                  <div className="min-w-0 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">On-time</p>
                    <p className="mt-1 text-lg font-black tabular-nums leading-none text-wg-text">{w.onTimePct}%</p>
                  </div>
                  <div className="min-w-0 border-x border-white/10 px-1 text-center dark:border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Rating</p>
                    <p className="mt-1 text-lg font-black tabular-nums leading-none text-wg-text">{Number(w.rating).toFixed(1)}</p>
                  </div>
                  <div className="min-w-0 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Accept</p>
                    <p className="mt-1 text-lg font-black tabular-nums leading-none text-wg-text">{w.acceptancePct ?? '—'}%</p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`washer-details-${w.id}`}
                  onClick={() => setExpandedId((id) => (id === w.id ? null : w.id))}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] py-2.5 text-xs font-bold text-wg-text transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.06] wg-focus-ring dark:border-white/10"
                >
                  {open ? 'Hide details' : 'View details'}
                  <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
                </button>

                <AnimatePresence initial={false}>
                  {open ? (
                    <m.div
                      id={`washer-details-${w.id}`}
                      key={`details-${w.id}`}
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0.12 : 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <dl className="mt-3 space-y-2.5 border-t border-white/10 pt-4 text-xs dark:border-white/5">
                        <DetailRow label="Completed (lifetime)" value={String(w.completed)} />
                        {w.utilizationPct != null ? (
                          <DetailRow label="Utilization" value={`${w.utilizationPct}%`} />
                        ) : null}
                        {w.completed7d != null ? <DetailRow label="Completes (7d)" value={String(w.completed7d)} /> : null}
                        {w.completed30d != null ? <DetailRow label="Completes (30d)" value={String(w.completed30d)} /> : null}
                        {w.revenue7dCents != null ? (
                          <DetailRow label="Revenue (7d)" value={w.revenue7dCents ? formatCents(w.revenue7dCents) : '—'} />
                        ) : null}
                        {w.id ? <DetailRow label="Washer ID" value={w.id} mono /> : null}
                      </dl>
                      <p className="mt-3 flex items-center gap-1 text-[10px] text-wg-muted">
                        <CheckCircle2 className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                        Demo fields — swap for API payload when wired.
                      </p>
                    </m.div>
                  ) : null}
                </AnimatePresence>
              </m.article>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] pb-2 last:border-0 last:pb-0 dark:border-white/[0.04]">
      <dt className="shrink-0 text-[11px] font-semibold text-wg-muted">{label}</dt>
      <dd className={cn('min-w-0 text-right text-sm font-bold tabular-nums text-wg-text', mono && 'font-mono text-xs')}>{value}</dd>
    </div>
  );
}
