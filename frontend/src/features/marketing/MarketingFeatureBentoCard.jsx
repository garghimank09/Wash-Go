import { m } from 'framer-motion';

import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { FeatureCardMicroVisual } from './FeatureCardMicroVisual';
import { MarketingHoverCard } from './MarketingHoverCard';

export function MarketingFeatureBentoCard({ item, className }) {
  const reduced = useReducedMotion();
  const Icon = item.icon;

  return (
    <MarketingHoverCard
      className={cn(
        'group relative h-full min-h-[220px] overflow-hidden rounded-[var(--radius-wg-xl)] p-6 sm:min-h-[240px]',
        'border border-white/40 bg-gradient-to-br shadow-wg-card backdrop-blur-md',
        'ring-1 ring-inset ring-white/30 dark:border-white/12 dark:ring-white/8',
        'transition-[box-shadow,border-color] duration-500',
        'hover:border-cyan-400/35 hover:shadow-[0_20px_50px_-16px_rgba(6,182,212,0.28)]',
        item.surface,
        item.tint,
        className,
      )}
    >
      {/* Layered ambient lighting */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br from-white/50 to-transparent opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90 dark:from-white/15"
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute -bottom-8 -left-8 size-36 rounded-full blur-3xl transition-opacity duration-500',
          item.glow,
          'opacity-50 group-hover:opacity-80',
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-transparent opacity-80 dark:from-white/[0.04]"
        aria-hidden
      />

      <FeatureCardMicroVisual variant={item.visual} />

      <div className="relative z-[1] flex h-full flex-col pb-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-wg-muted/90">{item.microLabel}</p>

        <m.div
          className={cn(
            'mt-4 flex size-12 items-center justify-center rounded-2xl border shadow-sm',
            'bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-sm',
            'border-white/50 transition duration-500 dark:from-white/12 dark:to-white/5 dark:border-white/15',
            item.iconWrap,
          )}
          whileHover={reduced ? undefined : { y: -2, scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          <Icon
            className={cn('size-6 transition duration-500 group-hover:drop-shadow-sm', item.iconColor)}
            strokeWidth={1.75}
            aria-hidden
          />
        </m.div>

        <h3 className="mt-5 text-lg font-bold leading-snug tracking-tight text-wg-text sm:text-xl">
          {item.titleHighlight ? (
            <>
              {item.titlePrefix}
              <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', item.titleGradient)}>
                {item.titleHighlight}
              </span>
              {item.titleSuffix}
            </>
          ) : (
            item.title
          )}
        </h3>

        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-wg-muted/95">{item.body}</p>
      </div>
    </MarketingHoverCard>
  );
}
