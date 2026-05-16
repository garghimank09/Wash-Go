import { AnimatePresence, m } from 'framer-motion';
import { Car, Clock, MapPin, Package, Ruler, Sparkles } from 'lucide-react';

import { PACKAGES, VEHICLE_SIZES } from '../../../constants/config';
import { formatCents } from '../../../utils/format';
import { Card } from '../../../ui/card';
import { useReducedMotion } from '../../../lib/useReducedMotion';

export function ReviewStep({
  cars,
  carId,
  packageId,
  vehicleSize,
  address,
  serviceLat,
  serviceLng,
  scheduledLabel,
  priceCents,
  pricingLoading,
}) {
  const reduced = useReducedMotion();
  const car = cars.find((c) => c.id === carId);
  const pkg = PACKAGES.find((p) => p.id === packageId);
  const size = VEHICLE_SIZES.find((v) => v.id === vehicleSize);

  const rows = [
    {
      key: 'vehicle',
      label: 'Vehicle',
      value: car ? `${car.make} ${car.model}` : '—',
      sub: car ? car.license_plate : null,
      Icon: Car,
    },
    {
      key: 'package',
      label: 'Package',
      value: pkg?.label ?? packageId,
      sub: null,
      Icon: Package,
    },
    {
      key: 'size',
      label: 'Size',
      value: size?.label ?? vehicleSize,
      sub: null,
      Icon: Ruler,
    },
    {
      key: 'address',
      label: 'Service address',
      value: address.trim() || '—',
      sub:
        serviceLat != null && serviceLng != null
          ? `Pin · ${serviceLat.toFixed(4)}, ${serviceLng.toFixed(4)}`
          : null,
      Icon: MapPin,
    },
    {
      key: 'when',
      label: 'Scheduled',
      value: scheduledLabel,
      sub: null,
      Icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/15 text-emerald-800 dark:text-emerald-200">
          <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-wg-text">Review & confirm</h2>
          <p className="mt-1 text-sm leading-relaxed text-wg-muted">Everything below is sent with your booking. Use Back to adjust.</p>
        </div>
      </div>

      <Card variant="glass" className="border-white/35 dark:border-white/10">
        <div className="space-y-0 divide-y divide-white/15 dark:divide-white/10">
          {rows.map((row, i) => {
            const RowIcon = row.Icon;
            return (
            <m.div
              key={row.key}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/35 dark:border-white/10 dark:bg-white/5">
                <RowIcon className="size-4 text-cyan-700 opacity-90 dark:text-cyan-300" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">{row.label}</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-wg-text">
                  {row.value}
                  {row.sub ? <span className="ml-1.5 font-medium text-wg-muted">({row.sub})</span> : null}
                </p>
              </div>
            </m.div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-white/20 pt-4 dark:border-white/10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Estimate</p>
              <p className="mt-1 text-xs text-wg-muted">Live figure from your package & size</p>
            </div>
            <div className="text-right">
              <AnimatePresence mode="wait" initial={false}>
                {pricingLoading ? (
                  <m.span
                    key="l"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    className="text-xl font-bold text-wg-muted"
                  >
                    …
                  </m.span>
                ) : (
                  <m.span
                    key={priceCents ?? 'x'}
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="inline-block bg-gradient-to-r from-cyan-600 to-indigo-700 bg-clip-text text-2xl font-black tabular-nums text-transparent dark:from-cyan-300 dark:to-indigo-300"
                  >
                    {priceCents != null ? formatCents(priceCents) : '—'}
                  </m.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
