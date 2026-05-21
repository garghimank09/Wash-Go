import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Droplets, Home, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

import { Button } from '../../ui/button';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { HeroAmbientBackground } from './hero/HeroAmbientBackground';
import { HeroCinematicVisual } from './hero/HeroCinematicVisual';
import { marketingContainer, marketingItem } from './marketingMotion';

const TRUST_PILLS = [
  { label: 'Eco-conscious car care', icon: Leaf },
  { label: 'Water-saving wash process', icon: Droplets },
  { label: 'Doorstep convenience', icon: Home },
  { label: 'Trusted mobile washers', icon: ShieldCheck },
];

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
            Premium doorstep car care
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
            Book trusted mobile washers, track every visit, and enjoy a calmer driveway experience — with eco-minded
            products and water-conscious methods built into every service.
          </m.p>

          <m.div variants={marketingItem(reduced)} className="relative mt-10 flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <Link to="/signup" className="inline-block">
              {reduced ? (
                <Button size="lg" className="wg-marketing-cta-shimmer wg-marketing-hero-cta relative overflow-hidden">
                  Book your first wash
                </Button>
              ) : (
                <m.span
                  className="inline-block"
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <Button
                    size="lg"
                    className="wg-marketing-cta-shimmer wg-marketing-hero-cta relative overflow-hidden transition-shadow duration-300"
                  >
                    Book your first wash
                  </Button>
                </m.span>
              )}
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/60 bg-white/50 shadow-sm backdrop-blur-sm transition duration-300 hover:border-cyan-500/35 hover:bg-white/70"
              >
                I have an account
              </Button>
            </Link>
          </m.div>

          <m.ul
            variants={marketingItem(reduced)}
            className="relative mt-10 flex flex-wrap gap-2.5 sm:mt-11"
            aria-label="Service highlights"
          >
            {TRUST_PILLS.map(({ label, icon: Icon }) => (
              <li key={label}>
                <span className="wg-hero-glass-pill inline-flex items-center gap-1.5 rounded-full border border-white/50 px-3.5 py-2 text-xs font-semibold text-wg-text backdrop-blur-sm transition duration-300 hover:border-emerald-500/30 hover:shadow-md">
                  <Icon className="size-3.5 shrink-0 text-emerald-600/90" strokeWidth={2} aria-hidden />
                  {label}
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
