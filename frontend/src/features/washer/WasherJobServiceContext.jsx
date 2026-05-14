import { m } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Package, Repeat2, Sparkles, Tag } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

/**
 * Field-ops context: handling tags, vehicle notes, loyalty — demo-enriched via partnerFieldDemo.
 */
export function WasherJobServiceContext({ field, notes }) {
  const reduced = useReducedMotion();
  if (!field && !notes) return null;

  const tags = field?.specialHandlingTags ?? [];
  const showTags = tags.length > 0;
  const showWarning = Boolean(field?.vehicleConditionWarning);
  const showNote = Boolean(field?.serviceNote);
  const showLoyalty = field?.repeatCustomer || field?.loyaltyTier || field?.premiumMemberLabel;

  if (!showTags && !showWarning && !showNote && !showLoyalty) return null;

  return (
    <m.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="space-y-3"
    >
      {showLoyalty ? (
        <div className="flex flex-wrap items-center gap-2">
          {field.repeatCustomer ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-950 dark:text-cyan-100">
              <Repeat2 className="size-3.5" strokeWidth={2} aria-hidden />
              Repeat customer
            </span>
          ) : null}
          {field.loyaltyTier ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-gradient-to-r from-amber-500/15 to-rose-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-950 dark:text-amber-50">
              <Sparkles className="size-3.5" strokeWidth={2} aria-hidden />
              Loyalty · {field.loyaltyTier}
            </span>
          ) : null}
          {field.premiumMemberLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-950 dark:text-indigo-100">
              <BadgeCheck className="size-3.5" strokeWidth={2} aria-hidden />
              {field.premiumMemberLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {showWarning ? (
        <div
          role="status"
          className="flex gap-3 rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-500/15 to-orange-500/8 p-3.5 shadow-sm ring-1 ring-amber-500/20 dark:from-amber-500/12 dark:to-orange-500/6"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/25 text-amber-900 dark:text-amber-100">
            <AlertTriangle className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wide text-amber-900 dark:text-amber-100">Vehicle condition</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-wg-text">{field.vehicleConditionWarning}</p>
          </div>
        </div>
      ) : null}

      {showTags ? (
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-wg-muted">
            <Tag className="size-3" strokeWidth={2} aria-hidden />
            Special handling
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {tags.map((t, i) => (
              <m.li
                key={t}
                initial={reduced ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduced ? 0 : 0.04 * i, type: 'spring', stiffness: 420, damping: 26 }}
                className="rounded-xl border border-white/20 bg-white/50 px-2.5 py-1.5 text-xs font-bold text-wg-text shadow-sm ring-1 ring-black/[0.04] dark:border-white/10 dark:bg-white/[0.06] dark:ring-white/10"
              >
                {t}
              </m.li>
            ))}
          </ul>
        </div>
      ) : null}

      {showNote ? (
        <div className="flex gap-2 rounded-2xl border border-indigo-500/25 bg-indigo-500/8 p-3 dark:border-indigo-500/15">
          <Package className="mt-0.5 size-4 shrink-0 text-indigo-600 dark:text-indigo-300" strokeWidth={2} aria-hidden />
          <p className="text-xs font-medium leading-relaxed text-wg-text">{field.serviceNote}</p>
        </div>
      ) : null}

      {notes ? (
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border-2 border-amber-400/45 bg-gradient-to-br from-amber-500/18 via-amber-500/10 to-transparent p-4 shadow-md ring-1 ring-amber-500/25 dark:from-amber-500/14',
            'before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gradient-to-b before:from-amber-400 before:to-orange-500',
          )}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-950 dark:text-amber-100">Customer notes · read before start</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-wg-text">{notes}</p>
        </div>
      ) : null}
    </m.div>
  );
}
