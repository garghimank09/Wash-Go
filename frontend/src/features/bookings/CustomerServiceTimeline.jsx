import { BookingTimeline } from './BookingTimeline';
import { buildCustomerServiceTimeline } from './buildCustomerServiceTimeline';
import { deriveCustomerPhase } from '../../lib/customerBookingPhase';

/** Operational “service progress” timeline derived from booking state (demo-ready). */
export function CustomerServiceTimeline({ booking }) {
  const phase = deriveCustomerPhase(booking);
  const timeline = buildCustomerServiceTimeline(phase);
  return <BookingTimeline timeline={timeline} heading="Service progress" />;
}
