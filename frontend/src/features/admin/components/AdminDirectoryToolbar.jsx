import { Search } from 'lucide-react';

import { cn } from '../../../lib/cn';
import { Button } from '../../../ui/button';

const CHIPS = {
  customers: [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'at_risk', label: 'At risk' },
    { id: 'suspended', label: 'Suspended' },
  ],
  partners: [
    { id: 'all', label: 'All' },
    { id: 'online', label: 'Online' },
    { id: 'offline', label: 'Offline' },
    { id: 'busy', label: 'Busy' },
  ],
  staff: [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active now' },
    { id: 'away', label: 'Away' },
  ],
};

export function AdminDirectoryToolbar({ segment, search, onSearchChange, chip, onChipChange, onExportDemo }) {
  const chips = CHIPS[segment] || CHIPS.customers;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative min-w-0 max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wg-muted" strokeWidth={2} aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, or ID…"
          className="h-11 w-full rounded-xl border border-wg-border bg-wg-surface-elevated/80 py-2 pl-10 pr-3 text-sm text-wg-text outline-none ring-cyan-500/30 placeholder:text-wg-muted focus:border-cyan-500/40 focus:ring-2 dark:border-white/10 dark:bg-white/[0.04]"
          autoComplete="off"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChipChange(c.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition',
              chip === c.id
                ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-900 dark:text-cyan-100'
                : 'border-wg-border bg-transparent text-wg-muted hover:border-white/20 dark:border-white/10',
            )}
          >
            {c.label}
          </button>
        ))}
        <Button type="button" variant="outline" size="sm" className="ml-1" onClick={onExportDemo}>
          Export (demo)
        </Button>
      </div>
    </div>
  );
}
