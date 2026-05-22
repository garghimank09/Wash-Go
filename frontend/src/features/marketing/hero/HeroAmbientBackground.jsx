import { useEffect, useState } from 'react';

import { useReducedMotion } from '../../../lib/useReducedMotion';
import { HeroFloatingBubble } from './HeroFloatingBubble';
import { HERO_BUBBLES_DESKTOP, HERO_BUBBLES_MOBILE } from './heroBubbleConfig';

function useNarrowViewport() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const fn = () => setNarrow(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  return narrow;
}

/** Layered eco-luxury hero atmosphere — mesh → gloss → wave → bubbles → car hint */
export function HeroAmbientBackground() {
  const reduced = useReducedMotion();
  const narrow = useNarrowViewport();
  const bubbles = narrow ? HERO_BUBBLES_MOBILE : HERO_BUBBLES_DESKTOP;
  const animate = !reduced;

  return (
    <div className="wg-hero-ambient pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`wg-hero-mesh absolute inset-0 ${animate ? 'wg-hero-mesh--animate' : ''}`} />

      <div className={`wg-hero-gloss absolute inset-0 ${animate ? 'wg-hero-gloss--animate' : ''}`}>
        <div className="wg-hero-gloss-sheen absolute left-[8%] top-[18%] h-32 w-48 rotate-[-8deg] rounded-full bg-white/40 blur-2xl max-md:opacity-60" />
        <div className="wg-hero-gloss-sheen absolute right-[12%] top-[32%] h-24 w-36 rotate-[12deg] rounded-full bg-sky-200/50 blur-xl max-md:hidden" />
      </div>

      <div className={`wg-hero-wave absolute inset-x-0 bottom-0 h-[32%] max-md:h-[26%] ${animate ? 'wg-hero-wave--animate' : ''}`}>
        <svg
          className="wg-hero-wave-svg h-full w-[200%] min-w-[200%]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wg-hero-wave-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(186 230 253 / 0.35)" />
              <stop offset="100%" stopColor="rgb(224 242 254 / 0.08)" />
            </linearGradient>
          </defs>
          <path
            fill="url(#wg-hero-wave-fill)"
            d="M0,192L48,197.3C96,203,192,213,288,218.7C384,224,480,224,576,208C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <path
            fill="rgb(167 243 208 / 0.12)"
            d="M0,256L60,250.7C120,245,240,235,360,229.3C480,224,600,224,720,213.3C840,203,960,181,1080,181.3C1200,181,1320,203,1380,213.3L1440,224L1440,320L0,320Z"
          />
        </svg>
      </div>

      <div className="wg-hero-bubbles absolute inset-0 max-md:opacity-90">
        {bubbles.map((b) => (
          <HeroFloatingBubble key={b.id} {...b} animate={animate} />
        ))}
      </div>

      <div className={`wg-hero-orbs absolute inset-0 ${animate ? 'wg-hero-orbs--animate' : ''}`}>
        <div className="wg-hero-orb wg-hero-orb--mint absolute -left-16 top-10 h-72 w-72 max-md:h-52 max-md:w-52 max-md:blur-[72px]" />
        <div className="wg-hero-orb wg-hero-orb--aqua absolute right-0 top-[22%] h-64 w-80 max-md:h-48 max-md:w-56 max-md:blur-[64px]" />
        <div className="wg-hero-orb wg-hero-orb--sky absolute bottom-[18%] left-[30%] h-48 w-96 max-md:hidden" />
      </div>

    </div>
  );
}
