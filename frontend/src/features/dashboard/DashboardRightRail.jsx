import { m } from 'framer-motion';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { DashboardLoyaltyRewards, DashboardRecommendedWash } from './DashboardLoyaltyRecommendations';
import { DashboardRecentActivity } from './DashboardRecentActivity';
import { DashboardSmartPicks } from './DashboardSmartPicks';
import { DashboardWashHistory } from './DashboardWashHistory';

export function DashboardRightRail({ items, completedCount, carCount }) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className="flex min-w-0 flex-col gap-6"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={reduced ? false : { opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 0.08, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <DashboardLoyaltyRewards completedCount={completedCount} />
      <DashboardRecommendedWash completedCount={completedCount} />
      <DashboardSmartPicks items={items} completedCount={completedCount} carCount={carCount} />
      <DashboardRecentActivity items={items} />
      <DashboardWashHistory items={items} />
    </m.div>
  );
}
