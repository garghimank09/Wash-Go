import { Repeat } from 'lucide-react';

import { Card } from '../../../ui/card';

export function AdminRepeatCustomerCard({ repeatPct, bookings30d }) {
  return (
    <Card variant="enterprise" className="border-l-4 border-l-indigo-500/55 border-white/20 p-4 dark:border-white/10">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-200">
          <Repeat className="size-6" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-wg-muted">Repeat customers</h2>
          <p className="mt-2 text-3xl font-black tabular-nums text-wg-text">{repeatPct != null ? `${repeatPct}%` : '—'}</p>
          <p className="mt-1 text-xs leading-relaxed text-wg-muted">
            Of bookings in the last 30d, {repeatPct}% are from returning customers — cohort retention signal (30d).
          </p>
          {bookings30d != null ? (
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-wg-muted">Base · {bookings30d} bookings / 30d</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
