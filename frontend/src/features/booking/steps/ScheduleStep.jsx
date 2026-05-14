import { m } from 'framer-motion';
import { Clock, MapPin, Timer } from 'lucide-react';

import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { SelectableChip } from '../../../ui/selectable-chip';
import { cn } from '../../../lib/cn';
import { useReducedMotion } from '../../../lib/useReducedMotion';

const HOURS_PRESET = [3, 24, 48];

const rowVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
};

export function ScheduleStep({ address, setAddress, hours, setHours, scheduledLabel }) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/20 to-brand-to/15 text-cyan-700 dark:text-cyan-300">
          <MapPin className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-wg-text">Where & when</h2>
          <p className="mt-1 text-sm leading-relaxed text-wg-muted">We meet you at this address on the scheduled window.</p>
        </div>
      </div>

      <Input label="Service address" as="textarea" value={address} onChange={(e) => setAddress(e.target.value)} />

      <Card variant="glass" className="border-white/35 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4 dark:border-white/5">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-wg-muted">
              <Clock className="size-3.5" strokeWidth={2} aria-hidden />
              Schedule
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-wg-muted">Must be in the future (validated on the server).</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-900 dark:text-cyan-100">
            <Timer className="size-3.5 shrink-0" aria-hidden />
            <span className="tabular-nums">+{hours}h</span>
          </div>
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-wg-muted">Quick presets</p>
        <m.div
          className="mt-2 flex flex-wrap gap-2"
          variants={reduced ? undefined : rowVariants}
          initial={reduced ? false : 'hidden'}
          animate={reduced ? undefined : 'show'}
        >
          {HOURS_PRESET.map((h) => (
            <m.div key={h} variants={reduced ? undefined : chipVariants}>
              <m.div whileHover={reduced ? undefined : { scale: 1.03 }} whileTap={reduced ? undefined : { scale: 0.97 }}>
                <SelectableChip selected={hours === h} type="button" onClick={() => setHours(h)}>
                  +{h}h
                </SelectableChip>
              </m.div>
            </m.div>
          ))}
        </m.div>

        <label className="mt-5 block text-sm font-medium text-wg-muted">
          Hours from now
          <input
            type="number"
            min={1}
            max={720}
            value={hours}
            onChange={(e) => setHours(Math.min(720, Math.max(1, Number(e.target.value) || 1)))}
            className={cn(
              'mt-1.5 w-full rounded-xl border border-wg-border bg-wg-surface-elevated/90 px-4 py-2.5 text-wg-text shadow-inner backdrop-blur-sm',
              'focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30',
            )}
          />
        </label>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/20 bg-gradient-to-r from-cyan-500/8 via-transparent to-indigo-500/10 p-3.5 dark:border-white/10">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/50 dark:bg-white/10">
            <MapPin className="size-4 text-cyan-700 dark:text-cyan-300" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Arrival window</p>
            <p className="mt-0.5 text-sm font-semibold leading-snug text-wg-text">{scheduledLabel}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
