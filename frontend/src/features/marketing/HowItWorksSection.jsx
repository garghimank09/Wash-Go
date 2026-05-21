import { m } from 'framer-motion';
import { CalendarCheck, Car, Navigation } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { MarketingHoverCard } from './MarketingHoverCard';
import { MarketingReveal } from './MarketingReveal';

const STEPS = [
  {
    n: '01',
    title: 'Book your wash',
    body: 'Choose your vehicle, package, and arrival window — pricing updates as you go.',
    icon: CalendarCheck,
  },
  {
    n: '02',
    title: 'Track your washer',
    body: 'See assignment, ETA, and live status — the same flow customers use in the app.',
    icon: Navigation,
  },
  {
    n: '03',
    title: 'Enjoy premium car care',
    body: 'Relax while a trusted partner completes the service at your doorstep.',
    icon: Car,
  },
];

export function HowItWorksSection() {
  const reduced = useReducedMotion();

  return (
    <section id="how-it-works" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingReveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">How it works</p>
          <h2 className="wg-title mt-2">Three calm steps to a cleaner car</h2>
          <p className="wg-subtitle mx-auto mt-3 max-w-xl text-base">Simple on mobile. Powerful behind the scenes.</p>
        </MarketingReveal>

        <ol className="relative mt-10 grid gap-6 md:grid-cols-3 md:gap-5">
          <div
            className="pointer-events-none absolute left-[16%] right-[16%] top-14 hidden h-px bg-gradient-to-r from-transparent via-cyan-500/35 to-transparent md:block"
            aria-hidden
          />
          {STEPS.map((step, i) => (
            <m.li
              key={step.title}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: reduced ? 0 : i * 0.08, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative list-none"
            >
              <MarketingHoverCard className="h-full rounded-[var(--radius-wg-xl)] border border-wg-border bg-wg-surface-elevated/90 p-6 shadow-wg-card dark:border-white/10 dark:bg-wg-surface-elevated/50 hover:border-cyan-500/25 hover:shadow-xl">
              <span className="text-[10px] font-black tabular-nums tracking-widest text-cyan-600/80 dark:text-cyan-400/90">
                {step.n}
              </span>
              <span className="mt-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/20 to-brand-to/15 text-cyan-700 dark:text-cyan-300">
                <step.icon className="size-6" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-wg-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-wg-muted">{step.body}</p>
              </MarketingHoverCard>
            </m.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
