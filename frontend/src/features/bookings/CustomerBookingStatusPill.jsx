import { m } from 'framer-motion';

import {
  currentMilestoneStatusPhrase,
  deriveCustomerMilestone,
  MILESTONE_META,
} from '../../lib/customerServiceMilestones';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

const MILESTONE_STYLES = {
  payment_received:
    'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-400/35 dark:bg-emerald-950/45 dark:text-emerald-100',
  awaiting_acceptance:
    'bg-violet-100 text-violet-950 ring-1 ring-violet-400/35 dark:bg-violet-950/45 dark:text-violet-100',
  washer_accepted:
    'bg-sky-100 text-sky-950 ring-1 ring-sky-400/35 dark:bg-sky-950/45 dark:text-sky-100',
  heading_to_you:
    'bg-cyan-100 text-cyan-950 ring-1 ring-cyan-400/45 dark:bg-cyan-950/50 dark:text-cyan-50',
  arrived_onsite:
    'bg-teal-100 text-teal-950 ring-1 ring-teal-400/40 dark:bg-teal-950/50 dark:text-teal-50',
  awaiting_arrival_approval:
    'bg-amber-100 text-amber-950 ring-1 ring-amber-400/40 dark:bg-amber-950/50 dark:text-amber-50',
  arrival_approved:
    'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-400/35 dark:bg-emerald-950/45 dark:text-emerald-100',
  wash_in_progress:
    'bg-indigo-100 text-indigo-950 ring-1 ring-indigo-400/35 dark:bg-indigo-950/50 dark:text-indigo-100',
  completed:
    'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-400/35 dark:bg-emerald-950/45 dark:text-emerald-100',
  cancelled:
    'bg-slate-200 text-slate-800 ring-1 ring-slate-400/30 dark:bg-slate-800 dark:text-slate-200',
};

const ACTIVE_PULSE = new Set(Object.keys(MILESTONE_META).filter((k) => k !== 'completed' && k !== 'payment_received'));

export function CustomerBookingStatusPill({ booking, className }) {
  const reduced = useReducedMotion();
  const milestone = deriveCustomerMilestone(booking);
  const style = MILESTONE_STYLES[milestone] || MILESTONE_STYLES.awaiting_acceptance;
  const livePhrase = currentMilestoneStatusPhrase(milestone);
  const label = livePhrase ?? MILESTONE_META[milestone]?.label ?? milestone.replace(/_/g, ' ');
  const pulse = ACTIVE_PULSE.has(milestone);

  return (
    <m.span
      className={cn(
        'inline-flex max-w-[min(100%,20rem)] items-center rounded-full px-3 py-1 text-[11px] font-bold leading-snug tracking-wide',
        livePhrase ? 'normal-case' : 'uppercase tracking-[0.12em]',
        style,
        className,
      )}
      title={MILESTONE_META[milestone]?.label}
      animate={
        pulse && !reduced
          ? {
              boxShadow: [
                '0 0 0 0 rgba(6,182,212,0.35)',
                '0 0 0 6px rgba(6,182,212,0)',
                '0 0 0 0 rgba(6,182,212,0)',
              ],
            }
          : {}
      }
      transition={{ duration: 2.4, repeat: pulse && !reduced ? Infinity : 0, ease: 'easeInOut' }}
    >
      {label}
    </m.span>
  );
}
