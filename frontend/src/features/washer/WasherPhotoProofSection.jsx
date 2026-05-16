import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { m } from 'framer-motion';
import { Camera, Check, ImagePlus, Loader2 } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { dispatchBookingsSync } from '../../lib/bookingSyncEvents';
import { getErrorMessage } from '../../services/api';
import { partnerPhotoService, photoUrl } from '../../services/partnerPhotoService';
import { cn } from '../../lib/cn';

const MOCK_BEFORE =
  'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=600&q=70';
const MOCK_AFTER =
  'https://images.unsplash.com/photo-1520340351474-f8131a6ecef2?auto=format&fit=crop&w=600&q=70';

function demoKey(kind, jobId) {
  return `washgo:washer:photoProof:${kind}:${jobId || 'demo'}`;
}

function readDemo(jobId) {
  try {
    return {
      before: sessionStorage.getItem(demoKey('before', jobId)) === '1',
      after: sessionStorage.getItem(demoKey('after', jobId)) === '1',
    };
  } catch {
    return { before: false, after: false };
  }
}

const CARD_DEFS = [
  {
    kind: 'before',
    title: 'Before wash',
    subtitle: 'Vehicle condition before service starts',
  },
  {
    kind: 'after',
    title: 'After wash',
    subtitle: 'Finished result — shine & handoff proof',
  },
];

/** Before/after photo proof — real uploads on live jobs; demo tap on `/partner/jobs/demo`. */
export function WasherPhotoProofSection({ jobId, isDemo = false }) {
  const reduced = useReducedMotion();
  const fileRef = useRef(null);
  const pendingKind = useRef(null);

  const [photos, setPhotos] = useState({ before: null, after: null });
  const [demo, setDemo] = useState(() => (isDemo ? readDemo(jobId) : { before: false, after: false }));
  const [uploading, setUploading] = useState(null);
  const [loading, setLoading] = useState(!isDemo && Boolean(jobId));

  const loadPhotos = useCallback(async () => {
    if (!jobId || isDemo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await partnerPhotoService.list(jobId);
      const map = { before: null, after: null };
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
        sessionStorage.setItem(demoKey(kind, jobId), '1');
      } catch {
        /* ignore */
      }
      setDemo((d) => ({ ...d, [kind]: true }));
      toast.success(`${kind === 'before' ? 'Before' : 'After'} photo saved (demo)`);
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
      const saved = await partnerPhotoService.upload(jobId, kind, file);
      setPhotos((prev) => ({
        ...prev,
        [kind]: { ...saved, displayUrl: photoUrl(saved.url) },
      }));
      dispatchBookingsSync();
      toast.success(`${kind === 'before' ? 'Before' : 'After'} wash photo uploaded`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={onFileChange}
      />
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="wg-heading-section">Photo proof</h2>
          <p className="mt-0.5 text-xs text-wg-muted">
            {isDemo
              ? 'Demo job — tap to simulate before & after captures.'
              : 'Upload before and after wash photos — saved to this booking for ops & customer.'}
          </p>
        </div>
        {!isDemo ? (
          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
            Live
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-900 dark:text-amber-100">
            Demo
          </span>
        )}
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-wg-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading proof photos…
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {CARD_DEFS.map((def, i) => {
          const live = photos[def.kind];
          const done = isDemo ? demo[def.kind] : Boolean(live);
          const displayUrl = isDemo
            ? def.kind === 'before'
              ? MOCK_BEFORE
              : MOCK_AFTER
            : live?.displayUrl;
          const busy = uploading === def.kind;

          return (
            <m.button
              key={def.kind}
              type="button"
              disabled={busy}
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
                      Saved
                    </span>
                  </>
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-950 p-4">
                    <span className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
                      <ImagePlus className="size-7 text-cyan-200/80" strokeWidth={1.25} aria-hidden />
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
        })}
      </div>
    </div>
  );
}
