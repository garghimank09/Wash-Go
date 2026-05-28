import { useState } from 'react';
import { m } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

import { MarketingSectionHeader } from './MarketingSectionHeader';
import { TESTIMONIALS } from './premiumContent';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { Button } from '../../../ui/button';

export function PremiumTestimonialsSection() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const t = TESTIMONIALS[index];

  return (
    <section className="wg-premium-section wg-premium-section-alt scroll-mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingSectionHeader
          eyebrow="Testimonials"
          title="Loved by drivers who expect more"
          subtitle="Real stories from customers who switched from traditional local washers."
        />

        <m.div
          key={t.name}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="wg-premium-glass relative mx-auto mt-12 max-w-3xl rounded-3xl p-8 sm:p-10"
        >
          <div className="flex gap-1 text-amber-500" aria-label={`${t.rating} stars`}>
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="size-5 fill-current" aria-hidden />
            ))}
          </div>
          <blockquote className="mt-6 text-xl font-medium leading-relaxed text-wg-text sm:text-2xl">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <footer className="mt-6 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 text-sm font-black text-white">
              {t.name
                .split(' ')
                .map((w) => w[0])
                .join('')}
            </span>
            <div>
              <p className="font-bold text-wg-text">{t.name}</p>
              <p className="text-sm text-wg-muted">{t.role}</p>
            </div>
          </footer>
          <div className="mt-8 flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIndex((i) => (i + 1) % TESTIMONIALS.length)}
              aria-label="Next testimonial"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </m.div>
      </div>
    </section>
  );
}
