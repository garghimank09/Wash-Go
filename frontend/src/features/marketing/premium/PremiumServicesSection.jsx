import { m } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import { MarketingSectionHeader } from './MarketingSectionHeader';
import { SERVICE_CATEGORIES, CAR_SEGMENTS } from './premiumContent';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { cn } from '../../../lib/cn';

export function PremiumServicesSection() {
  const reduced = useReducedMotion();

  return (
    <section id="services" className="wg-premium-section scroll-mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingSectionHeader
          eyebrow="Services"
          title="Packages for every car segment"
          subtitle="From quick exterior rinses to ceramic protection — transparent pricing by vehicle type, like a modern marketplace."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_CATEGORIES.map((cat, i) => (
            <m.article
              key={cat.title}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="wg-premium-glass group relative overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                {cat.tag}
              </span>
              <h3 className="mt-2 text-lg font-bold text-wg-text">{cat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-wg-muted">{cat.desc}</p>
              <Sparkles
                className="absolute -bottom-4 -right-4 size-16 text-cyan-500/10 transition group-hover:text-cyan-500/20"
                aria-hidden
              />
            </m.article>
          ))}
        </div>

        <m.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="wg-premium-glass mt-10 overflow-hidden rounded-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-wg-border/60 bg-white/40 dark:bg-white/[0.03]">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-wg-muted">Segment</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-wg-muted">Exterior</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-wg-muted">Deep clean</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-wg-muted">Ceramic</th>
                </tr>
              </thead>
              <tbody>
                {CAR_SEGMENTS.map((row) => (
                  <tr key={row.segment} className="border-b border-wg-border/40 last:border-0">
                    <td className="px-5 py-4 font-semibold text-wg-text">{row.segment}</td>
                    <td className="px-5 py-4 tabular-nums text-wg-muted">{row.exterior}</td>
                    <td className="px-5 py-4 tabular-nums text-wg-muted">{row.deep}</td>
                    <td className={cn('px-5 py-4 tabular-nums font-semibold text-cyan-700 dark:text-cyan-300')}>
                      {row.ceramic}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </m.div>
      </div>
    </section>
  );
}
