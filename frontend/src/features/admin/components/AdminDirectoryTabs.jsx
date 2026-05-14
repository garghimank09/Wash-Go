import { cn } from '../../../lib/cn';

const SEGMENTS = [
  { id: 'customers', label: 'Customers' },
  { id: 'partners', label: 'Partners / Washers' },
  { id: 'staff', label: 'Admin staff' },
];

export function AdminDirectoryTabs({ value, onChange }) {
  return (
    <div role="tablist" aria-label="Directory segments" className="flex flex-wrap gap-2">
      {SEGMENTS.map((s) => {
        const selected = value === s.id;
        return (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(s.id)}
            className={cn(
              'rounded-xl border px-4 py-2.5 text-sm font-bold transition wg-focus-ring',
              selected
                ? 'border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-wg-text shadow-sm ring-1 ring-cyan-500/20'
                : 'border-wg-border bg-transparent text-wg-muted hover:border-cyan-500/25 hover:bg-wg-surface-elevated/80 dark:border-white/10',
            )}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
