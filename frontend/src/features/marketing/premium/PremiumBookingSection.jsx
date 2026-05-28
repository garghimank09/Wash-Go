import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Calendar, Car, CreditCard, MapPin, Sparkles, Wrench } from 'lucide-react';

import { MarketingSectionHeader } from './MarketingSectionHeader';
import { BOOKING_STEPS } from './premiumContent';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { Button } from '../../../ui/button';

const STEP_ICONS = [Car, Wrench, MapPin, Calendar, CreditCard];

export function PremiumBookingSection() {
  const reduced = useReducedMotion();

  return (
    <section id="booking" className="wg-premium-section scroll-mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingSectionHeader
          eyebrow="Booking"
          title="Five steps. Under a minute."
          subtitle="A Stripe-clean flow with live pricing, AI slot suggestions, and demo payment when you're ready."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-3">
            {BOOKING_STEPS.map((item, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <m.div
                  key={item.step}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="wg-premium-glass flex gap-4 rounded-2xl p-4"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/15 text-sm font-black text-cyan-700 dark:text-cyan-300">
                    {item.step}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-cyan-600 dark:text-cyan-400" aria-hidden />
                      <h3 className="font-bold text-wg-text">{item.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-wg-muted">{item.desc}</p>
                  </div>
                </m.div>
              );
            })}
          </div>

          <m.div
            initial={reduced ? false : { opacity: 0, scale: 0.98 }}
            whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="wg-premium-glass relative overflow-hidden rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-wg-border/50 pb-4">
              <p className="text-sm font-bold text-wg-text">Booking preview</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-800 dark:text-cyan-200">
                <Sparkles className="size-3" aria-hidden />
                AI suggested · 4:30 PM
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between rounded-xl bg-white/50 px-4 py-3 dark:bg-white/5">
                <span className="text-wg-muted">Sedan · Deep clean</span>
                <span className="font-bold tabular-nums">₹1,099</span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/50 px-4 py-3 dark:bg-white/5">
                <span className="text-wg-muted">Est. duration</span>
                <span className="font-semibold">~52 min</span>
              </div>
              <div className="flex justify-between rounded-xl bg-emerald-500/10 px-4 py-3">
                <span className="text-emerald-800 dark:text-emerald-200">Membership credit</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-200">−1 wash</span>
              </div>
            </div>
            <Link to="/booking" className="mt-6 block">
              <Button className="wg-premium-cta w-full">Start booking</Button>
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  );
}
