import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { m } from 'framer-motion';
import { AlarmClock, Check, Flame, MapPin, Radio, Sparkles, Target, X, Zap } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { enrichDispatchOffer } from '../../lib/partnerFieldDemo';
import { formatCents } from '../../utils/format';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { dismissIncomingOffer, getMergedIncomingRequests } from '../../features/washer/mock/liveDispatchSimulation';
import { cn } from '../../lib/cn';

function secondsLeft(expiresAt) {
  if (!expiresAt || typeof expiresAt !== 'number') return null;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

export function WasherRequestsPage() {
  const reduced = useReducedMotion();
  const av = useOutletContext();
  const navigate = useNavigate();
  const [offers, setOffers] = useState(() => getMergedIncomingRequests());

  const enrichedOffers = useMemo(() => offers.map((o) => enrichDispatchOffer(o)), [offers]);

  const refresh = () => setOffers(getMergedIncomingRequests());

  useEffect(() => {
    const on = () => refresh();
    window.addEventListener('washgo:dispatch-update', on);
    const id = setInterval(() => {
      refresh();
    }, 2600);
    return () => {
      window.removeEventListener('washgo:dispatch-update', on);
      clearInterval(id);
    };
  }, []);

  const accept = (id) => {
    toast.success('Offer accepted — opening job (demo flow).');
    dismissIncomingOffer(id);
    refresh();
    navigate('/partner/jobs/demo');
  };

  const reject = (id) => {
    toast('Offer declined.', { icon: '↩' });
    dismissIncomingOffer(id);
    refresh();
  };

  return (
    <div className="space-y-5">
      <m.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-wg-text">Incoming</h1>
        <p className="mt-1 text-sm text-wg-muted">
          Live dispatch simulation while you&apos;re <span className="font-bold text-wg-text">online</span> — offers auto-appear and expire like
          production SLA.
        </p>
      </m.div>

      {!av?.online ? (
        <Card variant="glass" className="border-amber-500/25 bg-amber-500/8 py-4 text-center text-sm text-amber-950 dark:text-amber-100">
          Go <strong>Online</strong> in the header to activate auto-dispatch pings.
        </Card>
      ) : null}

      {offers.length === 0 ? (
        <Card variant="glass" className="border-dashed border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.06] to-transparent py-12 text-center">
          <p className="text-sm font-bold text-wg-text">Dispatch channel quiet</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-wg-muted">
            Simulated offers arrive on a calmer cadence (~25–45s) while online. Clear dismiss keys or toggle offline/online to reset rhythm.
          </p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {enrichedOffers.map((r, i) => {
            const sec = secondsLeft(r.expiresAt);
            const urgent = r.isLiveSim && sec !== null && sec <= 22;
            const intel = r.dispatchIntel;
            return (
              <m.li
                key={r.id}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : i * 0.06, type: 'spring', stiffness: 380, damping: 34 }}
              >
                <Card
                  variant="glass"
                  className={cn(
                    'overflow-hidden border-cyan-500/25 shadow-wg-card ring-1 ring-white/10 dark:ring-white/5',
                    urgent && 'ring-2 ring-amber-400/45 shadow-[0_0_28px_-6px_rgb(251_191_36/0.35)]',
                  )}
                >
                  <m.div
                    className="border-b border-wg-border/70 bg-gradient-to-r from-cyan-500/12 via-indigo-500/10 to-emerald-500/10 px-4 py-3 dark:border-white/10"
                    animate={r.isLiveSim && !reduced ? { opacity: [1, 0.94, 1] } : false}
                    transition={{ duration: 3.4, repeat: r.isLiveSim ? Infinity : 0, ease: 'easeInOut' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-wg-muted">
                          {r.isLiveSim ? (
                            <>
                              <Radio className="size-3 text-emerald-500" strokeWidth={2} aria-hidden />
                              Live dispatch
                            </>
                          ) : (
                            'Customer'
                          )}
                        </p>
                        <p className="text-lg font-black text-wg-text">{r.customerName}</p>
                        {intel ? (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-indigo-950 dark:text-indigo-100">
                              {intel.priorityLabel}
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-lg border border-emerald-500/35 bg-emerald-500/12 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-950 dark:text-emerald-100">
                              <Target className="size-3" strokeWidth={2} aria-hidden />
                              Best match {intel.bestMatchPct}%
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center gap-0.5 rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase',
                                intel.heatLevel === 0 && 'border-cyan-500/35 bg-cyan-500/12 text-cyan-950 dark:text-cyan-100',
                                intel.heatLevel === 1 && 'border-amber-500/40 bg-amber-500/12 text-amber-950 dark:text-amber-50',
                                intel.heatLevel === 2 && 'border-rose-500/35 bg-rose-500/12 text-rose-950 dark:text-rose-50',
                              )}
                            >
                              <Flame className="size-3" strokeWidth={2} aria-hidden />
                              {intel.heatLabel}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <m.span
                        className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-md ring-2 ring-white/25 dark:ring-slate-900/40"
                        animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        +{formatCents(r.earningsCents, 'USD')}
                      </m.span>
                    </div>
                    {sec !== null ? (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-white backdrop-blur-md dark:bg-black/30">
                        <AlarmClock className="size-4 shrink-0 text-amber-300" strokeWidth={2} aria-hidden />
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wide text-white/60">Offer expires</p>
                          <p className={cn('font-mono text-lg font-black tabular-nums', urgent && 'text-amber-200')}>
                            {sec}s
                          </p>
                        </div>
                        <Zap className="ml-auto size-5 text-amber-300/90" strokeWidth={1.75} aria-hidden />
                      </div>
                    ) : null}
                  </m.div>
                  <div className="space-y-3 px-4 py-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-lg bg-wg-surface/90 px-2 py-1 font-semibold text-wg-text ring-1 ring-wg-border dark:bg-white/[0.06]">
                        {r.vehicle}
                      </span>
                      <span className="rounded-lg bg-indigo-500/10 px-2 py-1 font-semibold text-indigo-900 dark:text-indigo-100">
                        {r.packageLabel}
                      </span>
                      <span className="rounded-lg bg-amber-500/10 px-2 py-1 font-bold text-amber-900 dark:text-amber-100">
                        ETA ~{r.etaMinutes} min
                      </span>
                    </div>
                    <p className="flex items-start gap-2 text-sm text-wg-muted">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
                      {r.address}
                    </p>
                    <p className="text-xs font-medium text-wg-muted">{r.windowLabel}</p>
                    {intel ? (
                      <div className="rounded-xl border border-white/12 bg-black/[0.03] p-3 text-[11px] leading-snug dark:bg-white/[0.04]">
                        <p className="font-semibold text-wg-text">{intel.demandLine}</p>
                        <p className="mt-1.5 flex items-start gap-1.5 text-wg-muted">
                          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
                          <span>{intel.confidenceLine}</span>
                        </p>
                      </div>
                    ) : null}
                    <div className="flex gap-2 pt-1">
                      <Button type="button" className="min-h-[48px] flex-1 gap-2" onClick={() => accept(r.id)}>
                        <Check className="size-4" strokeWidth={2} aria-hidden />
                        Accept
                      </Button>
                      <Button type="button" variant="outline" className="min-h-[48px] flex-1 gap-2" onClick={() => reject(r.id)}>
                        <X className="size-4" strokeWidth={2} aria-hidden />
                        Decline
                      </Button>
                    </div>
                    <p className="text-[10px] leading-relaxed text-wg-muted">
                      Demo dispatch — wire to POST accept when backend is ready.{' '}
                      <Link to="/partner/jobs/demo" className="font-bold text-cyan-700 dark:text-cyan-300">
                        Preview job UI →
                      </Link>
                    </p>
                  </div>
                </Card>
              </m.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
