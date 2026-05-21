import { m } from 'framer-motion';
import { Droplets, Star, Timer } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { MarketingReveal } from './MarketingReveal';

const STATS = [
  { value: '4.9', label: 'Customer rating', sub: 'Demo', icon: Star },
  { value: '< 60s', label: 'Target book time', sub: null, icon: Timer },
  { value: 'Eco', label: 'Conscious methods', sub: null, icon: Droplets },
];

export function MarketingStatsStrip() {
  const reduced = useReducedMotion();

  return (
    <section className="relative border-b border-wg-border bg-wg-surface-elevated/60 py-8 dark:bg-wg-surface/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:justify-start">
            {STATS.map((s, i) => (
              <m.div
                key={s.label}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduced ? 0 : i * 0.06, duration: 0.32 }}
                className="wg-marketing-stat-pill min-w-[7.5rem] text-center"
              >
                <s.icon className="mx-auto size-4 text-cyan-600/80 dark:text-cyan-400/90" strokeWidth={2} aria-hidden />
                <p className="mt-2 text-2xl font-black tabular-nums text-wg-text sm:text-3xl">{s.value}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-wg-muted">{s.label}</p>
                {s.sub ? (
                  <span className="mt-1 inline-block rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:text-amber-200">
                    {s.sub}
                  </span>
                ) : null}
              </m.div>
            ))}
          </div>
          <MarketingReveal className="max-w-md text-center text-xs leading-relaxed text-wg-muted lg:text-right">
            Illustrative metrics for investor storytelling — connect live analytics at launch.
          </MarketingReveal>
        </div>
      </div>
    </section>
  );
}
