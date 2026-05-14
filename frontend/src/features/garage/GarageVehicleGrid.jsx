import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Car, Sparkles } from 'lucide-react';

import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { GarageSkeleton } from './GarageSkeleton';
import { GarageVehicleCard } from './GarageVehicleCard';

export function GarageVehicleGrid({ cars, bookings, loading, bookingsLoading, onRemoveCar }) {
  const reduced = useReducedMotion();

  if (loading) {
    return <GarageSkeleton />;
  }

  if (!cars.length) {
    return (
      <m.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card
          variant="glass"
          className="flex flex-col items-center justify-center border-dashed border-wg-border/90 bg-gradient-to-br from-wg-surface-elevated/95 to-cyan-500/5 py-14 text-center dark:border-white/15"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/20 to-brand-to/15 text-cyan-700 dark:text-cyan-200">
            <Car className="size-8" strokeWidth={1.25} aria-hidden />
          </span>
          <h2 className="wg-heading-section mt-5">Your garage is ready</h2>
          <p className="mt-2 max-w-md text-sm text-wg-muted">
            Add a vehicle on the left — it appears here as a premium card with wash history and next visit once you
            start booking.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-wg-muted">
            <Sparkles className="size-4 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
            <span>Designed for live demos — same APIs as production.</span>
          </div>
          <Link to="/booking" className="mt-8">
            <Button size="sm" variant="outline" className="gap-2">
              Skip to booking
              <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
            </Button>
          </Link>
        </Card>
      </m.div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cars.map((c, i) => (
        <GarageVehicleCard
          key={c.id}
          car={c}
          bookings={bookings}
          bookingsLoading={bookingsLoading}
          onRemove={onRemoveCar}
          index={i}
        />
      ))}
    </div>
  );
}
