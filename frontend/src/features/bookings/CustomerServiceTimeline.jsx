import { useMemo } from 'react';

import { buildCustomerMilestoneTimeline, deriveCustomerMilestone } from '../../lib/customerServiceMilestones';
import { useBookingTracking } from '../../hooks/useBookingTracking';
import { ServiceProgressTimeline } from './ServiceProgressTimeline';

/** Operational service progress with transparency sub-steps and live tracking hints. */
export function CustomerServiceTimeline({ booking }) {
  const trackEnabled =
    Boolean(booking?.id && booking?.washer_id) &&
    booking?.status !== 'cancelled' &&
    booking?.status !== 'completed' &&
    ['confirmed', 'in_progress'].includes(booking?.status ?? '');

  const { tracking } = useBookingTracking(booking?.id, { enabled: trackEnabled });

  const milestone = useMemo(
    () => deriveCustomerMilestone(booking, tracking),
    [booking, tracking],
  );
  const timeline = useMemo(() => buildCustomerMilestoneTimeline(milestone), [milestone]);

  return <ServiceProgressTimeline timeline={timeline} heading="Service progress" />;
};
