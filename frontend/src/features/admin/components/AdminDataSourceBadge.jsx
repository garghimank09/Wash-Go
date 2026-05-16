import { cn } from '../../../lib/cn';

/** Small pill indicating live API data vs sample/demo row. */
export function AdminDataSourceBadge({ source = 'live', className }) {
  const isLive = source === 'live';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide',
        isLive
          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
          : 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
        className,
      )}
    >
      {isLive ? 'Live' : 'Demo'}
    </span>
  );
}
