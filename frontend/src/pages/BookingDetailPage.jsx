import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { m } from 'framer-motion';
import { CalendarClock, Headphones, LifeBuoy, ShieldAlert } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';

import { BookingCancelModal } from '../features/bookings/BookingCancelModal';
import { BookingRescheduleModal } from '../features/bookings/BookingRescheduleModal';
import { CustomerBookingStatusPill } from '../features/bookings/CustomerBookingStatusPill';
import { CustomerServiceTimeline } from '../features/bookings/CustomerServiceTimeline';
import { formatCustomerWashTiming } from '../features/dashboard/dashboardEta';
import {
  canCustomerCancelFromApi,
  canCustomerRescheduleFromApi,
  deriveCustomerPhase,
  requiresAssistedCancellation,
} from '../lib/customerBookingPhase';
import { useReducedMotion } from '../lib/useReducedMotion';
import { onBookingsSync } from '../lib/bookingSyncEvents';
import { LiveTrackingMap } from '../components/LiveTrackingMap';
import { useBookingTracking } from '../hooks/useBookingTracking';
import { bookingsService } from '../services/bookingsService';
import { getErrorMessage } from '../services/api';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { photoUrl } from '../services/partnerPhotoService';
import { formatCents, formatDateTime } from '../utils/format';

function BookingDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton width={120} height={20} />
      <div className="flex justify-between gap-4">
        <Skeleton width={220} height={40} />
        <Skeleton width={120} height={36} />
      </div>
      <Card variant="glass">
        <Skeleton height={24} width="40%" />
        <Skeleton className="mt-4" height={80} />
      </Card>
      <Card variant="glass">
        <Skeleton count={4} height={20} className="my-2" />
      </Card>
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
    return onBookingsSync(() => void load(true));
  }, [id, load]);

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

  const phase = deriveCustomerPhase(b);
  const timing = formatCustomerWashTiming(b, { eta_minutes: b.eta_minutes });
  const canCancel = canCustomerCancelFromApi(b.status);
  const canReschedule = canCustomerRescheduleFromApi(b.status);
  const assisted = requiresAssistedCancellation(phase);
  const terminal = b.status === 'cancelled' || b.status === 'completed';

  return (
    <div className="space-y-6">
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/bookings" className="text-sm font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
          ← All bookings
        </Link>
        <CustomerBookingStatusPill booking={b} />
      </div>

      <m.div
        className="flex flex-wrap items-end justify-between gap-4"
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="wg-heading-display">Booking</h1>
        <p className="text-2xl font-black tabular-nums text-wg-text">{formatCents(b.price_cents, b.currency)}</p>
      </m.div>

      {!terminal && assisted ? (
        <Card
          variant="glass"
          className="border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-wg-surface-elevated/95 to-cyan-500/8 dark:border-indigo-500/15"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-200">
              <ShieldAlert className="size-6" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-black text-wg-text">
                {phase === 'in_progress' ? 'Wash in progress' : 'Washer has already accepted this booking'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-wg-muted">
                {phase === 'in_progress'
                  ? 'We cannot cancel this visit from the app while the crew is on site. For safety and payouts, please contact support or speak with your washer directly — same policy as Uber, Lyft, and Urban Company once service starts.'
                  : 'Your washer has already accepted this booking. Please contact support or the assigned washer for cancellation assistance.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
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
                    Washer: {b.washer.full_name}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {trackEnabled && tracking ? (
        <Card variant="glass" className="overflow-hidden border-cyan-500/25 p-0 shadow-wg-card">
          <div className="flex items-center justify-between gap-2 border-b border-wg-border/60 px-4 py-3 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Live tracking</p>
            <span className="text-xs font-semibold tabular-nums text-cyan-700 dark:text-cyan-300">
              {tracking.eta_minutes != null ? `${tracking.eta_minutes} min ETA` : 'En route'}
            </span>
          </div>
          <div className="h-52 sm:h-60">
            <LiveTrackingMap tracking={tracking} perspective="customer" />
          </div>
        </Card>
      ) : null}

      {b.status !== 'cancelled' && b.status !== 'completed' ? (
        <Card variant="glass" className="border-cyan-500/20 shadow-wg-card">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-wg-muted">
            <CalendarClock className="size-4 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
            Arrival & timing
          </div>
          <p className="mt-2 text-xl font-black leading-snug text-wg-text">{timing.headline}</p>
          <p className="mt-1 text-sm text-wg-muted">{timing.sub}</p>
        </Card>
      ) : null}

      <Card variant="glass">
        {b.washer ? (
          <div>
            <p className="text-xl font-semibold text-wg-text">{b.washer.full_name}</p>
            <p className="text-sm text-wg-muted">
              Rating {Number(b.washer.rating_avg).toFixed(1)}
              {b.washer.service_area ? ` · ${b.washer.service_area}` : ''}
            </p>
          </div>
        ) : (
          <p className="text-sm text-wg-muted">Washer assignment pending — your job stays in the matching queue.</p>
        )}
      </Card>

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

      {b.photos?.length ? (
        <Card variant="glass" className="border-emerald-500/20">
          <h2 className="wg-heading-section">Wash photo proof</h2>
          <p className="mt-1 text-sm text-wg-muted">Before and after photos from your washer.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {b.photos.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-wg-border/80 dark:border-white/10">
                <p className="border-b border-wg-border/60 bg-wg-surface-elevated/80 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-wg-muted dark:border-white/10">
                  {p.kind === 'before' ? 'Before wash' : 'After wash'}
                </p>
                <img
                  src={photoUrl(p.url)}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card variant="inset">
        <h2 className="wg-heading-section">Summary</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-wg-muted">Vehicle</dt>
            <dd className="font-medium text-wg-text">{b.car_label || '—'}</dd>
          </div>
          <div>
            <dt className="text-wg-muted">Scheduled</dt>
            <dd className="font-medium text-wg-text">{formatDateTime(b.scheduled_at)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-wg-muted">Address</dt>
            <dd className="font-medium text-wg-text">{b.service_address}</dd>
          </div>
        </dl>
      </Card>

      <CustomerServiceTimeline booking={b} />
    </div>
  );
}
