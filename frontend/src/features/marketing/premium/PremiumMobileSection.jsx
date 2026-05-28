import { m } from 'framer-motion';
import { Calendar, Home, Sparkles, User } from 'lucide-react';

import { MarketingSectionHeader } from './MarketingSectionHeader';
import { useReducedMotion } from '../../../lib/useReducedMotion';

const NAV = [
  { icon: Home, label: 'Home' },
  { icon: Calendar, label: 'Bookings' },
  { icon: Sparkles, label: 'Track', active: true },
  { icon: User, label: 'Profile' },
];

export function PremiumMobileSection() {
  const reduced = useReducedMotion();

  return (
    <section className="wg-premium-section scroll-mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingSectionHeader
          eyebrow="Mobile app"
          title="Premium pocket experience"
          subtitle="Gesture-friendly navigation, live tracking, membership wallet, and AI assistant — built mobile-first."
        />

        <m.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-xs"
        >
          <div className="relative rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 p-2 shadow-2xl dark:border-slate-700">
            <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-wg-surface to-cyan-500/10">
              <div className="border-b border-wg-border/50 px-5 pb-3 pt-8">
                <p className="text-xs font-bold uppercase text-wg-muted">Live track</p>
                <p className="text-lg font-black text-wg-text">Washer arriving</p>
                <p className="text-sm text-cyan-600 dark:text-cyan-400">8 min · Deep clean</p>
              </div>
              <div className="aspect-[9/12] bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-950 p-4">
                <div className="h-full rounded-2xl border border-cyan-500/30 bg-cyan-500/5" />
              </div>
              <nav className="flex justify-around border-t border-wg-border/50 bg-white/80 py-3 backdrop-blur-md dark:bg-slate-950/80">
                {NAV.map(({ icon: Icon, label, active }) => (
                  <span
                    key={label}
                    className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
                      active ? 'text-cyan-600 dark:text-cyan-400' : 'text-wg-muted'
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                    {label}
                  </span>
                ))}
              </nav>
            </div>
            <span className="absolute left-1/2 top-3 h-1 w-16 -translate-x-1/2 rounded-full bg-slate-700" aria-hidden />
          </div>
        </m.div>
      </div>
    </section>
  );
}
