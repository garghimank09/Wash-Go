import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Car, Gauge } from 'lucide-react';

import { EmptyState } from '../../../ui/empty-state';
import { Button } from '../../../ui/button';
import { SelectableChip } from '../../../ui/selectable-chip';
import { useReducedMotion } from '../../../lib/useReducedMotion';

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
};

export function VehicleStep({ cars, carId, setCarId }) {
  const reduced = useReducedMotion();

  if (cars.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="Add a vehicle first"
        description="We need a vehicle on file before you can schedule a wash."
      >
        <Link to="/cars">
          <Button size="sm">Open My garage</Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/20 to-brand-to/15 text-cyan-700 dark:text-cyan-300">
          <Gauge className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-wg-text">Select your vehicle</h2>
          <p className="mt-1 text-sm leading-relaxed text-wg-muted">We will match this profile to your wash and arrival window.</p>
        </div>
      </div>

      <m.div
        className="flex flex-wrap gap-2.5"
        variants={reduced ? undefined : listVariants}
        initial={reduced ? false : 'hidden'}
        animate={reduced ? undefined : 'show'}
      >
        {cars.map((c) => (
          <m.div key={c.id} variants={reduced ? undefined : itemVariants}>
            <m.div whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
              <SelectableChip selected={carId === c.id} type="button" onClick={() => setCarId(c.id)} className="min-w-[148px]">
                <span className="flex items-center gap-2">
                  <Car className="size-4 shrink-0 text-cyan-600 opacity-80 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
                  <span className="block font-bold">
                    {c.make} {c.model}
                  </span>
                </span>
                <span className="mt-1 block pl-6 text-xs font-medium text-wg-muted">{c.license_plate}</span>
              </SelectableChip>
            </m.div>
          </m.div>
        ))}
      </m.div>
    </div>
  );
}
