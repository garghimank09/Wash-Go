import { CalendarClock, Clock, Loader2, MapPin } from 'lucide-react';

import { ServiceLocationPicker } from '../../../components/ServiceLocationPicker';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { cn } from '../../../lib/cn';

const scheduleFieldClass = cn(
  'mt-1.5 w-full rounded-xl border border-wg-border bg-wg-surface-elevated/90 px-4 py-2.5 text-wg-text shadow-inner backdrop-blur-sm',
  'focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30',
  '[color-scheme:light] dark:[color-scheme:dark]',
);

export function ScheduleStep({
  address,
  setAddress,
  serviceLat,
  serviceLng,
  onLocationChange,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  scheduledLabel,
  geocoding,
  geocodeError,
  minDate,
  minTime,
}) {
  const hasPin = serviceLat != null && serviceLng != null;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/20 to-brand-to/15 text-cyan-700 dark:text-cyan-300">
          <MapPin className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-wg-text">Where & when</h2>
          <p className="mt-1 text-sm leading-relaxed text-wg-muted">
            Enter your address — we locate it on the map automatically. Then choose your service date and time.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Input label="Service address" as="textarea" value={address} onChange={(e) => setAddress(e.target.value)} />
        {geocoding ? (
          <p className="flex items-center gap-2 text-xs font-medium text-cyan-700 dark:text-cyan-300">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Locating address on map…
          </p>
        ) : null}
        {geocodeError && !geocoding ? (
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{geocodeError}</p>
        ) : null}
        {hasPin && !geocoding && !geocodeError ? (
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Location found — drag the pin to refine your exact spot.
          </p>
        ) : null}
      </div>

      <ServiceLocationPicker lat={serviceLat} lng={serviceLng} onChange={onLocationChange} />

      <Card variant="glass" className="border-white/35 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4 dark:border-white/5">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-wg-muted">
              <Clock className="size-3.5" strokeWidth={2} aria-hidden />
              Schedule
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-wg-muted">Must be in the future (validated on the server).</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-900 dark:text-indigo-100">
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
            Date & time
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-wg-muted">
            Date
            <input
              type="date"
              min={minDate}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className={scheduleFieldClass}
            />
          </label>
          <label className="block text-sm font-medium text-wg-muted">
            Time
            <input
              type="time"
              min={minTime}
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className={scheduleFieldClass}
            />
          </label>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/20 bg-gradient-to-r from-cyan-500/8 via-transparent to-indigo-500/10 p-3.5 dark:border-white/10">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/50 dark:bg-white/10">
            <MapPin className="size-4 text-cyan-700 dark:text-cyan-300" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Arrival window</p>
            <p className="mt-0.5 text-sm font-semibold leading-snug text-wg-text">{scheduledLabel}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
