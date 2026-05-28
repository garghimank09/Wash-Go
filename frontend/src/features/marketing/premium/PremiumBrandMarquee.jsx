import { BRAND_LOGOS } from './premiumContent';

export function PremiumBrandMarquee() {
  const track = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <section className="border-y border-wg-border/60 bg-wg-surface-elevated/50 py-10 dark:bg-slate-950/40">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-wg-muted">
        Trusted by owners of leading brands
      </p>
      <div className="wg-premium-marquee mt-6 overflow-hidden">
        <div className="wg-premium-marquee-track flex w-max gap-12 px-6">
          {track.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-lg font-black tracking-tight text-wg-muted/40 transition hover:text-wg-muted/70 dark:text-white/20 dark:hover:text-white/40"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
