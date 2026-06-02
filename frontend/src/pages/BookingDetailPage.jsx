import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { m } from 'framer-motion';
import { CalendarClock, Download, Headphones, LifeBuoy, ShieldAlert, Star } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';

import { BookingCancelModal } from '../features/bookings/BookingCancelModal';
import { BookingRescheduleModal } from '../features/bookings/BookingRescheduleModal';
import { BookingReviewForm, BookingReviewSubmitted } from '../features/bookings/BookingReviewForm';
import { CustomerBookingStatusPill } from '../features/bookings/CustomerBookingStatusPill';
import { BookingDetailVisualPanel } from '../features/bookings/BookingDetailVisualPanel';
import { CustomerServiceTimeline } from '../features/bookings/CustomerServiceTimeline';
import { formatCustomerWashTiming } from '../features/dashboard/dashboardEta';
import {
  canCustomerCancelFromApi,
  canCustomerRescheduleFromApi,
  requiresAssistedCancellation,
} from '../lib/customerBookingPhase';
import { currentMilestoneStatusPhrase, deriveCustomerMilestone } from '../lib/customerServiceMilestones';
import { useReducedMotion } from '../lib/useReducedMotion';
import { onBookingsSync } from '../lib/bookingSyncEvents';
import { dispatchNotificationsSync } from '../lib/notificationSyncEvents';
import { useBookingTracking } from '../hooks/useBookingTracking';
import { bookingsService } from '../services/bookingsService';
import { getErrorMessage } from '../services/api';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { formatCents, formatDateTime } from '../utils/format';

function BookingDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton width={120} height={20} />
      <div className="flex justify-between gap-4">
        <Skeleton width={220} height={40} />
        <Skeleton width={120} height={36} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <div className="space-y-4">
          <Skeleton height={280} borderRadius={16} />
          <Skeleton height={120} borderRadius={16} />
        </div>
        <Skeleton height={420} borderRadius={16} />
      </div>
    </div>
  );
}

export function BookingDetailPage() {
  const { id } = useParams();
  const reduced = useReducedMotion();
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) {
      setError('');
      setLoading(true);
    }
    try {
      const data = await bookingsService.get(id);
      setB(data);
      setError('');
    } catch (e) {
      if (!silent) {
        setError(getErrorMessage(e));
        setB(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const tid = setTimeout(() => {
      if (!cancelled) void load(false);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(tid);
    };
  }, [load]);

  useEffect(() => {
    if (!id) return undefined;
    return onBookingsSync(() => {
      void load(true);
      dispatchNotificationsSync({ source: 'booking' });
    });
  }, [id, load]);

  useEffect(() => {
    if (!id || !b) return undefined;
    if (b.status === 'completed' || b.status === 'cancelled') return undefined;
    const t = window.setInterval(() => void load(true), 12_000);
    return () => window.clearInterval(t);
  }, [id, b?.status, load]);

  const trackEnabled =
    Boolean(id && b?.washer_id) &&
    b?.status !== 'cancelled' &&
    b?.status !== 'completed' &&
    ['confirmed', 'in_progress'].includes(b?.status ?? '');
  const { tracking } = useBookingTracking(id, { enabled: trackEnabled });

  const handleCancel = async (payload) => {
    if (!id) return;
    setSubmittingCancel(true);
    try {
      await bookingsService.cancel(id, payload);
      toast.success('Booking cancelled. Slot released.');
      setCancelOpen(false);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleReschedule = async (iso) => {
    if (!id) return;
    setSubmittingReschedule(true);
    try {
      await bookingsService.reschedule(id, { scheduled_at: iso });
      toast.success('New time saved — your wash is rescheduled.');
      setRescheduleOpen(false);
      setCancelOpen(false);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!id) return;
    setDownloadingReceipt(true);
    try {
      const response = await bookingsService.downloadReceipt(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const disposition = response.headers?.['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/i);
      link.href = url;
      link.download = match?.[1] || `washgo-receipt-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDownloadingReceipt(false);
    }
  };

  if (loading) return <BookingDetailSkeleton />;
  if (error || !b) {
    return (
      <div>
        <p className="text-rose-600 dark:text-rose-400">{error || 'Not found'}</p>
        <Link to="/bookings" className="mt-4 inline-block text-cyan-600 hover:underline dark:text-cyan-400">
          ← Back to bookings
        </Link>
      </div>
    );
  }

  const milestone = deriveCustomerMilestone(b, tracking);
  const liveStatus = currentMilestoneStatusPhrase(milestone);
  const washUnderway =
    milestone === 'wash_in_progress' || b.status === 'in_progress';
  const timing = formatCustomerWashTiming(b, { eta_minutes: b.eta_minutes });
  const canCancel = canCustomerCancelFromApi(b.status);
  const canReschedule = canCustomerRescheduleFromApi(b.status);
  const assisted = requiresAssistedCancellation(milestone);
  const terminal = b.status === 'cancelled' || b.status === 'completed';

  return (
    <div className="space-y-5 pb-8 lg:space-y-6">
      <BookingCancelModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        submitting={submittingCancel}
        onReschedule={() => {
          setCancelOpen(false);
          setRescheduleOpen(true);
        }}
      />
      <BookingRescheduleModal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        currentScheduledAt={b.scheduled_at}
        onConfirm={handleReschedule}
        submitting={submittingReschedule}
      />

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-wg-border/50 pb-4 dark:border-white/10">
        <div className="min-w-0 space-y-2">
          <Link
            to="/bookings"
            className="inline-block text-sm font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
          >
            ← All bookings
          </Link>
          <m.div
            className="flex flex-wrap items-end gap-x-4 gap-y-1"
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <h1 className="wg-heading-display">Booking</h1>
            <p className="text-2xl font-black tabular-nums text-wg-text">{formatCents(b.price_cents, b.currency)}</p>
          </m.div>
        </div>
        <CustomerBookingStatusPill booking={b} />
      </header>

      {!terminal && liveStatus ? (
        <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 via-wg-surface-elevated/90 to-indigo-500/6 px-4 py-3.5 dark:border-cyan-500/15 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Right now</p>
          <p className="mt-0.5 text-base font-black leading-snug text-wg-text sm:text-lg">{liveStatus}</p>
          {timing.headline ? <p className="mt-0.5 text-sm text-wg-muted">{timing.headline}</p> : null}
        </div>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(272px,320px)] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-10">
        <div className="min-w-0 space-y-5">
          {!terminal && assisted ? (
            <Card
              variant="glass"
              className="border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-wg-surface-elevated/95 to-cyan-500/8 dark:border-indigo-500/15"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-200">
                  <ShieldAlert className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-wg-text">
                    {washUnderway ? 'Wash in progress' : 'Washer has already accepted this booking'}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-wg-muted">
                    {washUnderway
                      ? 'We cannot cancel this visit from the app while the crew is on site. Contact support or your washer directly.'
                      : 'Your washer has accepted. Contact support or the assigned washer for cancellation help.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href="mailto:support@washgo.app?subject=WashGo%20booking%20change%20request"
                      className="inline-flex"
                    >
                      <Button type="button" size="sm" variant="outline" className="gap-2">
                        <LifeBuoy className="size-4" strokeWidth={1.75} aria-hidden />
                        Contact support
                      </Button>
                    </a>
                    {b.washer ? (
                      <span className="inline-flex items-center gap-2 rounded-xl border border-wg-border/80 px-3 py-2 text-xs font-semibold text-wg-muted dark:border-white/10">
                        <Headphones className="size-4 shrink-0 text-wg-text" strokeWidth={1.75} aria-hidden />
                        {b.washer.full_name}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          <BookingDetailVisualPanel
            booking={b}
            tracking={tracking}
            trackEnabled={trackEnabled}
            terminal={terminal}
            onApproved={() => void load(true)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {b.status !== 'cancelled' && b.status !== 'completed' ? (
              <Card variant="glass" className="border-cyan-500/15 shadow-wg-card sm:col-span-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-wg-muted">
                  <CalendarClock className="size-4 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
                  Schedule
                </div>
                <p className="mt-2 text-lg font-black leading-snug text-wg-text">{timing.headline}</p>
                <p className="mt-1 text-sm text-wg-muted">{timing.sub}</p>
              </Card>
            ) : null}

            <Card variant="glass" className={b.status === 'cancelled' || b.status === 'completed' ? 'sm:col-span-2' : ''}>
              {b.washer ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Your washer</p>
                  <p className="mt-2 text-lg font-black text-wg-text">{b.washer.full_name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-wg-muted">
                    <Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden />
                    {Number(b.washer.rating_avg).toFixed(1)}
                    {b.washer.service_area ? ` · ${b.washer.service_area}` : ''}
                  </p>
                </>
              ) : (
                <p className="text-sm text-wg-muted">Washer assignment pending — your job stays in the matching queue.</p>
              )}
            </Card>
          </div>

          {b.status === 'completed' && b.washer ? (
            b.review ? (
              <BookingReviewSubmitted review={b.review} washerName={b.washer.full_name} />
            ) : (
              <BookingReviewForm
                bookingId={b.id}
                washerName={b.washer.full_name}
                onSubmitted={async () => {
                  await load(true);
                }}
              />
            )
          ) : null}

          {!terminal && (canCancel || canReschedule) ? (
            <Card variant="glass" className="border-white/20 shadow-wg-card dark:border-white/10">
              <h2 className="wg-heading-section">Manage visit</h2>
              <p className="mt-1 text-sm text-wg-muted">
                While we are still confirming your washer, you can move the time or cancel without fees.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {canReschedule ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setRescheduleOpen(true)}>
                    Reschedule booking
                  </Button>
                ) : null}
                {canCancel ? (
                  <Button type="button" variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                    Cancel booking
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : null}

          <Card variant="inset">
            <h2 className="wg-heading-section">Summary</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-wg-muted">Vehicle</dt>
                <dd className="mt-0.5 font-medium text-wg-text">{b.car_label || '—'}</dd>
              </div>
              <div>
                <dt className="text-wg-muted">Scheduled</dt>
                <dd className="mt-0.5 font-medium text-wg-text">{formatDateTime(b.scheduled_at)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-wg-muted">Address</dt>
                <dd className="mt-0.5 font-medium leading-relaxed text-wg-text">{b.service_address}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Button type="button" size="sm" variant="outline" onClick={() => void handleDownloadReceipt()} loading={downloadingReceipt}>
                <Download className="size-4" strokeWidth={1.8} aria-hidden />
                Download receipt
              </Button>
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <CustomerServiceTimeline booking={b} compact className="shadow-wg-card ring-1 ring-wg-border/40 dark:ring-white/10" />
        </aside>
      </div>
    </div>
  );
}

