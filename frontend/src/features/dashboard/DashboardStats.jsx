import { m } from 'framer-motion';
import { CalendarDays, CheckCircle2, Clock, Wallet } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { StatCard } from '../../ui/stat-card';
import { formatCents } from '../../utils/format';

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

export function DashboardStatsRow({ stats, loading }) {
  const reduced = useReducedMotion();
  const hoverTap = reduced
    ? {}
    : { whileHover: { y: -4, transition: { duration: 0.22 } }, whileTap: { scale: 0.98 } };

  return (
    <m.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      variants={container(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={item(reduced)} className="h-full" {...hoverTap}>
        <StatCard
          variant="glass"
          icon={CalendarDays}
          label="Total bookings"
          value={stats.total}
          loading={loading}
        />
      </m.div>
      <m.div variants={item(reduced)} className="h-full" {...hoverTap}>
        <StatCard
          variant="glass"
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          loading={loading}
        />
      </m.div>
      <m.div variants={item(reduced)} className="h-full" {...hoverTap}>
        <StatCard
          variant="glass"
          icon={Clock}
          label="Upcoming active"
          value={stats.upcoming}
          loading={loading}
        />
      </m.div>
      <m.div variants={item(reduced)} className="h-full" {...hoverTap}>
        <StatCard
          variant="glass"
          icon={Wallet}
          label="Completed wash value (est.)"
          value={formatCents(stats.revenue)}
          loading={loading}
          animate={false}
        />
      </m.div>
    </m.div>
  );
}
