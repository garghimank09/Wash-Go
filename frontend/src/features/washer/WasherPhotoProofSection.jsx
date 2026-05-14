import { useState } from 'react';
import { m } from 'framer-motion';
import { Camera, Check, ImagePlus } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

const MOCK_ARRIVAL =
  'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=600&q=70';
const MOCK_COMPLETE =
  'https://images.unsplash.com/photo-1520340351474-f8131a6ecef2?auto=format&fit=crop&w=600&q=70';

function key(kind, jobId) {
  return `washgo:washer:photoProof:${kind}:${jobId || 'demo'}`;
}

function readProof(jobId) {
  try {
    return {
      arrival: sessionStorage.getItem(key('arrival', jobId)) === '1',
      complete: sessionStorage.getItem(key('complete', jobId)) === '1',
    };
  } catch {
    return { arrival: false, complete: false };
  }
}

/** Before/after proof cards — mock uploads until real APIs exist. */
export function WasherPhotoProofSection({ jobId }) {
  const reduced = useReducedMotion();
  const [arrival, setArrival] = useState(() => readProof(jobId).arrival);
  const [complete, setComplete] = useState(() => readProof(jobId).complete);

  const setProof = (kind, value) => {
    try {
      sessionStorage.setItem(key(kind, jobId), value ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (kind === 'arrival') setArrival(value);
    else setComplete(value);
  };

  const cards = [
    {
      id: 'arrival',
      title: 'Arrival proof',
      subtitle: 'Plate + context photo',
      done: arrival,
      mockUrl: MOCK_ARRIVAL,
      onAdd: () => setProof('arrival', true),
    },
    {
      id: 'complete',
      title: 'Completion proof',
      subtitle: 'Shine check & handoff',
      done: complete,
      mockUrl: MOCK_COMPLETE,
      onAdd: () => setProof('complete', true),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="wg-heading-section">Photo proof</h2>
          <p className="mt-0.5 text-xs text-wg-muted">Ops-grade before / after — tap to attach demo captures.</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-900 dark:text-amber-100">
          Demo
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c, i) => (
          <m.button
            key={c.id}
            type="button"
            onClick={() => !c.done && c.onAdd()}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.06 }}
            whileTap={c.done || reduced ? undefined : { scale: 0.98 }}
            className={cn(
              'group relative overflow-hidden rounded-2xl border text-left shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
              c.done
                ? 'border-emerald-500/35 ring-1 ring-emerald-500/20'
                : 'border-white/15 bg-wg-surface-elevated/40 hover:border-cyan-500/30 dark:border-white/10 dark:bg-white/[0.04]',
            )}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
              {c.done ? (
                <>
                  <img src={c.mockUrl} alt="" className="size-full object-cover" loading="lazy" />
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
                  <p className="text-center text-xs font-semibold text-white/70">Tap to attach mock photo</p>
                </div>
              )}
            </div>
            <div className="space-y-0.5 border-t border-white/10 bg-[color:var(--wg-glass-bg)] px-3 py-3 backdrop-blur-xl dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black text-wg-text">{c.title}</p>
                <Camera className="size-4 text-wg-muted opacity-70 group-hover:text-cyan-500" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="text-xs text-wg-muted">{c.subtitle}</p>
            </div>
          </m.button>
        ))}
      </div>
    </div>
  );
}
