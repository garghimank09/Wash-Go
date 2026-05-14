import { Link } from 'react-router-dom';
import { ArrowRight, Car, CalendarPlus, Inbox } from 'lucide-react';

import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

const ACTIVE = ['pending', 'confirmed', 'in_progress'];

/**
 * Suggests the next in-app step from real booking + car data (no fabricated metrics).
 */
export function DashboardNextActions({ items, itemsLoading, carCount, carsLoading }) {
  if (itemsLoading || carsLoading || carCount == null) return null;

  const hasActive = items.some((b) => ACTIVE.includes(b.status));
  const hasAnyBooking = items.length > 0;
  const noCars = carCount === 0;

  const action = noCars
    ? {
        icon: Car,
        title: 'Add your first vehicle',
        body: 'Save a car to unlock scheduling and faster checkout.',
        to: '/cars',
        cta: 'Add a vehicle',
      }
    : !hasAnyBooking
      ? {
          icon: CalendarPlus,
          title: 'Book your first wash',
          body: 'Pick a package, time, and address — your estimate updates live.',
          to: '/booking',
          cta: 'Start booking',
        }
      : !hasActive
        ? {
            icon: Inbox,
            title: 'No wash in progress',
            body: 'Schedule another wash or review past visits from your bookings list.',
            to: '/booking',
            cta: 'Schedule a wash',
          }
        : null;

  if (!action) return null;

  const { icon: Icon, title, body, to, cta } = action;

  return (
    <Card variant="glass" className="border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-indigo-600/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/20 to-brand-to/20 text-cyan-700 dark:text-cyan-300">
            <Icon className="size-6" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-bold text-wg-text">{title}</h3>
            <p className="mt-1 max-w-xl text-sm text-wg-muted">{body}</p>
          </div>
        </div>
        <Link to={to} className="shrink-0 sm:ml-4">
          <Button size="sm" className="w-full gap-2 sm:w-auto">
            {cta}
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
