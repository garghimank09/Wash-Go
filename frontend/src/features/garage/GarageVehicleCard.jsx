import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { CalendarClock, ChevronRight, Droplets, History, Trash2 } from 'lucide-react';

import { CustomerBookingStatusPill } from '../bookings/CustomerBookingStatusPill';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { formatCents } from '../../utils/format';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { garageStatsForCar } from './garageBookings';
import { colorToSwatch } from './vehicleVisual';

function formatWhen(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function GarageVehicleArt({ className }) {
  return (
    <svg className={className} viewBox="0 0 140 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        opacity="0.2"
        d="M4 38h132v6H4v-6Zm8-14 18-10h64l20 10 8 8v6H12v-6l0-8Z"
        fill="currentColor"
        className="text-cyan-600 dark:text-cyan-300"
      />
      <circle cx="34" cy="44" r="6" className="text-wg-muted" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx="106" cy="44" r="6" className="text-wg-muted" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path
        d="M22 28h96c4 0 8 2 10 5l6 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="text-cyan-500/40"
      />
    </svg>
  );
}

export function GarageVehicleCard({ car, bookings, bookingsLoading, onRemove, index }) {
  const reduced = useReducedMotion();
  const stats = garageStatsForCar(car.id, bookings);
  const swatch = colorToSwatch(car.color);
  const title = [car.make, car.model].filter(Boolean).join(' ');
  const plate = car.license_plate || '—';

  return (
    <m.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: reduced ? 0 : index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduced ? undefined : { y: -4 }}
      className="h-full"
    >
      <Card
        variant="glass"
        className={cn(
          'relative h-full min-h-[260px] overflow-hidden border-white/25 shadow-wg-card transition-shadow duration-300',
          'hover:shadow-xl hover:ring-1 hover:ring-cyan-500/25 dark:border-white/10 dark:hover:ring-cyan-400/15',
        )}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-10 size-40 rounded-full blur-2xl"
          style={{ background: swatch.glow }}
        />
        <GarageVehicleArt className="pointer-events-none absolute bottom-0 right-0 w-[55%] text-inherit opacity-90" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <m.span
                className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-2 ring-white/40 dark:ring-white/10"
                style={{
                  background: swatch.dot,
                  boxShadow: `0 12px 40px -8px ${swatch.glow}`,
                }}
                whileHover={reduced ? undefined : { scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                title={swatch.label}
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <Droplets className="relative size-6 text-white drop-shadow-md" strokeWidth={1.75} aria-hidden />
              </m.span>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black tracking-tight text-wg-text">{title}</h3>
                <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-wider text-wg-muted">{plate}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {car.year ? (
                    <span className="rounded-full bg-wg-surface/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-wg-muted ring-1 ring-wg-border dark:bg-white/[0.06]">
                      {car.year}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-wg-surface/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-wg-muted ring-1 ring-wg-border dark:bg-white/[0.06]">
                    {swatch.label}
                  </span>
                  {stats.upcoming ? (
                    <CustomerBookingStatusPill booking={stats.upcoming} className="!px-2 !py-0.5 !text-[10px]" />
                  ) : null}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-rose-500/30 text-rose-700 hover:bg-rose-500/10 dark:text-rose-300"
              onClick={() => onRemove(car)}
              aria-label={`Remove ${title}`}
            >
              <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/20 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-wg-muted">
                <History className="size-3.5" strokeWidth={2} aria-hidden />
                Wash history
              </div>
              <p className="mt-1.5 text-2xl font-black tabular-nums text-wg-text">
                {bookingsLoading ? <span className="text-wg-muted">…</span> : stats.washCount}
              </p>
              <p className="mt-0.5 text-xs text-wg-muted">
                {bookingsLoading
                  ? 'Syncing bookings…'
                  : stats.lastWash
                    ? `Last: ${formatWhen(stats.lastWash.scheduled_at)}`
                    : 'No completed washes yet — your first visit will show here.'}
              </p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-3 dark:border-cyan-500/15 dark:bg-cyan-500/10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-wg-muted">
                <CalendarClock className="size-3.5 text-cyan-700 dark:text-cyan-300" strokeWidth={2} aria-hidden />
                Next wash
              </div>
              {stats.upcoming ? (
                <>
                  <p className="mt-1.5 text-sm font-bold leading-snug text-wg-text">{formatWhen(stats.upcoming.scheduled_at)}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-wg-muted">{stats.upcoming.service_address}</p>
                  <p className="mt-1 text-xs tabular-nums text-wg-muted">
                    {formatCents(stats.upcoming.price_cents, stats.upcoming.currency)}
                  </p>
                  <Link
                    to={`/bookings/${stats.upcoming.id}`}
                    className="mt-2 inline-flex items-center gap-0.5 text-xs font-bold text-cyan-700 hover:underline dark:text-cyan-300"
                  >
                    View booking
                    <ChevronRight className="size-3.5" strokeWidth={2} aria-hidden />
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-1.5 text-sm font-semibold text-wg-text">Nothing scheduled</p>
                  <p className="mt-1 text-xs text-wg-muted">Lock a time and this card becomes your live countdown surface.</p>
                  <Link
                    to="/booking"
                    className="mt-2 inline-flex items-center gap-0.5 text-xs font-bold text-cyan-700 hover:underline dark:text-cyan-300"
                  >
                    Book a wash
                    <ChevronRight className="size-3.5" strokeWidth={2} aria-hidden />
                  </Link>
                </>
              )}
            </div>
          </div>

          {!bookingsLoading && stats.washCount === 0 && !stats.upcoming ? (
            <p className="rounded-lg border border-dashed border-wg-border/80 bg-wg-surface/40 px-3 py-2 text-[11px] leading-relaxed text-wg-muted dark:bg-white/[0.03]">
              <span className="font-semibold text-wg-text">Demo polish:</span> investor walkthroughs look best with one
              scheduled wash — book with this vehicle to light up history and next-slot modules.
            </p>
          ) : null}
        </div>
      </Card>
    </m.div>
  );
}
