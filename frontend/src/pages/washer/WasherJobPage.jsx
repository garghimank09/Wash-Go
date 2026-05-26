import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { m, AnimatePresence } from 'framer-motion';
import { CheckSquare, PartyPopper, Phone, User } from 'lucide-react';

import { WasherDashboardOpsBanner } from '../../features/washer/WasherDashboardOpsBanner';
import { WasherEtaRouteCard } from '../../features/washer/WasherEtaRouteCard';
import { useBookingTracking } from '../../hooks/useBookingTracking';
import { useWasherGeolocation } from '../../hooks/useWasherGeolocation';
import { WasherJobProgress } from '../../features/washer/WasherJobProgress';
import { WasherJobSkeleton } from '../../features/washer/WasherJobSkeleton';
import { WasherJobStickyDock } from '../../features/washer/WasherJobStickyDock';
import { WasherPhotoProofSection } from '../../features/washer/WasherPhotoProofSection';
import { WasherJobServiceContext } from '../../features/washer/WasherJobServiceContext';
import { DEMO_JOB } from '../../features/washer/mock/demoJob';
import { partnerBookingsService } from '../../services/partnerBookingsService';
import { getErrorMessage } from '../../services/api';
import { onBookingsSync } from '../../lib/bookingSyncEvents';
import { enrichPartnerJob } from '../../lib/partnerFieldDemo';
import {
  advanceWasherPhase,
  apiStatusForPhase,
  effectiveWasherPhase,
  getNextWasherPhase,
  setStoredPhase,
} from '../../lib/washerJobPhase';
import { dispatchBookingsSync } from '../../lib/bookingSyncEvents';
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
  const displayJob = useMemo(() => enrichPartnerJob(job), [job]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- phaseTick forces re-read of sessionStorage after advanceWasherPhase
  const phase = useMemo(() => effectiveWasherPhase(id, apiStatus), [id, apiStatus, phaseTick]);

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
    const next = checklist.map((c) => (c.id === cid ? { ...c, done: !c.done } : c));
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
    const current = effectiveWasherPhase(id, apiStatus);
    const nextPhase = getNextWasherPhase(current);
    setAdvancing(true);
    try {
      if (apiStatus === 'pending') {
        await partnerBookingsService.accept(id);
      } else if (nextPhase === 'awaiting_approval') {
        await partnerBookingsService.requestHandoff(id);
      } else {
        const targetStatus = apiStatusForPhase(nextPhase);
        if (targetStatus !== apiStatus) {
          await partnerBookingsService.updateStatus(id, targetStatus);
        }
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

  return (
    <div className="space-y-5 pb-10">
      <Link to="/partner" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 transition active:opacity-70 dark:text-cyan-300">
        ← Operations
      </Link>

      <WasherDashboardOpsBanner online={Boolean(av?.online)} />

      <m.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        className="flex items-start justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-wg-text">{isDemo ? 'Demo job' : 'Active job'}</h1>
          <p className="mt-1 text-sm text-wg-muted">
            {isDemo ? 'Full field workflow — premium driver UX (local phase state).' : 'Live booking — status syncs to customer in real time.'}
          </p>
        </div>
        <AnimatePresence>
          {phase === 'completed' ? (
            <m.span
              initial={reduced ? false : { scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-lg"
            >
              <PartyPopper className="size-6" strokeWidth={1.75} aria-hidden />
            </m.span>
          ) : null}
        </AnimatePresence>
      </m.div>

      {trackingError && trackActive && !tracking ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-900 dark:text-amber-100">
          Map unavailable: {trackingError}
        </p>
      ) : null}

      <WasherEtaRouteCard
        etaMinutes={displayJob.etaMinutes ?? tracking?.eta_minutes ?? 22}
        address={displayJob.service_address}
        phase={phase}
        tracking={trackActive ? tracking : undefined}
      />

      <Card variant="glass" className="border-white/15 !p-5 dark:border-white/10">
        <h2 className="wg-heading-section">Customer</h2>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/25 to-indigo-500/20 ring-1 ring-white/15">
            <User className="size-7 text-cyan-800 dark:text-cyan-100" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-wg-text">{displayJob.customerName ?? 'Customer'}</p>
            {displayJob.customerPhone ? (
              <a
                href={`tel:${String(displayJob.customerPhone).replace(/\D/g, '')}`}
                className="mt-1 inline-flex min-h-[44px] min-w-[44px] items-center gap-2 py-1 text-sm font-bold text-cyan-700 transition active:scale-[0.98] dark:text-cyan-300"
              >
                <Phone className="size-4" strokeWidth={1.75} aria-hidden />
                {displayJob.customerPhone}
              </a>
            ) : (
              <p className="mt-1 text-sm text-wg-muted">Customer phone via CRM</p>
            )}
          </div>
        </div>
        <dl className="mt-4 grid gap-2.5 text-sm">
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
            <dd className="font-semibold text-wg-text">{formatDateTime(displayJob.scheduled_at)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-wg-muted">Payout</dt>
            <dd className="font-black tabular-nums text-wg-text">{formatCents(displayJob.price_cents, displayJob.currency)}</dd>
          </div>
        </dl>
      </Card>

      <Card variant="glass" className="border-cyan-500/15 !p-5 shadow-[0_12px_40px_-24px_rgb(6_182_212/0.45)] ring-1 ring-cyan-500/10 dark:border-white/10">
        <h2 className="wg-heading-section">Field briefing</h2>
        <p className="mt-1 text-xs text-wg-muted">Dispatch intel + customer context — read before wheels roll.</p>
        <div className="mt-4">
          <WasherJobServiceContext field={displayJob.partnerFieldUx} notes={displayJob.notes} />
        </div>
      </Card>

      <WasherPhotoProofSection key={id || 'job'} jobId={id} isDemo={isDemo} />

      <Card variant="glass" className="border-white/15 !p-5 dark:border-white/10">
        <div className="flex items-center justify-between gap-2">
          <h2 className="wg-heading-section">Service checklist</h2>
          <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-black tabular-nums text-cyan-800 dark:text-cyan-200">
            {progressPct}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-wg-border/80 dark:bg-white/10">
          <m.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500"
            initial={reduced ? false : { width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          />
        </div>
        <ul className="mt-4 space-y-2.5">
          {checklist.map((c, idx) => (
            <li key={c.id}>
              <m.button
                type="button"
                onClick={() => toggleCheck(c.id)}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : idx * 0.04 }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                whileHover={reduced ? undefined : { scale: 1.005 }}
                className={cn(
                  'flex min-h-[48px] w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left text-sm font-semibold transition-colors',
                  c.done
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-wg-muted line-through dark:border-emerald-500/20'
                    : 'border-white/15 bg-white/40 hover:border-cyan-500/35 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-cyan-500/30',
                )}
              >
                <CheckSquare className={cn('size-5 shrink-0', c.done ? 'text-emerald-600' : 'text-wg-muted')} strokeWidth={1.75} aria-hidden />
                <span className={c.done ? 'text-wg-muted' : 'text-wg-text'}>{c.label}</span>
              </m.button>
            </li>
          ))}
        </ul>
      </Card>

      <Card variant="glass" className="border-white/15 !p-5 dark:border-white/10">
        <h2 className="wg-heading-section">Wash timeline</h2>
        <p className="mt-1 text-xs text-wg-muted">Live lifecycle — synced with your dock actions (demo storage).</p>
        <div className="mt-4">
          <WasherJobProgress phase={phase} />
        </div>
        {phase === 'completed' ? (
          <m.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm font-bold text-emerald-700 dark:text-emerald-300"
          >
            All milestones cleared — customer sees “completed”.
          </m.p>
        ) : null}
      </Card>

      <WasherJobStickyDock
        phase={phase}
        reduced={reduced}
        onAdvance={onAdvance}
        showSwipeComplete
        showCelebrationBanner={celebrate}
      />
    </div>
  );
}
