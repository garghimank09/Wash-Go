import { m } from 'framer-motion';
import { Car, Droplets, Sparkles } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { StatCard } from '../../ui/stat-card';

const container = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: reduced ? 0 : 0.08, delayChildren: reduced ? 0 : 0.04 },
  },
});

const item = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] },
  },
});

/** Customer-focused KPIs — no revenue or business analytics. */
export function DashboardCustomerStats({ completed, vehicleCount, rewardsPoints, loading }) {
  const reduced = useReducedMotion();
  const hoverTap = reduced
    ? {}
    : { whileHover: { y: -3, transition: { duration: 0.22 } }, whileTap: { scale: 0.98 } };

  return (
    <m.div
      className="grid gap-4 sm:grid-cols-3"
      variants={container(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={item(reduced)} className="h-full" {...hoverTap}>
        <StatCard variant="glass" icon={Droplets} label="Washes completed" value={completed} loading={loading} />
      </m.div>
      <m.div variants={item(reduced)} className="h-full" {...hoverTap}>
        <StatCard variant="glass" icon={Car} label="Vehicles saved" value={vehicleCount} loading={loading} />
      </m.div>
      <m.div variants={item(reduced)} className="h-full" {...hoverTap}>
        <StatCard
          variant="glass"
          icon={Sparkles}
          label="Rewards points"
          value={rewardsPoints}
          loading={loading}
          animate={false}
        />
      </m.div>
    </m.div>
  );
}
