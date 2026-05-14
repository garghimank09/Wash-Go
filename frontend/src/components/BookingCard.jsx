import { Link } from 'react-router-dom';

import { CustomerBookingStatusPill } from '../features/bookings/CustomerBookingStatusPill';
import { formatCents } from '../utils/format';const ACTIVE = ['pending', 'confirmed', 'in_progress'];

export function BookingCard({ booking, onClick }) {
  const isActive = ACTIVE.includes(booking.status);
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick ? () => onClick(booking) : undefined}
      className={`w-full rounded-2xl border p-5 text-left transition ${
        isActive
          ? 'border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 hover:border-cyan-400/60'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-600'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <CustomerBookingStatusPill booking={booking} />
        <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCents(booking.price_cents, booking.currency)}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-100">{booking.service_address}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(booking.scheduled_at).toLocaleString()}</p>
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
