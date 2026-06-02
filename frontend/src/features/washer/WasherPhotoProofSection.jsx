import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { m } from 'framer-motion';
import { Camera, Check, ImagePlus, Loader2, MapPin } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { dispatchBookingsSync } from '../../lib/bookingSyncEvents';
import { getErrorMessage } from '../../services/api';
import { partnerPhotoService, photoUrl } from '../../services/partnerPhotoService';
import { cn } from '../../lib/cn';
import { demoPhotoProofKey, readDemoPhotoProof } from '../../lib/washerPhotoProof';
import { phaseRank } from '../../lib/washerJobPhase';

const MOCK_BEFORE =
  'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=600&q=70';
const MOCK_AFTER =
  'https://images.unsplash.com/photo-1520340351474-f8131a6ecef2?auto=format&fit=crop&w=600&q=70';
const MOCK_ARRIVAL =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=70';

const BEFORE_WASH_DEF = {
  kind: 'before',
  title: 'Before wash',
  subtitle: 'Required before you start service',
};

const AFTER_WASH_DEF = {
  kind: 'after',
  title: 'After wash',
  subtitle: 'Required at QC — finished result & handoff proof',
};

/** Vehicle condition (customer approval) + before/after wash proof. */
export function WasherPhotoProofSection({
  jobId,
  isDemo = false,
  washerPhase = 'received',
  servicePhase = null,
  initialArrivalNotes = '',
  onArrivalUploaded,
  onPhotosChanged,
  embedded = false,
}) {
  const reduced = useReducedMotion();
  const fileRef = useRef(null);
  const pendingKind = useRef(null);

  const [photos, setPhotos] = useState({ arrival: null, before: null, after: null });
  const [demo, setDemo] = useState(() => (isDemo ? readDemoPhotoProof(jobId) : { arrival: false, before: false, after: false }));
  const [uploading, setUploading] = useState(null);
  const [loading, setLoading] = useState(!isDemo && Boolean(jobId));
  const [arrivalNotes, setArrivalNotes] = useState(initialArrivalNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setArrivalNotes(initialArrivalNotes || '');
  }, [initialArrivalNotes, jobId]);

  const showArrival =
    isDemo ||
    ['arrived', 'awaiting_approval', 'arrival_approved', 'wash_started', 'qc_review', 'completed'].includes(
      washerPhase,
    ) ||
    ['arrived_onsite', 'awaiting_arrival_approval', 'arrival_approved', 'wash_in_progress', 'completed'].includes(
      servicePhase || '',
    );

  const arrivalDone = isDemo ? demo.arrival : Boolean(photos.arrival);
  const arrivalLocked =
    !isDemo &&
    servicePhase &&
    ['arrival_approved', 'wash_in_progress', 'completed'].includes(servicePhase);

  const showBeforeWash =
    isDemo ||
    phaseRank(washerPhase) >= phaseRank('arrival_approved') ||
    ['arrival_approved', 'wash_in_progress', 'completed'].includes(servicePhase || '');

  const showAfterWash =
    isDemo ||
    phaseRank(washerPhase) >= phaseRank('wash_started') ||
    ['wash_in_progress', 'completed'].includes(servicePhase || '');

  const loadPhotos = useCallback(async () => {
    if (!jobId || isDemo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await partnerPhotoService.list(jobId);
      const map = { arrival: null, before: null, after: null };
      for (const p of data.items || []) {
        map[p.kind] = { ...p, displayUrl: photoUrl(p.url) };
      }
      setPhotos(map);
    } catch {
      /* logged out or forbidden */
    } finally {
      setLoading(false);
    }
  }, [jobId, isDemo]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  const openPicker = (kind) => {
    if (isDemo) {
      try {
        sessionStorage.setItem(demoPhotoProofKey(kind, jobId), '1');
      } catch {
        /* ignore */
      }
      setDemo((d) => {
        const next = { ...d, [kind]: true };
        onPhotosChanged?.(next);
        return next;
      });
      if (kind === 'arrival') {
        onArrivalUploaded?.();
        toast.success('Vehicle condition sent — waiting for customer approval (demo)');
      } else {
        toast.success(`${kind === 'before' ? 'Before' : 'After'} photo saved (demo)`);
      }
      return;
    }
    if (kind === 'arrival' && arrivalLocked) {
      toast.error('Customer already approved the vehicle condition');
      return;
    }
    if (kind === 'before' && !showBeforeWash) {
      toast.error('Customer must approve vehicle condition before wash photos');
      return;
    }
    if (kind === 'after' && !showAfterWash) {
      toast.error('Start wash before uploading after-service proof');
      return;
    }
    pendingKind.current = kind;
    fileRef.current?.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    const kind = pendingKind.current;
    e.target.value = '';
    pendingKind.current = null;
    if (!file || !kind || !jobId) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be 5 MB or smaller');
      return;
    }

    setUploading(kind);
    try {
      const saved = await partnerPhotoService.upload(
        jobId,
        kind,
        file,
        kind === 'arrival' ? arrivalNotes : undefined,
      );
      setPhotos((prev) => {
        const next = {
          ...prev,
          [kind]: { ...saved, displayUrl: photoUrl(saved.url) },
        };
        onPhotosChanged?.(next);
        return next;
      });
      dispatchBookingsSync();
      if (kind === 'arrival') {
        onArrivalUploaded?.();
        toast.success('Vehicle condition sent — customer notified to approve');
      } else {
        toast.success(`${kind === 'before' ? 'Before' : 'After'} wash photo uploaded`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(null);
    }
  };

  const renderCard = (def, i, displayUrl, done, busy) => (
    <m.button
      key={def.kind}
      type="button"
      disabled={
        busy ||
        (def.kind === 'arrival' && arrivalLocked) ||
        (def.kind === 'before' && !showBeforeWash) ||
        (def.kind === 'after' && !showAfterWash)
      }
      onClick={() => !busy && openPicker(def.kind)}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : i * 0.06 }}
      whileTap={done || reduced || busy ? undefined : { scale: 0.98 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border text-left shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
        done
          ? 'border-emerald-500/35 ring-1 ring-emerald-500/20'
          : 'border-white/15 bg-wg-surface-elevated/40 hover:border-cyan-500/30 dark:border-white/10 dark:bg-white/[0.04]',
        busy && 'opacity-80',
        def.kind === 'arrival' && !done && 'border-amber-500/35 ring-1 ring-amber-500/15',
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        {busy ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-slate-900/90">
            <Loader2 className="size-8 animate-spin text-cyan-300" aria-hidden />
            <p className="text-xs font-semibold text-white/80">Uploading…</p>
          </div>
        ) : done && displayUrl ? (
          <>
            <img src={displayUrl} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-lg">
              <Check className="size-3" strokeWidth={3} aria-hidden />
              {def.kind === 'arrival' && servicePhase === 'awaiting_arrival_approval'
                ? 'Awaiting OK'
                : 'Saved'}
            </span>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-950 p-4">
            <span className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
              {def.kind === 'arrival' ? (
                <MapPin className="size-7 text-amber-200/90" strokeWidth={1.25} aria-hidden />
              ) : (
                <ImagePlus className="size-7 text-cyan-200/80" strokeWidth={1.25} aria-hidden />
              )}
            </span>
            <p className="text-center text-xs font-semibold text-white/70">Tap to take or upload photo</p>
          </div>
        )}
      </div>
      <div className="space-y-0.5 border-t border-white/10 bg-[color:var(--wg-glass-bg)] px-3 py-3 backdrop-blur-xl dark:border-white/10">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-black text-wg-text">{def.title}</p>
          <Camera className="size-4 text-wg-muted opacity-70 group-hover:text-cyan-500" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="text-xs text-wg-muted">{def.subtitle}</p>
      </div>
    </m.button>
  );

  const sectionTitle = embedded ? 'text-sm font-black text-wg-text' : 'wg-heading-section';
  const sectionSub = embedded ? 'mt-0.5 text-[11px] leading-snug text-wg-muted' : 'mt-0.5 text-xs text-wg-muted';

  return (
    <div className={embedded ? 'space-y-5' : 'space-y-4'}>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={onFileChange}
      />

      {showArrival ? (
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className={sectionTitle}>Vehicle condition</h2>
              <p className={sectionSub}>
                {arrivalDone
                  ? servicePhase === 'awaiting_arrival_approval'
                    ? 'Sent — customer must approve condition before you start the wash.'
                    : servicePhase === 'arrival_approved' || arrivalLocked
                      ? 'Approved — accept the vehicle and start the service from the dock.'
                      : 'Capture the vehicle’s current state at your location.'
                  : 'Required on arrival — photo plus optional remarks. Customer approves before the wash.'}
              </p>
            </div>
            {arrivalDone && servicePhase === 'awaiting_arrival_approval' ? (
              <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-900 dark:text-amber-100">
                Pending OK
              </span>
            ) : null}
          </div>
          {renderCard(
            {
              kind: 'arrival',
              title: 'Current vehicle condition',
              subtitle: 'Scratches, dirt, or damage — customer reviews before wash',
            },
            0,
            isDemo ? MOCK_ARRIVAL : photos.arrival?.displayUrl,
            arrivalDone,
            uploading === 'arrival',
          )}
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-wg-muted">Condition notes (optional)</span>
            <textarea
              value={arrivalNotes}
              onChange={(e) => setArrivalNotes(e.target.value)}
              disabled={arrivalLocked}
              maxLength={2000}
              rows={3}
              placeholder="e.g. light scratches on rear bumper, muddy wheels…"
              className="w-full resize-y rounded-xl border border-wg-border/80 bg-wg-surface-elevated/80 px-3 py-2 text-sm text-wg-text placeholder:text-wg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-60 dark:border-white/10"
            />
          </label>
          {arrivalDone && !arrivalLocked && !isDemo ? (
            <button
              type="button"
              disabled={savingNotes}
              onClick={async () => {
                setSavingNotes(true);
                try {
                  await partnerPhotoService.updateArrivalNotes(jobId, arrivalNotes);
                  dispatchBookingsSync();
                  toast.success('Condition notes saved');
                } catch (err) {
                  toast.error(getErrorMessage(err));
                } finally {
                  setSavingNotes(false);
                }
              }}
              className="text-xs font-semibold text-cyan-700 underline-offset-2 hover:underline disabled:opacity-60 dark:text-cyan-300"
            >
              {savingNotes ? 'Saving…' : 'Save notes without re-uploading photo'}
            </button>
          ) : null}
        </div>
      ) : null}

      {showBeforeWash || showAfterWash ? (
        <div className="space-y-5">
          {loading ? (
            <p className="flex items-center gap-2 text-xs text-wg-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading proof photos…
            </p>
          ) : null}

          {showBeforeWash ? (
            <div className="space-y-3">
              <div>
                <h2 className={sectionTitle}>Before service</h2>
                <p className={sectionSub}>
                  Upload before you tap <span className="font-semibold">Start service</span> on the dock.
                </p>
              </div>
              {renderCard(
                BEFORE_WASH_DEF,
                1,
                isDemo ? MOCK_BEFORE : photos.before?.displayUrl,
                isDemo ? demo.before : Boolean(photos.before),
                uploading === 'before',
              )}
            </div>
          ) : null}

          {showAfterWash ? (
            <div className="space-y-3">
              <div>
                <h2 className={sectionTitle}>After service (QC)</h2>
                <p className={sectionSub}>
                  Upload when you run QC — required before you swipe to finish the job.
                </p>
              </div>
              {renderCard(
                AFTER_WASH_DEF,
                2,
                isDemo ? MOCK_AFTER : photos.after?.displayUrl,
                isDemo ? demo.after : Boolean(photos.after),
                uploading === 'after',
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
