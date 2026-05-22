import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  Crown,
  Gift,
  Lock,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';

import { usePartnerBookings } from '../../hooks/usePartnerBookings';
import {
  countCompletedWashes,
  countCompletedWashesInWindow,
  getPartnerRewardsState,
} from '../../lib/partnerRewards';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { Card } from '../../ui/card';

const TIER_ICONS = {
  sparkles: Sparkles,
  award: Award,
  zap: Zap,
  gift: Gift,
  star: Star,
  crown: Crown,
};

function TierIcon({ name, className }) {
  const Icon = TIER_ICONS[name] || Trophy;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}

export function WasherRewardsPage() {
  const { items, loading } = usePartnerBookings();
  const reduced = useReducedMotion();

  const completed = useMemo(() => countCompletedWashes(items), [items]);
  const completedWeek = useMemo(() => countCompletedWashesInWindow(items, 7), [items]);
  const rewards = useMemo(() => getPartnerRewardsState(completed), [completed]);

  return (
    <div className="space-y-5">
      <m.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-500/20 text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-100">
            <Trophy className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-black text-wg-text">Rewards</h1>
            <p className="mt-1 text-sm text-wg-muted">
              Unlock perks as you complete washes. Every finished job counts toward the next milestone.
            </p>
          </div>
        </div>
      </m.div>

      <Card
        variant="glass"
        className="overflow-hidden border-amber-500/25 bg-gradient-to-br from-amber-500/12 via-wg-surface-elevated to-orange-500/8 p-5 ring-1 ring-amber-500/20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-900/80 dark:text-amber-200">
              Total washes completed
            </p>
            <p className="mt-1 text-4xl font-black tabular-nums text-wg-text">
              {loading ? '—' : rewards.completedCount}
            </p>
            <p className="mt-1 text-xs text-wg-muted">
              {loading ? '…' : `${completedWeek} completed this week`}
              {rewards.unlockedCount > 0
                ? ` · ${rewards.unlockedCount} reward${rewards.unlockedCount === 1 ? '' : 's'} unlocked`
                : ''}
            </p>
          </div>
          {rewards.currentTier ? (
            <div className="rounded-2xl border border-amber-500/30 bg-white/40 px-4 py-3 text-right dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase text-wg-muted">Current tier</p>
              <p className="mt-0.5 text-sm font-black text-wg-text">{rewards.currentTier.title}</p>
            </div>
          ) : null}
        </div>

        {rewards.nextTier ? (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-wg-muted">
              <span>
                Next: <span className="text-wg-text">{rewards.nextTier.title}</span> at{' '}
                {rewards.nextTier.washesRequired} washes
              </span>
              <span className="tabular-nums">
                {rewards.completedCount}/{rewards.nextTier.washesRequired}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <m.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300"
                initial={false}
                animate={{ width: `${rewards.progressPct}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              />
            </div>
            <p className="mt-2 text-xs text-wg-muted">
              {rewards.nextTier.washesAway === 0
                ? 'Complete your next wash to claim it.'
                : `${rewards.nextTier.washesAway} more wash${rewards.nextTier.washesAway === 1 ? '' : 'es'} to unlock`}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            You&apos;ve unlocked every milestone — elite status achieved.
          </p>
        )}
      </Card>

      <div>
        <h2 className="wg-heading-section">Milestones</h2>
        <p className="mt-1 text-xs text-wg-muted">Based on lifetime completed washes on WashGo Partner.</p>
        <ul className="mt-4 space-y-3">
          {rewards.tiers.map((tier, i) => {
            const Icon = TIER_ICONS[tier.icon] || Trophy;
            return (
              <m.li
                key={tier.id}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : i * 0.04 }}
              >
                <Card
                  variant="glass"
                  className={cn(
                    'flex gap-4 p-4 transition',
                    tier.unlocked
                      ? 'border-emerald-500/25 bg-emerald-500/[0.06] ring-1 ring-emerald-500/15'
                      : 'border-wg-border/80 opacity-90',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-xl',
                      tier.unlocked
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-wg-surface text-wg-muted ring-1 ring-wg-border',
                    )}
                  >
                    {tier.unlocked ? (
                      <CheckCircle2 className="size-5" aria-hidden />
                    ) : (
                      <Icon className="size-5 opacity-70" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-wg-text">{tier.title}</p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          tier.unlocked
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                            : 'bg-wg-surface text-wg-muted ring-1 ring-wg-border',
                        )}
                      >
                        {tier.washesRequired} wash{tier.washesRequired === 1 ? '' : 'es'}
                      </span>
                      {!tier.unlocked ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-wg-muted">
                          <Lock className="size-3" aria-hidden />
                          Locked
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-wg-muted">{tier.perk}</p>
                  </div>
                  <TierIcon
                    name={tier.icon}
                    className={cn(
                      'size-6 shrink-0 self-center',
                      tier.unlocked ? 'text-amber-600 dark:text-amber-400' : 'text-wg-muted/50',
                    )}
                  />
                </Card>
              </m.li>
            );
          })}
        </ul>
      </div>

      <Card variant="inset" className="p-4 text-sm text-wg-muted">
        <p>
          Complete jobs from{' '}
          <Link to="/partner/requests" className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300">
            Offers
          </Link>{' '}
          and mark them done on the job screen. Rewards update automatically when status is{' '}
          <strong className="text-wg-text">completed</strong>.
        </p>
      </Card>
    </div>
  );
}
