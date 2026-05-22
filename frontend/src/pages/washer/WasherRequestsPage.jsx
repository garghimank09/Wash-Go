import { useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { m } from 'framer-motion';
import { Check, Flame, MapPin, Radio, Sparkles, Target, X } from 'lucide-react';

import { usePartnerOffers } from '../../hooks/usePartnerOffers';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { dispatchBookingsSync } from '../../lib/bookingSyncEvents';
import { parseBookingMeta } from '../../lib/bookingMeta';
import { enrichDispatchOffer } from '../../lib/partnerFieldDemo';
import { getErrorMessage } from '../../services/api';
import { partnerBookingsService } from '../../services/partnerBookingsService';
import { partnerEarningsCents } from '../../lib/partnerEarnings';
import { formatCents, formatDateTime } from '../../utils/format';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { cn } from '../../lib/cn';

const DISMISSED_KEY = 'washgo:washer:dismissedOffers';

function getDismissed() {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function dismissOffer(id) {
  try {
    const s = getDismissed();
    s.add(id);
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

function mapOffer(o) {
  const scheduled = new Date(o.scheduled_at);
  const mins = Math.max(5, Math.round((scheduled.getTime() - Date.now()) / 60000));
  const { packageLabel } = parseBookingMeta(o.notes);
  return {
    id: o.id,
    customerName: o.customer_name || 'Customer',
    address: o.service_address,
    earningsCents: partnerEarningsCents(o.price_cents),
    grossCents: o.price_cents,
    vehicle: o.car_label || 'Vehicle',
    packageLabel: packageLabel ?? '—',
    windowLabel: formatDateTime(o.scheduled_at),
    etaMinutes: mins,
    isLiveSim: false,
  };
}

export function WasherRequestsPage() {
  const reduced = useReducedMotion();
  const av = useOutletContext();
  const navigate = useNavigate();
  const { items, loading, error } = usePartnerOffers();
  const [dismissTick, setDismissTick] = useState(0);
  const [acceptingId, setAcceptingId] = useState(null);

  const offers = useMemo(() => {
    const dismissed = getDismissed();
    return items.filter((o) => !dismissed.has(o.id)).map(mapOffer);
  }, [items, dismissTick]);

  const enrichedOffers = useMemo(() => offers.map((o) => enrichDispatchOffer(o)), [offers]);

  const accept = async (offerId) => {
    setAcceptingId(offerId);
    try {
      await partnerBookingsService.accept(offerId);
      dispatchBookingsSync();
      toast.success('Job accepted — opening active run.');
      navigate(`/partner/jobs/${offerId}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setAcceptingId(null);
    }
  };

  const reject = (offerId) => {
    dismissOffer(offerId);
    setDismissTick((t) => t + 1);
    toast('Offer hidden for this session.', { icon: '↩' });
  };

  return (
    <div className="space-y-5">
      <m.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-wg-text">Incoming</h1>
        <p className="mt-1 text-sm text-wg-muted">
          Live offers from open customer bookings — updates sync automatically while you&apos;re{' '}
          <span className="font-bold text-wg-text">online</span>.
        </p>
      </m.div>

      {!av?.online ? (
        <Card variant="glass" className="border-amber-500/25 bg-amber-500/8 py-4 text-center text-sm text-amber-950 dark:text-amber-100">
          Go <strong>Online</strong> in the header to receive dispatch offers.
        </Card>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {loading && offers.length === 0 ? (
        <Card variant="glass" className="py-10 text-center text-sm text-wg-muted">
          Loading offers…
        </Card>
      ) : null}

      {!loading && offers.length === 0 ? (
        <Card variant="glass" className="border-dashed border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.06] to-transparent py-12 text-center">
          <p className="text-sm font-bold text-wg-text">No open offers right now</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-wg-muted">
            New customer bookings appear here in real time while you are online and accepting jobs.
          </p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {enrichedOffers.map((r, i) => {
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
                  className="overflow-hidden border-cyan-500/25 shadow-wg-card ring-1 ring-white/10 dark:ring-white/5"
                >
                  <div className="border-b border-wg-border/70 bg-gradient-to-r from-cyan-500/12 via-indigo-500/10 to-emerald-500/10 px-4 py-3 dark:border-white/10">
                    <m.div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-wg-muted">
                          <Radio className="size-3 text-emerald-500" strokeWidth={2} aria-hidden />
                          Live offer
                        </p>
                        <p className="text-lg font-black text-wg-text">{r.customerName}</p>
                        {intel ? (
                          <m.div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                          </m.div>
                        ) : null}
                      </div>
                      <span className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-md ring-2 ring-white/25 dark:ring-slate-900/40">
                        +{formatCents(r.earningsCents)}
                      </span>
                    </m.div>
                  </div>
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
                      <Button
                        type="button"
                        className="min-h-[48px] flex-1 gap-2"
                        disabled={acceptingId === r.id}
                        onClick={() => accept(r.id)}
                      >
                        <Check className="size-4" strokeWidth={2} aria-hidden />
                        {acceptingId === r.id ? 'Accepting…' : 'Accept'}
                      </Button>
                      <Button type="button" variant="outline" className="min-h-[48px] flex-1 gap-2" onClick={() => reject(r.id)}>
                        <X className="size-4" strokeWidth={2} aria-hidden />
                        Skip
                      </Button>
                    </div>
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
