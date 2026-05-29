import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { m, AnimatePresence } from 'framer-motion';
import { CheckSquare, Phone, User } from 'lucide-react';

import { WasherDashboardOpsBanner } from '../../features/washer/WasherDashboardOpsBanner';
import { WasherJobTimelineAside } from '../../features/washer/WasherJobTimelineAside';
import { WasherJobVisualPanel } from '../../features/washer/WasherJobVisualPanel';
import { useBookingTracking } from '../../hooks/useBookingTracking';
import { useWasherGeolocation } from '../../hooks/useWasherGeolocation';
import { WasherJobSkeleton } from '../../features/washer/WasherJobSkeleton';
import { WasherJobStickyDock } from '../../features/washer/WasherJobStickyDock';
import { WasherCustomerFeedbackCard } from '../../features/washer/WasherCustomerFeedbackCard';
import { WasherJobServiceContext } from '../../features/washer/WasherJobServiceContext';
import { DEMO_JOB } from '../../features/washer/mock/demoJob';
import { partnerBookingsService } from '../../services/partnerBookingsService';
import { getErrorMessage } from '../../services/api';
import { onBookingsSync } from '../../lib/bookingSyncEvents';
import { enrichPartnerJob } from '../../lib/partnerFieldDemo';
import { servicePhaseForWasherPhase } from '../../lib/customerServiceMilestones';
import {
  advanceWasherPhase,
  apiStatusForPhase,
  canWasherAdvancePhase,
  effectiveWasherPhase,
  getNextWasherPhase,
  setStoredPhase,
  washerAdvanceBlockedReason,
} from '../../lib/washerJobPhase';
import { dispatchBookingsSync } from '../../lib/bookingSyncEvents';
import { hasBookingPhoto } from '../../lib/washerPhotoProof';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { Card } from '../../ui/card';
import { formatCents, formatDateTime } from '../../utils/format';

const CHECKLIST_PREFIX = 'washgo:washer:checklist:';

const DEFAULT_CHECKLIST = [
  { id: 'c1', label: 'Before wash photo uploaded', done: false },
  { id: 'c2', label: 'Pre-wash walkaround', done: false },
  { id: 'c3', label: 'Waterless safe on trim', done: false },
  { id: 'c4', label: 'Tire dressing consent', done: false },
  { id: 'c5', label: 'Final QC + keys handoff', done: false },
];

function loadChecklist(jobId) {
  try {
    const raw = sessionStorage.getItem(`${CHECKLIST_PREFIX}${jobId}`);
    if (!raw) return DEFAULT_CHECKLIST.map((c) => ({ ...c }));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_CHECKLIST.map((c) => ({ ...c }));
    return parsed;
  } catch {
    return DEFAULT_CHECKLIST.map((c) => ({ ...c }));
  }
}

function saveChecklist(jobId, rows) {
  try {
    sessionStorage.setItem(`${CHECKLIST_PREFIX}${jobId}`, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export function WasherJobPage() {
  const { id } = useParams();
  const av = useOutletContext();
  const reduced = useReducedMotion();
  const isDemo = id === 'demo';

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState('');
  const [phaseTick, setPhaseTick] = useState(0);
  const [checklist, setChecklist] = useState(() => (id ? loadChecklist(id) : DEFAULT_CHECKLIST.map((c) => ({ ...c }))));
  const [celebrate, setCelebrate] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [photoTick, setPhotoTick] = useState(0);
  const prevPhaseRef = useRef(null);

  const reloadPhase = useCallback(() => setPhaseTick((t) => t + 1), []);

  const load = useCallback(async (silent = false) => {
    if (!id || isDemo) {
      setJob(DEMO_JOB);
      setLoading(false);
      return;
    }
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const data = await partnerBookingsService.get(id);
      setJob(data);
      setError('');
    } catch (e) {
      if (!silent) {
        setError(getErrorMessage(e));
        setJob(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id, isDemo]);

  useEffect(() => {
    const tid = setTimeout(() => void load(false), 0);
    return () => clearTimeout(tid);
  }, [load]);

  useEffect(() => {
    if (!id || isDemo) return undefined;
    return onBookingsSync(() => void load(true));
  }, [id, isDemo, load]);

  useEffect(() => {
    const tid = setTimeout(() => {
      if (id) setChecklist(loadChecklist(id));
    }, 0);
    return () => clearTimeout(tid);
  }, [id]);

  const apiStatus = job?.status ?? 'pending';
  const servicePhase = job?.service_phase ?? null;
  const displayJob = useMemo(() => enrichPartnerJob(job), [job]);
  const hasArrivalPhoto = useMemo(
    () => hasBookingPhoto(job, 'arrival', { isDemo, jobId: id }),
    [job, isDemo, id, photoTick],
  );
  const hasBeforePhoto = useMemo(
    () => hasBookingPhoto(job, 'before', { isDemo, jobId: id }),
    [job, isDemo, id, photoTick],
  );
  const hasAfterPhoto = useMemo(
    () => hasBookingPhoto(job, 'after', { isDemo, jobId: id }),
    [job, isDemo, id, photoTick],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps -- phaseTick/photoTick re-read sessionStorage
  const phase = useMemo(
    () => effectiveWasherPhase(id, apiStatus, servicePhase),
    [id, apiStatus, servicePhase, phaseTick],
  );
  const advanceBlockedReason = washerAdvanceBlockedReason(phase, {
    hasArrivalPhoto,
    hasBeforePhoto,
    hasAfterPhoto,
  });
  const advanceDisabled =
    !canWasherAdvancePhase(phase, { hasArrivalPhoto, hasBeforePhoto, hasAfterPhoto, servicePhase }) ||
    advancing;
  const customerReview = job?.review ?? null;
  const showFeedbackSection = apiStatus === 'completed' || phase === 'completed';

  const trackActive = !isDemo && Boolean(id) && phase !== 'completed';
  const { tracking, error: trackingError } = useBookingTracking(id, {
    enabled: trackActive,
    asPartner: true,
  });
  useWasherGeolocation({
    enabled: !isDemo && Boolean(id) && (phase === 'accepted' || phase === 'on_the_way'),
    bookingId: id,
  });

  useEffect(() => {
    const prev = prevPhaseRef.current;
    if (phase === 'completed' && prev && prev !== 'completed') {
      setCelebrate(true);
      if (!reduced) {
        toast.success('Job completed — payout queued (demo)', { duration: 3500, icon: '✓' });
      }
      const t = setTimeout(() => setCelebrate(false), 5000);
      prevPhaseRef.current = phase;
      return () => clearTimeout(t);
    }
    prevPhaseRef.current = phase;
    return undefined;
  }, [phase, reduced]);

  const toggleCheck = (cid) => {
    const row = checklist.find((c) => c.id === cid);
    if (!row || row.done) return;
    const next = checklist.map((c) => (c.id === cid ? { ...c, done: true } : c));
    setChecklist(next);
    if (id) saveChecklist(id, next);
  };

  const onAdvance = async () => {
    if (!id) return;
    if (isDemo) {
      const next = advanceWasherPhase(id, apiStatus);
      toast.success(`Status · ${next.replace(/_/g, ' ')}`, { duration: 2200 });
      reloadPhase();
      return;
    }
    const current = effectiveWasherPhase(id, apiStatus, job?.service_phase);
    if (
      !canWasherAdvancePhase(current, {
        hasArrivalPhoto,
        hasBeforePhoto,
        hasAfterPhoto,
        servicePhase: job?.service_phase,
      })
    ) {
      toast.error(
        washerAdvanceBlockedReason(current, { hasArrivalPhoto, hasBeforePhoto, hasAfterPhoto }) ||
          'Complete the step above first',
      );
      return;
    }
    const nextPhase = getNextWasherPhase(current);
    setAdvancing(true);
    try {
      const milestonePhase = servicePhaseForWasherPhase(nextPhase);
      if (apiStatus === 'pending') {
        await partnerBookingsService.accept(id);
      } else {
        const targetStatus = apiStatusForPhase(nextPhase);
        if (targetStatus !== apiStatus) {
          await partnerBookingsService.updateStatus(id, targetStatus);
        }
      }
      if (milestonePhase) {
        await partnerBookingsService.updateMilestone(id, milestonePhase);
      }
      setStoredPhase(id, nextPhase);
      await load(true);
      dispatchBookingsSync();
      toast.success(`Status · ${nextPhase.replace(/_/g, ' ')}`, { duration: 2200 });
      reloadPhase();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setAdvancing(false);
    }
  };

  const onArrivalUploaded = useCallback(() => {
    if (id) setStoredPhase(id, 'awaiting_approval');
    reloadPhase();
    void load(true);
  }, [id, load, reloadPhase]);

  if (loading) {
    return <WasherJobSkeleton />;
  }
  if (error || !job) {
    return (
      <div className="pb-8">
        <p className="text-sm text-rose-600">{error || 'Not found'}</p>
        <Link to="/partner" className="mt-4 inline-block text-sm font-bold text-cyan-600 dark:text-cyan-400">
          ← Back
        </Link>
      </div>
    );
  }

  const doneCount = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((doneCount / checklist.length) * 100);
  const phaseLabel = phase.replace(/_/g, ' ');

  return (
    <div className="space-y-5 pb-44 md:pb-36 xl:space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-wg-border/50 pb-4 dark:border-white/10">
        <div className="min-w-0 space-y-2">
          <Link
            to="/partner"
            className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 transition active:opacity-70 dark:text-cyan-300"
          >
            ← Operations
          </Link>
          <m.div
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          >
            <h1 className="text-2xl font-black tracking-tight text-wg-text">{isDemo ? 'Demo job' : 'Active job'}</h1>
            <p className="mt-1 text-sm text-wg-muted">
              {isDemo
                ? 'Full field workflow — premium driver UX.'
                : 'Live booking — status syncs to customer in real time.'}
            </p>
          </m.div>
        </div>
        <AnimatePresence>
          {phase !== 'completed' ? (
            <m.span
              key={phase}
              initial={reduced ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="shrink-0 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-cyan-800 dark:text-cyan-200"
            >
              {phaseLabel}
            </m.span>
          ) : null}
        </AnimatePresence>
      </header>

      <WasherDashboardOpsBanner online={Boolean(av?.online)} />

      <div className="grid items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:gap-10">
        <div className="order-2 min-w-0 space-y-5 xl:order-1">
          <WasherJobVisualPanel
            displayJob={displayJob}
            phase={phase}
            jobStatus={apiStatus}
            tracking={tracking}
            trackActive={trackActive}
            trackingError={trackingError}
            jobId={id}
            isDemo={isDemo}
            servicePhase={servicePhase}
            initialArrivalNotes={job?.arrival_condition_notes ?? ''}
            onArrivalUploaded={onArrivalUploaded}
            onPhotosChanged={() => {
              setPhotoTick((t) => t + 1);
              void load(true);
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Card variant="glass" className="border-white/15 !p-4 sm:!p-5 dark:border-white/10">
              <h2 className="text-sm font-black text-wg-text">Customer</h2>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/25 to-indigo-500/20 ring-1 ring-white/15">
                  <User className="size-6 text-cyan-800 dark:text-cyan-100" strokeWidth={1.5} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-wg-text">{displayJob.customerName ?? 'Customer'}</p>
                  {displayJob.customerPhone ? (
                    <a
                      href={`tel:${String(displayJob.customerPhone).replace(/\D/g, '')}`}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-bold text-cyan-700 dark:text-cyan-300"
                    >
                      <Phone className="size-3.5" strokeWidth={1.75} aria-hidden />
                      {displayJob.customerPhone}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-xs text-wg-muted">Phone via dispatch</p>
                  )}
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2 border-b border-wg-border/50 pb-2 dark:border-white/5">
                  <dt className="text-wg-muted">Vehicle</dt>
                  <dd className="font-semibold text-wg-text">{displayJob.vehicle ?? displayJob.car_label ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-wg-border/50 pb-2 dark:border-white/5">
                  <dt className="text-wg-muted">Package</dt>
                  <dd className="font-semibold text-wg-text">{displayJob.packageLabel ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-wg-border/50 pb-2 dark:border-white/5">
                  <dt className="text-wg-muted">Scheduled</dt>
                  <dd className="text-right font-semibold text-wg-text">{formatDateTime(displayJob.scheduled_at)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-wg-muted">Payout</dt>
                  <dd className="font-black tabular-nums text-wg-text">
                    {formatCents(displayJob.price_cents, displayJob.currency)}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card variant="glass" className="border-cyan-500/15 !p-4 shadow-wg-card sm:!p-5 dark:border-white/10">
              <h2 className="text-sm font-black text-wg-text">Field briefing</h2>
              <p className="mt-0.5 text-[11px] text-wg-muted">Dispatch intel before wheels roll</p>
              <div className="mt-3">
                <WasherJobServiceContext field={displayJob.partnerFieldUx} notes={displayJob.notes} />
              </div>
            </Card>
          </div>

          {showFeedbackSection && !isDemo ? (
            <WasherCustomerFeedbackCard
              review={customerReview}
              customerName={displayJob.customerName}
              bookingId={id}
            />
          ) : null}

          <Card variant="glass" className="border-white/15 !p-4 sm:!p-5 dark:border-white/10">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-black text-wg-text">Service checklist</h2>
              <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-black tabular-nums text-cyan-800 dark:text-cyan-200">
                {progressPct}%
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-wg-border/80 dark:bg-white/10">
              <m.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500"
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              />
            </div>
            <ul className="mt-3 space-y-2">
              {checklist.map((c, idx) => (
                <li key={c.id}>
                  <m.button
                    type="button"
                    onClick={() => toggleCheck(c.id)}
                    disabled={c.done}
                    initial={reduced ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduced ? 0 : idx * 0.03 }}
                    whileTap={c.done || reduced ? undefined : { scale: 0.99 }}
                    className={cn(
                      'flex min-h-[44px] w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                      c.done
                        ? 'cursor-default border-emerald-500/30 bg-emerald-500/10 text-wg-muted line-through dark:border-emerald-500/20'
                        : 'border-wg-border bg-wg-surface-elevated hover:border-cyan-500/40 dark:border-white/15 dark:bg-white/[0.06]',
                    )}
                  >
                    <CheckSquare
                      className={cn('size-4 shrink-0', c.done ? 'text-emerald-600' : 'text-wg-muted')}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className={c.done ? 'text-wg-muted' : 'text-wg-text'}>{c.label}</span>
                  </m.button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="order-1 xl:sticky xl:top-20 xl:order-2 xl:self-start">
          <WasherJobTimelineAside phase={phase} hasArrivalPhoto={hasArrivalPhoto} />
        </aside>
      </div>

      <WasherJobStickyDock
        phase={phase}
        reduced={reduced}
        onAdvance={onAdvance}
        showSwipeComplete
        showCelebrationBanner={celebrate}
        advanceDisabled={advanceDisabled}
        advanceHint={advanceBlockedReason}
      />
    </div>
  );
}
