import { m } from 'framer-motion';
import { Bot, Clock, Droplets, MapPin, Shield, Sparkles } from 'lucide-react';

import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { MarketingHoverCard } from './MarketingHoverCard';
import { MarketingReveal } from './MarketingReveal';

const CARDS = [
  {
    title: 'Doorstep convenience',
    body: 'Schedule washes at home or work — no queues, no detours, no waiting rooms.',
    icon: MapPin,
    tint: 'from-cyan-500/14 to-indigo-600/8',
    iconClass: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    title: 'Eco-safe cleaning approach',
    body: 'Water-conscious methods and thoughtful product choices designed to reduce waste.',
    icon: Droplets,
    tint: 'from-emerald-500/14 to-teal-500/8',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Trusted washer network',
    body: 'Vetted partners, ratings, and repeat-customer signals — quality you can see.',
    icon: Shield,
    tint: 'from-indigo-500/12 to-violet-500/8',
    iconClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Real-time booking & tracking',
    body: 'Book in under a minute and follow status from request to completion.',
    icon: Clock,
    tint: 'from-amber-500/12 to-orange-500/6',
    iconClass: 'text-amber-700 dark:text-amber-300',
  },
  {
    title: 'Premium care standards',
    body: 'Packages tuned for everyday drivers and detail-minded owners alike.',
    icon: Sparkles,
    tint: 'from-rose-500/10 to-pink-500/6',
    iconClass: 'text-rose-600 dark:text-rose-400',
  },
];

export function WhyWashGoSection() {
  const reduced = useReducedMotion();

  return (
    <section id="why-washgo" className="wg-premium-section scroll-mt-28 border-b border-wg-border bg-wg-surface-elevated/30 dark:bg-wg-surface/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingReveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Why WashGo</p>
          <h2 className="wg-title mt-2">Service you can feel good about</h2>
          <p className="wg-subtitle mx-auto mt-3 max-w-2xl text-base">
            A modern mobile car-care brand — warm, trustworthy, and built for real-world driveways.
          </p>
        </MarketingReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <m.div
              key={card.title}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(i === 4 && 'sm:col-span-2 lg:col-span-1')}
            >
              <MarketingHoverCard
                className={cn(
                  'group h-full rounded-[var(--radius-wg-xl)] border border-wg-border bg-gradient-to-br p-6 shadow-wg-card backdrop-blur-sm dark:border-white/10',
                  'hover:border-cyan-500/20 hover:shadow-xl',
                  card.tint,
                )}
              >
              <span
                className={cn(
                  'flex size-11 items-center justify-center rounded-xl border border-white/25 bg-wg-surface-elevated/80 shadow-sm transition group-hover:scale-105 dark:border-white/10',
                  card.iconClass,
                )}
              >
                <card.icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-wg-text">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-wg-muted">{card.body}</p>
              </MarketingHoverCard>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
