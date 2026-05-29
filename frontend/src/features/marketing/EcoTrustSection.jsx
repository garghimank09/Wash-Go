import { m } from 'framer-motion';
import { Leaf, Map, Package, Route } from 'lucide-react';

import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { MarketingHoverCard } from './MarketingHoverCard';
import { MarketingReveal } from './MarketingReveal';

const ECO_ITEMS = [
  {
    title: 'Water-conscious cleaning',
    body: 'Methods designed to use less water than traditional drive-through washes — without compromising finish quality.',
    icon: Leaf,
  },
  {
    title: 'Smart routing efficiency',
    body: 'Dispatch groups nearby jobs to reduce unnecessary travel — better for neighborhoods and schedules.',
    icon: Route,
  },
  {
    title: 'Eco-minded service products',
    body: 'Thoughtful product choices aligned with a gentler approach to exterior care (where available in your market).',
    icon: Package,
  },
  {
    title: 'Sustainable doorstep ops',
    body: 'One visit, one driveway — fewer trips and less idle time than fragmented errand-style washing.',
    icon: Map,
  },
];

export function EcoTrustSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="eco"
      className="scroll-mt-20 border-y border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.06] via-wg-surface to-wg-surface py-14 dark:from-emerald-500/[0.04] sm:py-16"
    >
      <div className="wg-marketing-container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <MarketingReveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
              <Leaf className="size-3.5" aria-hidden />
              Eco-conscious by design
            </p>
            <h2 className="wg-title mt-4 text-balance">Care that respects your car and your community</h2>
            <p className="mt-4 text-base leading-relaxed text-wg-muted">
              WashGo is built around doorstep convenience with a lighter footprint — honest positioning, not greenwashing.
              We focus on practical choices: less waste, smarter routing, and products selected with care.
            </p>
            <p className="mt-3 text-xs text-wg-muted">
              Impact varies by market and package. Figures on this page are illustrative for demo purposes.
            </p>
          </MarketingReveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {ECO_ITEMS.map((item, i) => (
              <m.div
                key={item.title}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-32px' }}
                transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.32 }}
              >
                <MarketingHoverCard
                  className={cn(
                    'h-full rounded-2xl border border-emerald-500/15 bg-wg-surface-elevated/90 p-5 shadow-sm dark:border-emerald-500/10 dark:bg-wg-surface-elevated/40 hover:border-emerald-500/30 hover:shadow-lg',
                  )}
                >
                <item.icon className="size-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} aria-hidden />
                <h3 className="mt-3 text-sm font-bold text-wg-text">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-wg-muted">{item.body}</p>
                </MarketingHoverCard>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
