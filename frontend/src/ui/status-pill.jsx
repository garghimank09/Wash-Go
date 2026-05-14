import { cn } from '../lib/cn';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
  confirmed: 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  in_progress: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-200',
  completed: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
  cancelled: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

/**
 * Booking status chip for list and detail views.
 */
export function StatusPill({ status, className }) {
  const raw = String(status || 'pending');
  const style = STATUS_STYLES[raw] || STATUS_STYLES.pending;
  const label = raw.replace(/_/g, ' ');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
