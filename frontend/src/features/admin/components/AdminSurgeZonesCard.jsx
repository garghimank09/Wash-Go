import { Zap } from 'lucide-react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';

export function AdminSurgeZonesCard({ zones }) {
  if (!zones?.length) return null;

  return (
    <Card variant="glass" className="min-w-0 border-l-4 border-l-amber-500/60 border-white/20 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <Zap className="size-5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} aria-hidden />
        <div>
          <h2 className="wg-heading-section">Surge demand zones</h2>
          <p className="mt-0.5 text-xs text-wg-muted">Pricing multipliers & demand index (mock).</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {zones.map((z) => (
          <li
            key={z.id}
            className={cn(
              'rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/12 to-transparent p-3',
              'ring-1 ring-amber-500/10',
            )}
          >
            <p className="text-xs font-bold text-wg-text">{z.name}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">
              ×{z.multiplier.toFixed(2)} · index {z.demandIndex}
            </p>
            <p className="mt-1 text-[10px] text-wg-muted">{z.window}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
