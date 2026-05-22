import { Check, Circle, Loader } from 'lucide-react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';

const STEPS = [
  { key: 'queued', label: 'Queued' },
  { key: 'matching', label: 'Matching' },
  { key: 'assigned', label: 'Assigned' },
];

export function AdminAssignmentQueueViz({ queueLength }) {
  const stage = queueLength >= 3 ? 0 : queueLength >= 1 ? 1 : 2;

  return (
    <Card variant="enterprise" className="border-l-4 border-l-emerald-500/50 border-white/15 p-4 dark:border-white/10">
      <h2 className="text-sm font-black uppercase tracking-[0.14em] text-wg-muted">Dispatcher pipeline</h2>
      <p className="mt-1 text-xs text-wg-muted">Queue depth drives stage emphasis (live).</p>
      <ol className="mt-4 flex flex-wrap items-center gap-2 md:gap-4">
        {STEPS.map((step, i) => {
          const done = i < stage;
          const current = i === stage;
          return (
            <li key={step.key} className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border-2 text-xs font-black',
                    done && 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
                    current && !done && 'border-cyan-500 bg-cyan-500/15 text-cyan-900 dark:text-cyan-100',
                    !done && !current && 'border-wg-border bg-wg-surface-elevated/50 text-wg-muted',
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={2} aria-hidden /> : current ? <Loader className="size-4 animate-spin" strokeWidth={2} aria-hidden /> : <Circle className="size-4" strokeWidth={2} aria-hidden />}
                </span>
                <span className={cn('text-xs font-bold', current ? 'text-wg-text' : 'text-wg-muted')}>{step.label}</span>
              </div>
              {i < STEPS.length - 1 ? (
                <div className={cn('hidden h-0.5 w-6 rounded-full md:block', done ? 'bg-emerald-500/60' : 'bg-wg-border')} aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
