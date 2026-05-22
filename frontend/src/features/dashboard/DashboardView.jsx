import { useMemo } from 'react';
import { m } from 'framer-motion';

import { DashboardMembershipProfile } from '../membership/DashboardMembershipProfile';
import { useMyMembership } from '../../hooks/useMyMembership';
import { useAuth } from '../../context/AuthContext';
import { useActiveBookingDetail } from '../../hooks/useActiveBookingDetail';
import { useBookings } from '../../hooks/useBookings';
import { useCars } from '../../hooks/useCars';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { DashboardActiveSection } from './DashboardActiveSection';
import { DashboardCustomerStats } from './DashboardCustomerStats';
import { DashboardHero } from './DashboardHero';
import { DashboardNextActions } from './DashboardNextActions';
import { DashboardNextWashStrip } from './DashboardNextWashStrip';
import { DashboardRightRail } from './DashboardRightRail';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardSavedVehicles } from './DashboardSavedVehicles';
import { DashboardUpcomingSchedule } from './DashboardUpcomingSchedule';
import { DashboardVehicleCareTips } from './DashboardVehicleCareTips';

const ACTIVE = ['pending', 'confirmed', 'in_progress'];

const sectionContainer = (reduced) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: reduced ? 0 : 0.05,
      delayChildren: reduced ? 0 : 0.02,
    },
  },
});

const sectionItem = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] },
  },
});

export function DashboardView() {
  const { user } = useAuth();
  const { items, loading, error, reload } = useBookings();
  const { cars, count: carCount, loading: carsLoading, reload: reloadCars } = useCars();
  const { membership, loading: membershipLoading } = useMyMembership();
  const reduced = useReducedMotion();

  const activeBooking = useMemo(() => {
    const list = (items || []).filter((b) => ACTIVE.includes(b.status));
    if (!list.length) return null;
    return [...list].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];
  }, [items]);

  const { detail, loading: detailLoading, error: detailError, refresh } = useActiveBookingDetail(activeBooking?.id ?? null);

  const stats = useMemo(() => {
    const completed = items.filter((b) => b.status === 'completed').length;
    return { completed };
  }, [items]);

  const rewardsPoints = Math.min(5000, stats.completed * 120 + 240);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';
  const showFullSkeleton = loading && items.length === 0;

  const onReloadAll = () => {
    reload();
    reloadCars();
  };

  if (showFullSkeleton) {
    return <DashboardSkeleton />;
  }

  return (
    <m.div
      className="space-y-6 lg:space-y-8"
      variants={sectionContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={sectionItem(reduced)}>
        <DashboardHero firstName={firstName} />
      </m.div>

      <m.div variants={sectionItem(reduced)}>
        <DashboardMembershipProfile membership={membership} loading={membershipLoading} />
      </m.div>

      <m.div variants={sectionItem(reduced)}>
        <DashboardNextWashStrip booking={activeBooking} detail={detail} />
      </m.div>

      <m.div variants={sectionItem(reduced)}>
        <DashboardNextActions
          items={items}
          itemsLoading={loading}
          carCount={carCount}
          carsLoading={carsLoading}
        />
      </m.div>

      <m.div variants={sectionItem(reduced)}>
        <DashboardCustomerStats
          completed={stats.completed}
          vehicleCount={carCount}
          rewardsPoints={rewardsPoints}
          loading={loading || carsLoading}
        />
      </m.div>

      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-3 lg:gap-6">
        <m.div variants={sectionItem(reduced)} className="min-w-0 space-y-4 lg:col-span-2 lg:space-y-5">
          <DashboardActiveSection
            active={activeBooking}
            detail={detail}
            detailLoading={detailLoading}
            detailError={detailError}
            listLoading={loading}
            listError={error}
            onReloadList={onReloadAll}
            onRefreshDetail={refresh}
          />
          <DashboardUpcomingSchedule items={items} />
          <div className="grid min-w-0 items-start gap-4 md:grid-cols-2">
            <DashboardSavedVehicles cars={cars} loading={carsLoading} />
            <DashboardVehicleCareTips />
          </div>
        </m.div>

        <m.div variants={sectionItem(reduced)} className="min-w-0 lg:pt-0">
          <DashboardRightRail items={items} completedCount={stats.completed} carCount={carCount} />
        </m.div>
      </div>
    </m.div>
  );
}
