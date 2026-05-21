import { useEffect, useState } from 'react';
import { m } from 'framer-motion';

import { useReducedMotion } from '../../../lib/useReducedMotion';
import { useHeroPointerFx } from './useHeroPointerFx';

const CAR_SRC = '/images/hero-sedan.png';

const AMBIENT_DROPS = [
  { left: '22%', top: '20%', delay: 0, dur: 11 },
  { left: '68%', top: '28%', delay: 2, dur: 12 },
  { left: '48%', top: '14%', delay: 4, dur: 10 },
  { left: '78%', top: '55%', delay: 1.5, dur: 13 },
  { left: '30%', top: '65%', delay: 3.5, dur: 11 },
  { left: '55%', top: '72%', delay: 5, dur: 12 },
];

const AMBIENT_DROPS_LITE = AMBIENT_DROPS.slice(0, 3);

function useLiteVisual() {
  const [lite, setLite] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(max-width: 767px)').matches ||
        window.matchMedia('(pointer: coarse)').matches),
  );

  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 767px)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const update = () => setLite(narrow.matches || coarse.matches);
    narrow.addEventListener('change', update);
    coarse.addEventListener('change', update);
    return () => {
      narrow.removeEventListener('change', update);
      coarse.removeEventListener('change', update);
    };
  }, []);

  return lite;
}

function WaterEffect({ effect }) {
  if (effect.kind === 'ripple') {
    return (
      <m.span
        key={effect.id}
        className="wg-hero-visual__ripple pointer-events-none absolute rounded-full"
        style={{
          left: effect.x,
          top: effect.y,
          width: effect.size,
          height: effect.size,
          marginLeft: -effect.size / 2,
          marginTop: -effect.size / 2,
        }}
        initial={{ scale: 0.5, opacity: 0.45 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    );
  }

  return (
    <m.span
      key={effect.id}
      className="wg-hero-visual__particle pointer-events-none absolute rounded-full"
      style={{
        left: effect.x,
        top: effect.y,
        width: effect.size,
        height: effect.size,
        marginLeft: -effect.size / 2,
        marginTop: -effect.size / 2,
      }}
      initial={{ scale: 0.7, opacity: 0.75, x: 0, y: 0 }}
      animate={{
        scale: 0.2,
        opacity: 0,
        x: Math.cos((effect.angle * Math.PI) / 180) * effect.dist,
        y: Math.sin((effect.angle * Math.PI) / 180) * effect.dist - 6,
      }}
      transition={{ duration: 0.85, ease: 'easeOut' }}
    />
  );
}

/**
 * Minimal eco-luxury hero visual — car PNG + cinematic water ambience (CSS only).
 */
export function HeroCinematicVisual({ animate = true }) {
  const reduced = useReducedMotion();
  const lite = useLiteVisual();
  const motionOn = animate && !reduced;
  const pointerOn = motionOn && !lite;

  const { stageRef, tilt, glow, effects, handlePointerMove, handlePointerLeave } =
    useHeroPointerFx(pointerOn);

  const drops = lite ? AMBIENT_DROPS_LITE : AMBIENT_DROPS;

  return (
    <div
      ref={stageRef}
      className={`wg-hero-visual relative mx-auto w-full max-w-[26rem] lg:max-w-none ${motionOn ? 'wg-hero-visual--motion' : ''}`}
      onPointerMove={pointerOn ? handlePointerMove : undefined}
      onPointerLeave={pointerOn ? handlePointerLeave : undefined}
      style={{ '--wg-hero-glow': glow }}
      aria-hidden
    >
      {motionOn ? (
        <div className="wg-hero-visual__drops pointer-events-none absolute inset-0">
          {drops.map((d) => (
            <span
              key={`${d.left}-${d.top}`}
              className="wg-hero-visual__drop"
              style={{
                left: d.left,
                top: d.top,
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.dur}s`,
              }}
            />
          ))}
        </div>
      ) : null}

      <div className="wg-hero-visual__stage relative mx-auto aspect-[5/4] w-full max-w-[min(100%,22rem)] sm:max-w-[24rem] lg:max-w-none">
        <div className="wg-hero-visual__ambience pointer-events-none absolute inset-0" aria-hidden>
          <div className="wg-hero-visual__flow" />
          <div className="wg-hero-visual__wave" />
          <div className="wg-hero-visual__caustics" />
          <div className="wg-hero-visual__mist" />
          <div className="wg-hero-visual__bloom" />
        </div>

        <m.div
          className="wg-hero-visual__car-group absolute inset-x-[6%] bottom-[8%] top-[12%] z-10 flex items-end justify-center"
          animate={
            motionOn
              ? { y: [0, -5, 0], rotateY: tilt.x, rotateX: -tilt.y }
              : undefined
          }
          transition={
            motionOn
              ? {
                  y: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
                  rotateY: { type: 'spring', stiffness: 70, damping: 20 },
                  rotateX: { type: 'spring', stiffness: 70, damping: 20 },
                }
              : undefined
          }
          style={{ transformStyle: 'preserve-3d', perspective: 900 }}
        >
          <div className="wg-hero-visual__underglow pointer-events-none absolute bottom-[6%] left-1/2 z-0 h-[20%] w-[70%] -translate-x-1/2" />
          <div className="wg-hero-visual__shadow pointer-events-none absolute bottom-[2%] left-1/2 z-0 h-[10%] w-[64%] -translate-x-1/2" />

          <img
            src={CAR_SRC}
            alt=""
            width={720}
            height={480}
            decoding="async"
            className="wg-hero-visual__car relative z-10 w-full max-w-none object-contain object-bottom"
            draggable={false}
          />
        </m.div>

        {effects.map((effect) => (
          <WaterEffect key={effect.id} effect={effect} />
        ))}
      </div>
    </div>
  );
}
