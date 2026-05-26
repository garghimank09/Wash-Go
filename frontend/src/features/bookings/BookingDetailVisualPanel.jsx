import { MapPin } from 'lucide-react';

import { LiveTrackingMap } from '../../components/LiveTrackingMap';
import { photoUrl } from '../../services/partnerPhotoService';
import { ArrivalApprovalCard } from './ArrivalApprovalCard';
import { Card } from '../../ui/card';

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 border-b border-wg-border/60 px-5 py-4 dark:border-white/10">
      <div>
        <h2 className="text-sm font-black tracking-tight text-wg-text">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-wg-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/**
 * Map, vehicle condition, and before/after proof — single premium panel for booking detail.
 */
export function BookingDetailVisualPanel({
  booking,
  tracking,
  trackEnabled,
  terminal,
  onApproved,
}) {
  const arrival = booking?.photos?.find((p) => p.kind === 'arrival');
  const before = booking?.photos?.find((p) => p.kind === 'before');
  const after = booking?.photos?.find((p) => p.kind === 'after');
  const showWash = before || after || booking?.status === 'in_progress' || booking?.status === 'completed';
  const showArrival =
    !terminal &&
    (arrival ||
      booking?.service_phase === 'awaiting_arrival_approval' ||
      booking?.service_phase === 'arrival_approved' ||
      booking?.service_phase === 'wash_in_progress');

  const hasMap = trackEnabled && tracking;
  const hasAny = hasMap || showArrival || showWash;

  if (!hasAny) return null;

  return (
    <Card variant="glass" className="overflow-hidden border-white/20 p-0 shadow-wg-card dark:border-white/10">
      {hasMap ? (
        <section className="border-b border-wg-border/60 dark:border-white/10">
          <SectionHeader
            title="Live tracking"
            subtitle={
              tracking.eta_minutes != null
                ? `${tracking.eta_minutes} min ETA · washer en route`
                : 'Washer en route to your location'
            }
          />
          <div className="h-56 sm:h-64 lg:h-72">
            <LiveTrackingMap tracking={tracking} perspective="customer" />
          </div>
        </section>
      ) : null}

      {showArrival ? (
        <section className={hasMap ? 'border-b border-wg-border/60 dark:border-white/10' : ''}>
          {!terminal ? (
            <ArrivalApprovalCard booking={booking} onApproved={onApproved} embedded />
          ) : arrival ? (
            <>
              <SectionHeader title="Vehicle condition" subtitle="Documented at service start" />
              <div className="space-y-3 p-5 pt-0">
                <div className="overflow-hidden rounded-2xl border border-wg-border/80 dark:border-white/10">
                  <img
                    src={photoUrl(arrival.url)}
                    alt=""
                    className="aspect-[16/10] w-full object-cover sm:aspect-[2/1]"
                  />
                </div>
                {booking.arrival_condition_notes ? (
                  <p className="rounded-xl bg-wg-surface-elevated/60 px-4 py-3 text-sm text-wg-text dark:bg-white/[0.04]">
                    {booking.arrival_condition_notes}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {showWash ? (
        <section>
          <SectionHeader
            title="Wash results"
            subtitle="Before and after — compare the service"
          />
          <div className="grid gap-px bg-wg-border/60 sm:grid-cols-2 dark:bg-white/10">
            {['before', 'after'].map((kind) => {
              const p = booking.photos?.find((ph) => ph.kind === kind);
              return (
                <div key={kind} className="bg-wg-surface-elevated/95 dark:bg-wg-surface">
                  <p className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-wg-muted">
                    {kind === 'before' ? 'Before wash' : 'After wash'}
                  </p>
                  {p ? (
                    <img
                      src={photoUrl(p.url)}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-wg-surface-elevated/40 px-4 text-center dark:bg-white/[0.02]">
                      <MapPin className="size-5 text-wg-muted/50" aria-hidden />
                      <p className="text-xs text-wg-muted">
                        {kind === 'before' ? 'Before photo pending' : 'After photo pending'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </Card>
  );
}
