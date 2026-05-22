import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';

import { useWashTiersOptional } from '../../context/WashTiersContext';
import { Card } from '../../ui/card';
import { useReducedMotion } from '../../lib/useReducedMotion';

/** Loyalty + membership progress — demo-safe, no extra API. */
export function DashboardLoyaltyRewards({ completedCount }) {
  const reduced = useReducedMotion();
  const points = Math.min(5000, completedCount * 120 + 240);
  const tierProgress = Math.min(95, 22 + Math.min(completedCount, 8) * 9);

  return (
    <Card
      variant="glass"
      className="border-indigo-200/30 bg-gradient-to-br from-indigo-500/8 via-wg-surface-elevated/95 to-cyan-500/8 dark:border-indigo-500/15"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Gift className="size-5 text-indigo-600 dark:text-indigo-300" strokeWidth={1.75} aria-hidden />
          <h2 className="wg-heading-section">Rewards</h2>
        </div>
        <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-800 dark:text-indigo-200">
          Plus preview
        </span>
      </div>
      <p className="mt-2 text-2xl font-black tabular-nums text-wg-text">{points.toLocaleString()}</p>
      <p className="text-xs font-medium text-wg-muted">points · grows with every completed wash</p>
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-wg-muted">
          <span>Next perk</span>
          <span>{tierProgress}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-wg-border/80 dark:bg-white/10">
          <m.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
            initial={reduced ? false : { width: 0 }}
            animate={{ width: `${tierProgress}%` }}
            transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-wg-muted">WashGo Plus will unlock priority slots and bonus multipliers.</p>
    </Card>
  );
}

export function DashboardRecommendedWash({ completedCount }) {
  const reduced = useReducedMotion();
  const { tiers } = useWashTiersOptional();
  const rec =
    completedCount >= 3
      ? tiers.find((p) => p.id === 'premium')
      : tiers.find((p) => p.id === 'super_deluxe');

  return (
    <Card variant="glass" className="transition hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/10">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
        <h2 className="wg-heading-section">Recommended for you</h2>
      </div>
      <m.div
        className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/10"
        whileHover={reduced ? undefined : { scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <p className="text-sm font-bold text-wg-text">{rec?.label ?? 'Deluxe'}</p>
        <p className="mt-1 text-xs text-wg-muted">{rec?.desc}</p>
        <Link to="/booking" className="mt-3 inline-block text-xs font-bold text-cyan-700 hover:underline dark:text-cyan-300">
          Use in next booking →
        </Link>
      </m.div>
    </Card>
  );
}
