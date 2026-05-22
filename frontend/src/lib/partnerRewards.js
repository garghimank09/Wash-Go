/**
 * Partner rewards tiers — unlocked by total completed washes.
 * Demo perks (copy only); no payout API yet.
 */

export const PARTNER_REWARD_TIERS = [
  {
    id: 'first_wash',
    washesRequired: 1,
    title: 'First finish',
    perk: 'Rookie Rinse badge on your partner profile',
    icon: 'sparkles',
  },
  {
    id: 'bronze',
    washesRequired: 5,
    title: 'Bronze Partner',
    perk: 'Early access to nearby dispatch offers',
    icon: 'award',
  },
  {
    id: 'silver',
    washesRequired: 10,
    title: 'Silver Streak',
    perk: 'Priority queue boost for 7 days after unlock',
    icon: 'zap',
  },
  {
    id: 'gold',
    washesRequired: 25,
    title: 'Gold Standard',
    perk: '₹250 WashGo partner bonus (weekly settlement)',
    icon: 'gift',
  },
  {
    id: 'platinum',
    washesRequired: 50,
    title: 'Platinum Pro',
    perk: 'Featured partner tag in high-demand zones',
    icon: 'star',
  },
  {
    id: 'elite',
    washesRequired: 100,
    title: 'Elite Fleet',
    perk: '₹1,000 milestone bonus + dedicated support line',
    icon: 'crown',
  },
];

export function countCompletedWashes(bookings) {
  return (bookings || []).filter((b) => b.status === 'completed').length;
}

export function countCompletedWashesInWindow(bookings, days = 7) {
  const since = Date.now() - days * 86400000;
  return (bookings || []).filter((b) => {
    if (b.status !== 'completed') return false;
    const t = new Date(b.updated_at || b.scheduled_at).getTime();
    return t >= since;
  }).length;
}

/**
 * @param {number} completedCount
 */
export function getPartnerRewardsState(completedCount) {
  const count = Math.max(0, Number(completedCount) || 0);
  const tiers = PARTNER_REWARD_TIERS.map((tier) => ({
    ...tier,
    unlocked: count >= tier.washesRequired,
    washesAway: Math.max(0, tier.washesRequired - count),
  }));

  const unlocked = tiers.filter((t) => t.unlocked);
  const currentTier = unlocked.length ? unlocked[unlocked.length - 1] : null;
  const nextTier = tiers.find((t) => !t.unlocked) ?? null;

  let progressPct = 100;
  if (nextTier) {
    const prevRequired = currentTier?.washesRequired ?? 0;
    const span = nextTier.washesRequired - prevRequired;
    const done = count - prevRequired;
    progressPct = span > 0 ? Math.min(100, Math.round((done / span) * 100)) : 0;
  }

  return {
    completedCount: count,
    tiers,
    unlockedCount: unlocked.length,
    currentTier,
    nextTier,
    progressPct,
  };
}
