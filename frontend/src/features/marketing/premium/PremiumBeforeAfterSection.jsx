import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { m } from 'framer-motion';

import { MarketingSectionHeader } from './MarketingSectionHeader';
import { useReducedMotion } from '../../../lib/useReducedMotion';

const BEFORE_SRC = '/car_images/before_wash_demo.png';
const AFTER_SRC = '/car_images/after_wash_demo.png';

export function PremiumBeforeAfterSection() {
  const reduced = useReducedMotion();
  const [pos, setPos] = useState(50);

  return (
    <section className="wg-premium-section scroll-mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingSectionHeader
          eyebrow="Results"
          title="Cinematic before & after"
          subtitle="Drag to compare — the same premium presentation your customers see in the app."
        />

        <m.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-12 aspect-[16/10] max-h-[520px] w-full overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-wg-border/50"
        >
          {/* After (full — visible on the right of the handle) */}
          <img
            src={AFTER_SRC}
            alt="Car exterior after premium WashGo wash"
            className="absolute inset-0 size-full object-cover object-center"
            draggable={false}
          />

          {/* Before (clipped — visible on the left of the handle) */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            aria-hidden
          >
            <img
              src={BEFORE_SRC}
              alt=""
              className="size-full object-cover object-center"
              draggable={false}
            />
          </div>

          {/* Cinematic vignette + labels */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20"
            aria-hidden
          />
          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm sm:left-6 sm:top-6">
            Before
          </span>
          <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm sm:right-6 sm:top-6">
            After
          </span>

          {/* Divider */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 bg-white shadow-[0_0_24px_rgb(255_255_255/0.85)]"
            style={{ left: `${pos}%` }}
            aria-hidden
          />

          <input
            type="range"
            min={5}
            max={95}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="absolute inset-0 z-20 w-full cursor-ew-resize opacity-0"
            aria-label="Compare before and after car wash results"
          />

          <div
            className="pointer-events-none absolute top-1/2 z-10 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full border-2 border-white bg-white text-slate-900 shadow-lg sm:size-12"
            style={{ left: `${pos}%` }}
            aria-hidden
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </div>
        </m.div>
      </div>
    </section>
  );
}
