import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import { Button } from '../../ui/button';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { HeroAmbientBackground } from './hero/HeroAmbientBackground';
import { HeroCinematicVisual } from './hero/HeroCinematicVisual';
import { HERO_TRUST } from './premium/premiumContent';
import { marketingContainer, marketingItem } from './marketingMotion';

export function MarketingHero() {
  const reduced = useReducedMotion();

  return (
    <section className="wg-marketing-noise relative overflow-hidden border-b border-wg-border">
      <HeroAmbientBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-[5.5rem]">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <m.div
            variants={marketingContainer(reduced)}
            initial="hidden"
            animate="show"
            className="relative max-w-3xl lg:max-w-[42rem]"
          >
          <div
            className="wg-hero-headline-glow pointer-events-none absolute -left-10 top-8 h-56 w-[min(100%,32rem)] rounded-full blur-3xl max-md:-left-6 max-md:h-40"
            aria-hidden
          />

          <m.p
            variants={marketingItem(reduced)}
            className="wg-hero-glass-pill relative inline-flex items-center gap-2 rounded-full border border-emerald-500/25 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800 backdrop-blur-md"
          >
            <Sparkles className="size-3.5" strokeWidth={2} aria-hidden />
            AI-Powered Doorstep Car Care
          </m.p>

          <m.h1 variants={marketingItem(reduced)} className="wg-hero relative mt-6 max-w-[38rem] leading-[1.06]">
            Car care that comes to you —{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              gentle on your car, kinder to the planet.
            </span>
          </m.h1>

          <m.p
            variants={marketingItem(reduced)}
            className="relative mt-6 max-w-[34rem] text-base leading-relaxed text-wg-muted sm:text-lg sm:leading-relaxed"
          >
            Book premium doorstep cleaning with real-time tracking, eco-safe products, and AI-powered scheduling.
          </m.p>

          <m.div variants={marketingItem(reduced)} className="relative mt-10 flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <Link to="/signup" className="inline-block">
              {reduced ? (
                <Button size="lg" className="wg-premium-cta wg-marketing-cta-shimmer relative overflow-hidden">
                  Book your wash
                </Button>
              ) : (
                <m.span
                  className="inline-block"
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <Button size="lg" className="wg-premium-cta wg-marketing-cta-shimmer relative overflow-hidden">
                    Book your wash
                  </Button>
                </m.span>
              )}
            </Link>
            <Link to="/membership/plans">
              <Button
                size="lg"
                variant="outline"
                className="border-white/60 bg-white/50 shadow-sm backdrop-blur-sm transition duration-300 hover:border-cyan-500/35 hover:bg-white/70"
              >
                Explore membership
              </Button>
            </Link>
          </m.div>

          <m.ul
            variants={marketingItem(reduced)}
            className="relative mt-10 grid gap-2 sm:grid-cols-2 sm:mt-11"
            aria-label="Trust indicators"
          >
            {HERO_TRUST.map(({ label, sub }) => (
              <li key={label}>
                <span className="wg-hero-glass-pill block rounded-2xl border border-white/50 px-4 py-3 backdrop-blur-sm">
                  <span className="block text-sm font-bold text-wg-text">{label}</span>
                  <span className="block text-xs text-wg-muted">{sub}</span>
                </span>
              </li>
            ))}
          </m.ul>
          </m.div>

          <m.div
            variants={marketingItem(reduced)}
            initial="hidden"
            animate="show"
            className="relative hidden min-h-[300px] lg:block"
          >
            <HeroCinematicVisual animate={!reduced} />
          </m.div>
        </div>

        <m.div
          variants={marketingItem(reduced)}
          initial="hidden"
          animate="show"
          className="relative mt-10 lg:hidden"
        >
          <HeroCinematicVisual animate={!reduced} />
        </m.div>
      </div>
    </section>
  );
}
