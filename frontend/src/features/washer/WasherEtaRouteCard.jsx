import { useId } from 'react';
import { m } from 'framer-motion';
import { MapPin, Navigation, Radio } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

const ROUTE_D = 'M -20 118 C 52 118 68 36 148 52 S 268 22 340 8';

/** Premium navigation + ETA — animated route flow + moving vehicle dot (Uber-style demo). */
export function WasherEtaRouteCard({ etaMinutes, address, phase }) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const liveNav = phase === 'on_the_way' || phase === 'accepted';
  const heading = phase === 'on_the_way' || phase === 'accepted';
  const atSite = phase === 'arrived' || phase === 'wash_started' || phase === 'qc_review' || phase === 'awaiting_approval';
  const serviceMode = phase === 'wash_started' || phase === 'qc_review';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-[0_24px_55px_-22px_rgb(6_182_212/0.5)] ring-1 ring-cyan-500/15 dark:border-white/10 dark:shadow-[0_28px_70px_-18px_rgb(0_0_0/0.88)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background:
            'radial-gradient(ellipse 100% 85% at 12% 100%, rgb(6 182 212 / 0.38), transparent 56%), radial-gradient(ellipse 75% 55% at 92% 0%, rgb(16 185 129 / 0.28), transparent 52%), linear-gradient(168deg, rgb(15 23 42) 0%, rgb(2 6 23) 42%, rgb(6 58 86) 100%)',
        }}
      />
      <div
        className="wg-partner-shimmer-bg pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay dark:opacity-[0.2]"
        style={{
          backgroundImage: 'linear-gradient(110deg, transparent 0%, rgb(255 255 255 / 0.38) 45%, transparent 90%)',
          backgroundPosition: '0% center',
        }}
      />

      <div className="relative h-[10rem] w-full sm:h-44">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <linearGradient id={`wgRouteStroke-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.2" />
              <stop offset="45%" stopColor="rgb(52 211 153)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0.4" />
            </linearGradient>
            <filter id={`wgRouteGlow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Invisible path for motion */}
          <path id={`wgMotion-${uid}`} d={ROUTE_D} fill="none" stroke="none" />
          <path
            d={ROUTE_D}
            fill="none"
            stroke={`url(#wgRouteStroke-${uid})`}
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeDasharray="10 14"
            filter={`url(#wgRouteGlow-${uid})`}
            className={reduced ? '' : 'wg-partner-route-animate'}
            style={reduced ? { strokeDashoffset: 0, opacity: 0.9 } : undefined}
          />
          <circle cx="24" cy="108" r="5" className="fill-white/95" />
          <circle cx="24" cy="108" r="12" className="fill-cyan-400/22 wg-partner-live-dot" />
          <circle cx="300" cy="14" r="4" className="fill-emerald-400 shadow-[0_0_12px_rgb(52_211_153/0.9)]" />

          {!reduced && heading ? (
            <circle r="5" className="fill-white shadow-[0_0_14px_rgb(34_211_238/0.95)]">
              <animateMotion dur="10s" repeatCount="indefinite" rotate="auto" calcMode="linear" keyPoints="0;1" keyTimes="0;1">
                <mpath xlinkHref={`#wgMotion-${uid}`} href={`#wgMotion-${uid}`} />
              </animateMotion>
            </circle>
          ) : null}
        </svg>

        {liveNav && !reduced ? (
          <m.div
            className="absolute left-[18%] top-[38%] size-3 rounded-full bg-white shadow-[0_0_14px_rgb(34_211_238/0.95)]"
            animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.28, 1] }}
            transition={{ duration: 1.45, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
        ) : null}

        <div className="absolute inset-x-0 top-3 flex items-start justify-between px-4">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 shadow-inner backdrop-blur-md">
            <Navigation className="size-3.5 text-cyan-200" strokeWidth={2} aria-hidden />
            {heading ? 'Live navigation' : serviceMode ? 'On-site ops' : 'Route preview'}
          </div>
          {liveNav ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/20 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-50 shadow-sm">
              <Radio className="size-3 text-emerald-200 wg-partner-live-dot" strokeWidth={2} aria-hidden />
              GPS lock
            </span>
          ) : (
            <span className="rounded-full border border-white/12 bg-white/8 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/65 backdrop-blur-sm">
              Demo map
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">ETA</p>
            <p className="mt-0.5 text-3xl font-black tabular-nums tracking-tight text-white drop-shadow-md sm:text-4xl">
              {etaMinutes ?? '—'}
              <span className="ml-1 text-lg font-bold text-white/70">min</span>
            </p>
            {atSite ? (
              <p className="mt-1 text-xs font-semibold text-emerald-100/95">
                {serviceMode ? 'Service lane · QC + proof on deck' : 'Customer zone · confirm handoff'}
              </p>
            ) : heading ? (
              <p className="mt-1 text-xs font-medium text-cyan-100/90">Moving · traffic-aware (demo)</p>
            ) : (
              <p className="mt-1 text-xs font-medium text-white/65">Route standby</p>
            )}
          </div>
          <div className="max-w-[44%] rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-right shadow-inner backdrop-blur-md">
            <p className="text-[9px] font-bold uppercase tracking-wide text-white/50">Next maneuver</p>
            <p className="truncate text-xs font-bold text-white">Market St · slight right</p>
          </div>
        </div>
      </div>

      <div className={cn('relative border-t border-white/12 bg-black/25 px-4 py-3.5 backdrop-blur-xl dark:border-white/10')}>
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/35 to-emerald-500/25 ring-1 ring-white/20 shadow-sm">
            <MapPin className="size-4 text-cyan-50" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Drop-off</p>
            <p className="mt-0.5 text-sm font-bold leading-snug text-white">{address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
