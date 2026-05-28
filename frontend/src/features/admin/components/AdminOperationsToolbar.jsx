import { ChevronDown, Search } from 'lucide-react';

import { Input } from '../../../ui/input';
import { cn } from '../../../lib/cn';

const BOOKING_STATUS = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const COMPLAINT_STATUS = ['all', 'open', 'in_review', 'resolved'];

function optionLabel(v) {
  if (v === 'all') return 'All statuses';
  return String(v)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusDropdown({ id, label, value, options, onChange, className, formatLabel = optionLabel }) {
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
        {options.map((s) => (
          <option key={s} value={s}>
            {formatLabel(s)}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-wg-muted"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}

/**
 * @param {'hub' | 'bookings' | 'complaints'} scope
 */
const SORT_VALUES = ['newest', 'oldest'];

export function AdminOperationsToolbar({
  scope = 'hub',
  query,
  onQueryChange,
  statusFilter,
  onStatusFilter,
  complaintStatus = 'all',
  onComplaintStatus,
  sort,
  onSort,
}) {
  const showBookings = scope === 'hub' || scope === 'bookings';
  const showComplaints = scope === 'hub' || scope === 'complaints';

  const placeholder =
    scope === 'bookings'
      ? 'Search bookings (customer, washer, address, id)…'
      : scope === 'complaints'
        ? 'Search complaints (customer, subject, id)…'
        : 'Search bookings & complaints (customer, washer, city, id)…';

  const searchLabel =
    scope === 'bookings'
      ? 'Search bookings'
      : scope === 'complaints'
        ? 'Search complaints'
        : 'Search operations';

  return (
    <div className="rounded-2xl border border-white/25 bg-[color:var(--wg-glass-bg)]/90 p-4 shadow-wg-card backdrop-blur-xl dark:border-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-wg-muted"
            strokeWidth={2}
            aria-hidden
          />
          <Input
            className="[&_input]:pl-10"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label={searchLabel}
          />
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-stretch">
          {showBookings ? (
            <StatusDropdown
              id="admin-booking-status"
              label="Booking status"
              value={statusFilter ?? 'all'}
              options={BOOKING_STATUS}
              onChange={onStatusFilter}
            />
          ) : null}
          {showComplaints ? (
            <StatusDropdown
              id="admin-complaint-status"
              label="Complaint status"
              value={complaintStatus}
              options={COMPLAINT_STATUS}
              onChange={onComplaintStatus}
            />
          ) : null}
          {showBookings && onSort ? (
            <StatusDropdown
              id="admin-booking-sort"
              label="Sort bookings"
              value={sort ?? 'newest'}
              options={SORT_VALUES}
              onChange={onSort}
              formatLabel={(v) => (v === 'oldest' ? 'Oldest first' : 'Newest first')}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
