import toast from 'react-hot-toast';
import { m } from 'framer-motion';
import { ArrowRight, MapPin, UserPlus } from 'lucide-react';

import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { formatCents, formatDateTime } from '../../../utils/format';

export function AdminDispatchConsole({ queue, selected, selectedId, onSelect, suggestions, onAssign }) {
  const reduced = useReducedMotion();

  const handleAssign = (washerId, washerName) => {
    if (!selected) return;
    onAssign(selected.id, washerId, washerName);
    toast.success(`Assigned ${washerName} → ${selected.customer} (demo)`, { duration: 2400 });
  };

  const hold = () => {
    toast('Booking held in queue (demo).', { icon: '⏸' });
  };

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-12">
      <Card
        variant="glass"
        className="min-w-0 border-l-4 border-l-violet-500/55 border-white/20 p-0 xl:col-span-5 dark:border-white/10"
      >
        <div className="border-b border-white/10 px-4 py-3 dark:border-white/5">
          <h2 className="wg-heading-section">Assignment queue</h2>
          <p className="mt-0.5 text-xs text-wg-muted">Pending dispatch · priority sorted (mock).</p>
        </div>
        <ul className="max-h-[320px] divide-y divide-wg-border/60 overflow-y-auto">
          {queue.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-wg-muted">Queue clear — no unassigned bookings.</li>
          ) : (
            queue.map((q, i) => {
              const active = q.id === selectedId;
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(q.id)}
                    className={cn(
                      'flex w-full flex-col gap-1 px-4 py-3 text-left transition',
                      active ? 'bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/25' : 'hover:bg-white/[0.04]',
                    )}
                  >
                    <m.div
                      initial={reduced ? false : { opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: reduced ? 0 : i * 0.04 }}
                      className="flex flex-wrap items-center justify-between gap-2"
                    >
                      <span className="font-mono text-[10px] text-wg-muted">{q.id}</span>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-amber-950 dark:text-amber-100">
                        {q.priorityLabel}
                      </span>
                    </m.div>
                    <p className="text-sm font-bold text-wg-text">{q.customer}</p>
                    <p className="flex items-center gap-1 text-xs text-wg-muted">
                      <MapPin className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                      {q.zone} · {q.packageLabel}
                    </p>
                    <p className="text-xs tabular-nums text-wg-muted">{formatDateTime(q.scheduledAt)}</p>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </Card>

      <Card variant="glass" className="min-w-0 border-l-4 border-l-cyan-500/60 border-white/20 p-4 xl:col-span-7 dark:border-white/10">
        {selected ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Selected booking</p>
                <p className="mt-1 text-lg font-black text-wg-text">{selected.customer}</p>
                <p className="mt-1 text-sm text-wg-muted">
                  {selected.zone} · {formatCents(selected.priceCents, 'USD')}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={hold}>
                Hold
              </Button>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4 dark:border-white/5">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-wg-muted">
                <UserPlus className="size-4 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
                Nearby washer suggestions
              </p>
              <ul className="mt-3 space-y-3">
                {suggestions.map((s, idx) => (
                  <li
                    key={s.washerId}
                    className="rounded-xl border border-white/15 bg-white/[0.04] p-3 dark:border-white/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-wg-text">
                          {idx + 1}. {s.name}
                        </p>
                        <p className="text-xs text-wg-muted">
                          {s.distanceLabel} · score {s.score}
                        </p>
                        <p className="mt-1 text-[11px] text-wg-muted">{s.priorityReason}</p>
                      </div>
                      <Button type="button" size="sm" className="shrink-0 gap-1" onClick={() => handleAssign(s.washerId, s.name)}>
                        Assign
                        <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
                      </Button>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-wg-border/80 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-wg-muted">Select a booking from the queue.</p>
        )}
      </Card>
    </div>
  );
}
