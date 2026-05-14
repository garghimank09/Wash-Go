import { m } from 'framer-motion';

import { deriveCustomerPhase, customerPhaseLabel } from '../../lib/customerBookingPhase';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

const PHASE_STYLES = {
  searching:
    'bg-amber-100 text-amber-950 ring-1 ring-amber-400/40 dark:bg-amber-950/45 dark:text-amber-100 dark:ring-amber-500/30',
  awaiting_acceptance:
    'bg-violet-100 text-violet-950 ring-1 ring-violet-400/35 dark:bg-violet-950/45 dark:text-violet-100 dark:ring-violet-500/25',
  accepted:
    'bg-sky-100 text-sky-950 ring-1 ring-sky-400/35 dark:bg-sky-950/45 dark:text-sky-100 dark:ring-sky-500/25',
  on_the_way:
    'bg-cyan-100 text-cyan-950 ring-1 ring-cyan-400/45 dark:bg-cyan-950/50 dark:text-cyan-50 dark:ring-cyan-400/35',
  in_progress:
    'bg-teal-100 text-teal-950 ring-1 ring-teal-400/40 dark:bg-teal-950/50 dark:text-teal-50 dark:ring-teal-400/30',
  completed:
    'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-400/35 dark:bg-emerald-950/45 dark:text-emerald-100 dark:ring-emerald-500/25',
  cancelled:
    'bg-slate-200 text-slate-800 ring-1 ring-slate-400/30 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600/40',
};

const ACTIVE_PULSE = new Set(['searching', 'awaiting_acceptance', 'accepted', 'on_the_way', 'in_progress']);

export function CustomerBookingStatusPill({ booking, className }) {
  const reduced = useReducedMotion();
  const phase = deriveCustomerPhase(booking);
  const style = PHASE_STYLES[phase] || PHASE_STYLES.searching;
  const label = customerPhaseLabel(phase);
  const pulse = ACTIVE_PULSE.has(phase);

  return (
    <m.span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]',
        style,
        className,
      )}
      animate={pulse && !reduced ? { boxShadow: ['0 0 0 0 rgba(6,182,212,0.35)', '0 0 0 6px rgba(6,182,212,0)', '0 0 0 0 rgba(6,182,212,0)'] } : {}}
      transition={{ duration: 2.4, repeat: pulse && !reduced ? Infinity : 0, ease: 'easeInOut' }}
    >
      {label}
    </m.span>
  );
}
