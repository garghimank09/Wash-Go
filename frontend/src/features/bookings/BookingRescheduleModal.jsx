import { useEffect, useState } from 'react';
import { CalendarRange } from 'lucide-react';

import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';

function toDatetimeLocalValue(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BookingRescheduleModal({ open, onClose, currentScheduledAt, onConfirm, submitting }) {
  const [value, setValue] = useState('');
  const [minStr, setMinStr] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const tid = setTimeout(() => {
      const min = toDatetimeLocalValue(new Date(Date.now() + 60 * 60 * 1000));
      setMinStr(min);
      try {
        const d = new Date(currentScheduledAt);
        const floor = new Date(Date.now() + 60 * 60 * 1000);
        setValue(!Number.isNaN(d.getTime()) && d > floor ? toDatetimeLocalValue(d) : min);
      } catch {
        setValue(min);
      }
    }, 0);
    return () => clearTimeout(tid);
  }, [open, currentScheduledAt]);

  const submit = async () => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) return;
    await onConfirm(d.toISOString());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reschedule booking"
      description="Pick a new arrival window. We will keep your vehicle, address, and package the same."
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          <Button type="button" loading={submitting} onClick={() => void submit()}>
            Save new time
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <CalendarRange className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <p className="text-sm text-wg-muted">New time must be at least one hour from now.</p>
        </div>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">New date & time</span>
          <input
            type="datetime-local"
            min={minStr || undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-2 w-full rounded-xl border border-wg-border/90 bg-wg-surface-elevated/90 px-4 py-3 text-sm text-wg-text shadow-inner transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 dark:bg-wg-surface-elevated/60"
          />
        </label>
      </div>
    </Modal>
  );
}
