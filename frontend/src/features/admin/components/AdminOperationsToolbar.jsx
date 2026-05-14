import { Search } from 'lucide-react';

import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { cn } from '../../../lib/cn';

const BOOKING_STATUS = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const COMPLAINT_STATUS = ['all', 'open', 'in_review', 'resolved'];

function chipLabel(v) {
  if (v === 'all') return 'All';
  return String(v).replace(/_/g, ' ');
}

export function AdminOperationsToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilter,
  complaintStatus,
  onComplaintStatus,
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/25 bg-[color:var(--wg-glass-bg)]/90 p-4 shadow-wg-card backdrop-blur-xl dark:border-white/10">
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wg-muted" strokeWidth={2} aria-hidden />
        <Input
          className="[&_input]:pl-10"
          placeholder="Search bookings & complaints (customer, washer, city, id)…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search operations"
        />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Booking status</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BOOKING_STATUS.map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={statusFilter === s ? 'primary' : 'outline'}
                className={cn('rounded-full px-3', statusFilter !== s && 'border-wg-border/80')}
                onClick={() => onStatusFilter(s)}
              >
                {chipLabel(s)}
              </Button>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Complaint status</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMPLAINT_STATUS.map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={complaintStatus === s ? 'primary' : 'outline'}
                className={cn('rounded-full px-3', complaintStatus !== s && 'border-wg-border/80')}
                onClick={() => onComplaintStatus(s)}
              >
                {chipLabel(s)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
