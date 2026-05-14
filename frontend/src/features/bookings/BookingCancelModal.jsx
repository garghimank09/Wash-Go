import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';
import { CANCEL_REASON_OPTIONS } from './cancelReasons';
import { cn } from '../../lib/cn';

export function BookingCancelModal({ open, onClose, onConfirm, submitting, onReschedule }) {
  const [reasonKey, setReasonKey] = useState('change_of_plans');
  const [detail, setDetail] = useState('');

  const handleConfirm = async () => {
    const trimmed = detail.trim();
    if (reasonKey === 'other' && trimmed.length < 3) {
      toast.error('Add a few words so we can route feedback correctly.');
      return;
    }
    await onConfirm({
      reason_key: reasonKey,
      reason_detail: reasonKey === 'other' ? trimmed : null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel this wash?"
      description="We will release your slot and notify the routing desk. You can always book again when plans settle."
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Keep booking
          </Button>
          <Button type="button" variant="danger" loading={submitting} onClick={() => void handleConfirm()}>
            Confirm cancellation
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 via-wg-surface-elevated/80 to-indigo-500/8 p-4 dark:border-cyan-500/15">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/50 text-cyan-700 dark:bg-white/10 dark:text-cyan-200">
              <CalendarClock className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-wg-text">Reschedule instead?</p>
              <p className="mt-1 text-xs leading-relaxed text-wg-muted">
                If timing shifted, moving the visit keeps your place in line and preserves washer context — like Uber
                or Urban Company reschedules.
              </p>
              <Button type="button" size="sm" className="mt-3" onClick={() => onReschedule?.()}>
                Reschedule booking
              </Button>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">Cancellation reason</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {CANCEL_REASON_OPTIONS.map((opt) => {
              const selected = reasonKey === opt.key;
              return (
                <li key={opt.key}>
                  <button
                    type="button"
                    onClick={() => setReasonKey(opt.key)}
                    className={cn(
                      'w-full rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition',
                      selected
                        ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-950 shadow-sm dark:border-cyan-400/40 dark:bg-cyan-500/15 dark:text-cyan-50'
                        : 'border-wg-border/80 bg-wg-surface/50 text-wg-text hover:border-cyan-500/30 dark:border-white/10 dark:bg-white/[0.04]',
                    )}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {reasonKey === 'other' ? (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Tell us more</span>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-wg-border/90 bg-wg-surface-elevated/90 px-4 py-3 text-sm text-wg-text shadow-inner transition placeholder:text-wg-muted focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 dark:bg-wg-surface-elevated/60"
              placeholder="A few words help us improve routing and pricing."
            />
          </label>
        ) : null}
      </div>
    </Modal>
  );
}
