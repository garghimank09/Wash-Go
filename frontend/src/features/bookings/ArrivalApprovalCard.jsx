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
 * Customer reviews vehicle condition (photo + notes) before the wash can start.
 */
export function ArrivalApprovalCard({ booking, onApproved, embedded = false }) {
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
      toast.success('Vehicle condition approved — your washer can start the wash');
      dispatchBookingsSync();
      dispatchNotificationsSync({ source: 'booking' });
      onApproved?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const body = (
    <>
      <div className={embedded ? 'flex items-start gap-3 px-5 pt-5' : 'flex items-start gap-3'}>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-100">
          <MapPin className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-wg-text">Vehicle condition</h2>
          <p className="mt-1 text-sm text-wg-muted">
            {pending
              ? 'Your washer documented the vehicle’s current condition. Review the photo and notes — approve so they can accept the car and wash.'
              : approved
                ? 'You approved the documented condition. The washer can proceed with the service.'
                : 'Condition photo and notes will appear here when your washer checks in.'}
          </p>
        </div>
      </div>

      {arrival ? (
        <div
          className={
            embedded
              ? 'mx-5 mb-0 mt-4 overflow-hidden rounded-2xl border border-wg-border/80 dark:border-white/10'
              : 'mt-4 overflow-hidden rounded-2xl border border-wg-border/80 dark:border-white/10'
          }
        >
          <img
            src={photoUrl(arrival.url)}
            alt="Vehicle condition at service start"
            className="aspect-[16/10] w-full object-cover sm:aspect-[2/1]"
          />
        </div>
      ) : null}

      {booking?.arrival_condition_notes ? (
        <div
          className={
            embedded
              ? 'mx-5 mt-3 rounded-xl border border-wg-border/80 bg-wg-surface-elevated/60 px-4 py-3 dark:border-white/10'
              : 'mt-3 rounded-xl border border-wg-border/80 bg-wg-surface-elevated/60 px-4 py-3 dark:border-white/10'
          }
        >
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Washer notes</p>
          <p className="mt-1 text-sm text-wg-text">{booking.arrival_condition_notes}</p>
        </div>
      ) : null}

      {pending ? (
        <div className={embedded ? 'mx-5 mt-4 flex flex-wrap gap-2 pb-5' : 'mt-4 flex flex-wrap gap-2'}>
          <Button type="button" size="sm" loading={submitting} onClick={() => void handleApprove()}>
            Approve vehicle condition
          </Button>
        </div>
      ) : null}

      {approved && arrival ? (
        <p
          className={
            embedded
              ? 'mx-5 mb-5 mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300'
              : 'mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300'
          }
        >
          <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          Vehicle condition approved
        </p>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <div className="border-b border-wg-border/60 bg-gradient-to-br from-amber-500/[0.06] via-transparent to-cyan-500/[0.04] dark:border-white/10">
        {body}
      </div>
    );
  }

  return (
    <Card
      variant="glass"
      className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-wg-surface-elevated/95 to-cyan-500/8 dark:border-amber-500/20"
    >
      {body}
    </Card>
  );
}
