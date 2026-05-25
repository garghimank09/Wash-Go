import { Link } from 'react-router-dom';

import { CustomerBookingStatusPill } from '../features/bookings/CustomerBookingStatusPill';
import { cn } from '../lib/cn';
import { Card } from '../ui/card';
import { formatCents } from '../utils/format';

const ACTIVE = ['pending', 'confirmed', 'in_progress'];

export function BookingCard({ booking, onClick }) {
  const isActive = ACTIVE.includes(booking.status);
  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick ? () => onClick(booking) : undefined}
      className={cn('block w-full text-left', onClick && 'cursor-pointer wg-focus-ring rounded-[var(--radius-wg-card)]')}
    >
      <Card
        variant={isActive ? 'glass' : 'default'}
        padding
        className={cn(
          'transition',
          isActive && 'border-cyan-500/35 bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 hover:border-cyan-400/50',
          !isActive && 'hover:border-wg-border hover:shadow-md',
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CustomerBookingStatusPill booking={booking} />
          <span className="text-lg font-bold text-wg-text">{formatCents(booking.price_cents, booking.currency)}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-medium text-wg-text">{booking.service_address}</p>
        <p className="mt-1 text-xs text-wg-muted">{new Date(booking.scheduled_at).toLocaleString()}</p>
      </Card>
    </Comp>
  );
}

export function BookingCardLink({ booking }) {
  return (
    <Link to={`/bookings/${booking.id}`} className="block">
      <BookingCard booking={booking} />
    </Link>
  );
}
