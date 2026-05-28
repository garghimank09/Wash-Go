import { ChevronDown, Search } from 'lucide-react';

import { Input } from '../../ui/input';
import { SORT_OPTIONS, statusOptionLabel } from '../../lib/paginatedList';
import { cn } from '../../lib/cn';

function FilterSelect({ id, label, value, options, onChange, formatLabel, className }) {
  return (
    <div className={cn('relative w-full sm:w-[11.5rem]', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none rounded-xl border border-wg-border bg-wg-surface-elevated py-2.5 pl-3 pr-9 text-sm font-medium text-wg-text shadow-sm transition',
          'focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:focus:border-cyan-400',
        )}
      >
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lab = typeof opt === 'string' ? formatLabel(opt) : opt.label;
          return (
            <option key={val} value={val}>
              {lab}
            </option>
          );
        })}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-wg-muted"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}

export function ListFilterToolbar({
  query,
  onQueryChange,
  queryPlaceholder = 'Search address or status…',
  statusFilter,
  onStatusFilter,
  statusOptions,
  sort,
  onSort,
  showStatus = true,
  showSort = true,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-wg-border/80 bg-wg-surface-elevated/60 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      <div className="relative min-w-0 flex-1 sm:min-w-[12rem] sm:max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wg-muted"
          strokeWidth={2}
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={queryPlaceholder}
          className="pl-9"
          aria-label="Search list"
        />
      </div>
      {showStatus && statusOptions?.length ? (
        <FilterSelect
          id="list-status-filter"
          label="Status"
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusFilter}
          formatLabel={statusOptionLabel}
        />
      ) : null}
      {showSort && onSort ? (
        <FilterSelect
          id="list-sort"
          label="Sort"
          value={sort}
          options={SORT_OPTIONS}
          onChange={onSort}
          formatLabel={(v) => SORT_OPTIONS.find((o) => o.value === v)?.label ?? v}
          className="sm:w-[10.5rem]"
        />
      ) : null}
    </div>
  );
}
