import { m } from 'framer-motion';
import { MessageCircle, Navigation, Phone, Star } from 'lucide-react';

import { MarketingSectionHeader } from './MarketingSectionHeader';
import { useReducedMotion } from '../../../lib/useReducedMotion';

export function PremiumTrackingSection() {
  const reduced = useReducedMotion();

  return (
    <section id="tracking" className="wg-premium-section-dark relative scroll-mt-28 overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgb(34_211_238/0.12),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingSectionHeader
          eyebrow="Live tracking"
          title="Uber-grade visibility for every wash"
          subtitle="Watch your washer approach, chat in-app, and follow wash milestones in real time."
        />

        <m.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
        >
          <div className="grid min-h-[420px] lg:grid-cols-5">
            <div className="relative lg:col-span-3">
              <div
                className="absolute inset-0 bg-[linear-gradient(160deg,#0f172a_0%,#020617_50%,#0c4a6e_100%)]"
                aria-hidden
              />
              <svg className="absolute inset-0 h-full w-full opacity-80" viewBox="0 0 800 420" aria-hidden>
                <path
                  d="M80 320 Q 200 280 320 240 T 560 120 T 720 80"
                  fill="none"
                  stroke="url(#route)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="12 8"
                  className="wg-partner-route-animate"
                />
                <defs>
                  <linearGradient id="route" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <circle cx="720" cy="80" r="10" fill="#22d3ee" className="wg-partner-live-dot" />
                <circle cx="80" cy="320" r="8" fill="#34d399" />
              </svg>
              <div className="absolute left-4 top-4 rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                <Navigation className="mr-1.5 inline size-3.5 text-cyan-400" aria-hidden />
                ETA 8 min · 2.4 km
              </div>
            </div>
            <div className="flex flex-col justify-between border-t border-white/10 bg-slate-900/80 p-6 lg:col-span-2 lg:border-l lg:border-t-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Washer en route</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-lg font-black text-white">
                    AK
                  </span>
                  <div>
                    <p className="font-bold text-white">Anil K.</p>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                      4.9 · 320 washes
                    </p>
                  </div>
                </div>
                <ol className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-emerald-400 mt-1.5" />
                    Assigned · 2:14 PM
                  </li>
                  <li className="flex gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-cyan-400 mt-1.5 wg-partner-live-dot" />
                    En route · now
                  </li>
                  <li className="flex gap-2 opacity-50">
                    <span className="size-2 shrink-0 rounded-full bg-slate-500 mt-1.5" />
                    Wash in progress
                  </li>
                </ol>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white"
                >
                  <Phone className="size-4" aria-hidden />
                  Call
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500/20 py-2.5 text-sm font-semibold text-cyan-100"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Chat
                </button>
              </div>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
