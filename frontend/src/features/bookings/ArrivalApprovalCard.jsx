import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, MapPin } from 'lucide-react';

import { dispatchBookingsSync } from '../../lib/bookingSyncEvents';
import { dispatchNotificationsSync } from '../../lib/notificationSyncEvents';
import { bookingsService } from '../../services/bookingsService';
import { getErrorMessage } from '../../services/api';
import { photoUrl } from '../../services/partnerPhotoService';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

/**
 * Customer confirms washer arrival photo before the wash can start.
 */
export function ArrivalApprovalCard({ booking, onApproved }) {
  const [submitting, setSubmitting] = useState(false);
  const arrival = booking?.photos?.find((p) => p.kind === 'arrival');
  const phase = booking?.service_phase;
  const pending = phase === 'awaiting_arrival_approval' && Boolean(arrival);
  const approved = phase === 'arrival_approved' || phase === 'wash_in_progress' || phase === 'completed';

  if (!arrival && !pending && !approved) return null;

  const handleApprove = async () => {
    if (!booking?.id) return;
    setSubmitting(true);
    try {
      await bookingsService.approveArrival(booking.id);
      toast.success('Arrival approved — your washer can start the wash');
      dispatchBookingsSync();
      dispatchNotificationsSync({ source: 'booking' });
      onApproved?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      variant="glass"
      className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-wg-surface-elevated/95 to-cyan-500/8 dark:border-amber-500/20"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-100">
          <MapPin className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-wg-text">Arrival check-in</h2>
          <p className="mt-1 text-sm text-wg-muted">
            {pending
              ? 'Your washer is on site. Review the photo below — if it looks correct, tap OK so they can start.'
              : approved
                ? 'You approved this arrival photo. The washer can run the service.'
                : 'Arrival photo will appear here when your washer checks in.'}
          </p>
        </div>
      </div>

      {arrival ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-wg-border/80 dark:border-white/10">
          <img
            src={photoUrl(arrival.url)}
            alt="Washer arrival check-in at your vehicle"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ) : null}

      {pending ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" loading={submitting} onClick={() => void handleApprove()}>
            OK — approve & start wash
          </Button>
        </div>
      ) : null}

      {approved && arrival ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          Arrival approved
        </p>
      ) : null}
    </Card>
  );
}
