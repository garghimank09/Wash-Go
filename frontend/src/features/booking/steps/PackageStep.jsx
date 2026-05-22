import { AnimatePresence, m } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import { CarFront, Crown, Droplets, Sparkles, Star } from 'lucide-react';

import { PACKAGES, VEHICLE_SIZES } from '../../../constants/config';
import { formatCents } from '../../../utils/format';
import { Card } from '../../../ui/card';
import { SelectableChip } from '../../../ui/selectable-chip';
import { cn } from '../../../lib/cn';
import { useReducedMotion } from '../../../lib/useReducedMotion';

const PKG_ICONS = {
  basic: Droplets,
  deluxe: Sparkles,
  super_deluxe: Star,
  premium: Crown,
};

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] } },
};

export function PackageStep({
  packageId,
  setPackageId,
  vehicleSize,
  setVehicleSize,
  priceCents,
  pricingLoading,
}) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/20 to-brand-to/15 text-cyan-700 dark:text-cyan-300">
          <CarFront className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-wg-text">Package & vehicle size</h2>
          <p className="mt-1 text-sm leading-relaxed text-wg-muted">
            Pick your wash tier — price updates live for your vehicle size.
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">Wash tier</p>
        <m.div
          className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          variants={reduced ? undefined : gridVariants}
          initial={reduced ? false : 'hidden'}
          animate={reduced ? undefined : 'show'}
        >
          {PACKAGES.map((p) => {
            const Icon = PKG_ICONS[p.id] ?? Sparkles;
            const selected = packageId === p.id;
            return (
              <m.div key={p.id} variants={reduced ? undefined : cardVariants} className="relative">
                {p.badge ? (
                  <span
                    className={cn(
                      'absolute -top-2 right-3 z-[1] rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow',
                      p.badge === 'Popular'
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500',
                    )}
                  >
                    {p.badge}
                  </span>
                ) : null}
                <m.button
                  type="button"
                  whileHover={reduced ? undefined : { y: -2 }}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  onClick={() => setPackageId(p.id)}
                  className={cn(
                    'flex h-full w-full flex-col rounded-2xl border p-4 text-left transition-shadow duration-200',
                    'bg-wg-surface-elevated/50 shadow-sm backdrop-blur-sm dark:bg-wg-surface-elevated/35',
                    selected
                      ? 'border-cyan-500/60 bg-gradient-to-br from-cyan-500/12 via-indigo-600/8 to-transparent shadow-[0_0_0_1px_rgba(6,182,212,0.2),0_12px_32px_rgba(6,182,212,0.12)] dark:shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_16px_40px_rgba(34,211,238,0.1)]'
                      : 'border-wg-border/90 hover:border-cyan-500/35 hover:shadow-md',
                  )}
                >
                  <span
                    className={cn(
                      'mb-3 flex size-10 items-center justify-center rounded-xl border border-white/30 bg-white/40 dark:border-white/10 dark:bg-white/5',
                      selected && 'border-cyan-400/35 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200',
                    )}
                  >
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="font-bold text-wg-text">{p.label}</span>
                  <span className="mt-1 text-xs leading-snug text-wg-muted">{p.desc}</span>
                  <ul className="mt-3 flex flex-1 flex-col gap-1 border-t border-wg-border/60 pt-3 dark:border-white/10">
                    {(p.features ?? []).slice(0, 4).map((f) => (
                      <li key={f} className="text-[11px] leading-snug text-wg-muted">
                        <span className="text-cyan-600 dark:text-cyan-400">· </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </m.button>
              </m.div>
            );
          })}
        </m.div>
      </div>

      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-wg-muted">
          Vehicle size
        </p>
        <m.div
          className="mt-3 flex flex-wrap gap-2"
          variants={reduced ? undefined : gridVariants}
          initial={reduced ? false : 'hidden'}
          animate={reduced ? undefined : 'show'}
        >
          {VEHICLE_SIZES.map((v) => (
            <m.div key={v.id} variants={reduced ? undefined : cardVariants}>
              <m.div whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
                <SelectableChip selected={vehicleSize === v.id} type="button" onClick={() => setVehicleSize(v.id)}>
                  {v.label}
                </SelectableChip>
              </m.div>
            </m.div>
          ))}
        </m.div>
      </div>

      <Card variant="glass" className="border-white/35 dark:border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-wg-muted">Estimated price</h3>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-wg-muted">
              {PACKAGES.find((p) => p.id === packageId)?.label ?? 'Selected tier'} · estimate for your size — final
              price confirmed at booking.
            </p>
          </div>
        </div>
        <div className="relative mt-4 min-h-[3rem] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {pricingLoading ? (
              <m.div
                key="load"
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Skeleton height={40} width={200} borderRadius={10} />
              </m.div>
            ) : priceCents != null ? (
              <m.p
                key={priceCents}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 bg-clip-text text-3xl font-black tabular-nums tracking-tight text-transparent dark:from-cyan-300 dark:via-indigo-300 dark:to-indigo-200"
              >
                {formatCents(priceCents)}
              </m.p>
            ) : (
              <m.div key="sk2" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
                <Skeleton height={40} width={160} borderRadius={10} />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}
