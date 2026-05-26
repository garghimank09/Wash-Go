import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, X } from 'lucide-react';

import { adminService } from '../../../services/adminService';
import { getErrorMessage } from '../../../services/api';
import { photoUrl } from '../../../services/partnerPhotoService';
import { Button } from '../../../ui/button';

const KIND_LABELS = {
  arrival: 'Vehicle condition (arrival)',
  before: 'Before wash',
  after: 'After wash',
};

export function AdminBookingMonitorModal({ bookingId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!bookingId) return undefined;
    let cancelled = false;
    setLoading(true);
    adminService
      .getBooking(bookingId)
      .then((data) => {
        if (!cancelled) setBooking(data);
      })
      .catch((e) => {
        if (!cancelled) toast.error(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (!bookingId) return null;

  const photos = booking?.photos ?? [];
  const washPhotos = photos.filter((p) => p.kind === 'before' || p.kind === 'after');
  const arrival = photos.find((p) => p.kind === 'arrival');

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-booking-monitor-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-wg-border bg-wg-surface-elevated shadow-2xl dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-[1] flex items-center justify-between gap-3 border-b border-wg-border/80 bg-wg-surface-elevated/95 px-5 py-4 backdrop-blur dark:border-white/10">
          <div>
            <h2 id="admin-booking-monitor-title" className="text-lg font-black text-wg-text">
              Service photos
            </h2>
            <p className="text-xs text-wg-muted">Ops verification — arrival, before, and after wash.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-5" aria-hidden />
          </Button>
        </div>

        <div className="space-y-5 p-5">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-wg-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading booking…
            </p>
          ) : null}

          {!loading && booking ? (
            <>
              <p className="font-mono text-xs text-wg-muted">{booking.id}</p>
              {booking.arrival_condition_notes ? (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-100">
                    Condition notes (washer)
                  </p>
                  <p className="mt-1 text-sm text-wg-text">{booking.arrival_condition_notes}</p>
                </div>
              ) : null}
              {arrival ? (
                <div className="overflow-hidden rounded-xl border border-wg-border/80 dark:border-white/10">
                  <p className="border-b border-wg-border/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-wg-muted dark:border-white/10">
                    {KIND_LABELS.arrival}
                  </p>
                  <img src={photoUrl(arrival.url)} alt="" className="aspect-[4/3] w-full object-cover" />
                </div>
              ) : null}
              {washPhotos.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {washPhotos.map((p) => (
                    <div
                      key={p.id}
                      className="overflow-hidden rounded-xl border border-wg-border/80 dark:border-white/10"
                    >
                      <p className="border-b border-wg-border/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-wg-muted dark:border-white/10">
                        {KIND_LABELS[p.kind] || p.kind}
                      </p>
                      <img src={photoUrl(p.url)} alt="" className="aspect-[4/3] w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
              {!arrival && !washPhotos.length ? (
                <p className="text-sm text-wg-muted">No photos uploaded for this booking yet.</p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
