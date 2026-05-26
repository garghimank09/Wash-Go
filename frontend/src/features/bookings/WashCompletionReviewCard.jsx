import { useState } from 'react';
import toast from 'react-hot-toast';
import { m } from 'framer-motion';
import { CheckCircle2, Star, AlertTriangle } from 'lucide-react';

import { bookingsService } from '../../services/bookingsService';
import { getErrorMessage } from '../../services/api';
import { dispatchBookingsSync } from '../../lib/bookingSyncEvents';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { formatCents } from '../../utils/format';

const ISSUE_REASONS = [
  { key: 'quality_issue', label: 'Quality not satisfactory' },
  { key: 'incomplete_wash', label: 'Wash incomplete' },
  { key: 'damage_concern', label: 'Possible damage' },
  { key: 'missing_items', label: 'Missing personal items' },
  { key: 'other', label: 'Other' },
];

export function WashCompletionReviewCard({ booking, packageLabel, vehicleLabel, onUpdated }) {
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueKey, setIssueKey] = useState('quality_issue');

  const photos = booking?.photos || [];
  const before = photos.filter((p) => p.kind === 'before').slice(0, 2);
  const after = photos.filter((p) => p.kind === 'after').slice(0, 2);
  const strip = [...before, ...after];

  const handleConfirm = async () => {
    if (submitting || confirmed) return;
    setSubmitting(true);
    try {
      await bookingsService.confirmHandoff(booking.id);
      setConfirmed(true);
      dispatchBookingsSync();
      toast.success('Thanks — your wash is complete.');
      await onUpdated?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
      await onUpdated?.();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await bookingsService.reportHandoffIssue(booking.id, { reason_key: issueKey });
      setIssueOpen(false);
      dispatchBookingsSync();
      toast.success('Report submitted. Support will follow up.');
      await onUpdated?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <Card variant="glass" className="border-emerald-500/30 !p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" strokeWidth={1.75} aria-hidden />
        <p className="mt-3 text-lg font-black text-wg-text">All done!</p>
        <p className="mt-1 text-sm text-wg-muted">Thanks for confirming your wash.</p>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="overflow-hidden border-cyan-500/25 p-0 shadow-wg-card">
      <m.div
        className="bg-gradient-to-br from-cyan-700 via-cyan-600 to-teal-500 px-5 py-6 text-white"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Service complete</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Your wash is ready for review</h2>
        <p className="mt-2 text-sm text-white/90">Confirm completion or report an issue below.</p>
      </m.div>

      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-200">
            <Star className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="font-black text-wg-text">{booking?.washer?.full_name || 'Your washer'}</p>
            <p className="text-sm text-wg-muted">
              {packageLabel || 'Wash'}
              {vehicleLabel ? ` · ${vehicleLabel}` : ''}
            </p>
            <p className="mt-1 text-xs text-wg-muted">
              {formatCents(booking.price_cents, booking.currency)}
            </p>
          </div>
        </div>

        {strip.length ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {strip.map((p) => (
              <img
                key={p.id}
                src={p.url}
                alt=""
                className="size-20 shrink-0 rounded-xl object-cover ring-1 ring-wg-border/60"
              />
            ))}
          </div>
        ) : null}

        <Button
          type="button"
          className="h-12 w-full gap-2 rounded-2xl text-base font-black"
          disabled={submitting}
          onClick={() => void handleConfirm()}
        >
          Confirm & Complete
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 rounded-2xl border-rose-500/30 text-rose-700 dark:text-rose-300"
          disabled={submitting}
          onClick={() => setIssueOpen(true)}
        >
          <AlertTriangle className="size-4" strokeWidth={1.75} aria-hidden />
          Report an issue
        </Button>
      </div>

      {issueOpen ? (
        <m.div
          className="border-t border-wg-border/60 bg-wg-surface-elevated/80 p-5 dark:border-white/10"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <p className="text-sm font-bold text-wg-text">What went wrong?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ISSUE_REASONS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setIssueKey(r.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  issueKey === r.key
                    ? 'bg-cyan-600 text-white'
                    : 'border border-wg-border bg-white/5 text-wg-muted dark:border-white/10'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            disabled={submitting}
            onClick={() => void handleReport()}
          >
            Submit report
          </Button>
        </m.div>
      ) : null}
    </Card>
  );
}
