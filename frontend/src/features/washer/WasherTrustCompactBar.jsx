import { m } from 'framer-motion';
import { Award, Clock, ShieldCheck, Star, ThumbsUp } from 'lucide-react';

import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { getPartnerTrustDemo } from '../../lib/partnerFieldDemo';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

/** Compact trust strip — investor-safe demo metrics (not from live APIs). */
export function WasherTrustCompactBar() {
  const { user } = usePartnerAuth();
  const reduced = useReducedMotion();
  const t = getPartnerTrustDemo(user);

  const items = [
    { icon: Star, label: `${t.rating}`, sub: 'Rating' },
    { icon: ThumbsUp, label: `${t.acceptancePct}%`, sub: 'Accept' },
    { icon: Clock, label: `${t.onTimePct}%`, sub: 'On-time' },
    { icon: Award, label: `${t.completionStreak}`, sub: 'Streak' },
    { icon: ShieldCheck, label: `${t.trustScore}`, sub: 'Trust' },
  ];

  return (
    <m.div
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="mx-auto mt-2 flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-white/12 bg-gradient-to-r from-white/50 to-white/30 px-2 py-1.5 shadow-sm ring-1 ring-black/[0.04] backdrop-blur-md dark:from-white/[0.07] dark:to-white/[0.03] dark:ring-white/10"
    >
      {t.safetyVerified ? (
        <span className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
          <ShieldCheck className="size-3" strokeWidth={2} aria-hidden />
          Verified
        </span>
      ) : null}
      {items.map((it, i) => (
        <m.span
          key={it.sub}
          initial={reduced ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduced ? 0 : 0.03 * i, type: 'spring', stiffness: 420, damping: 28 }}
          className="flex min-h-[36px] min-w-[3.25rem] flex-col items-center rounded-xl bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]"
        >
          <span className="flex items-center gap-0.5 text-[11px] font-black tabular-nums text-wg-text">
            <it.icon className={cn('size-3 text-cyan-600 dark:text-cyan-400')} strokeWidth={2} aria-hidden />
            {it.label}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wide text-wg-muted">{it.sub}</span>
        </m.span>
      ))}
    </m.div>
  );
}
