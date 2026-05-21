import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence, m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, CheckCircle, ChevronDown, MapPin, Sparkles } from 'lucide-react';

import { bookingsService } from '../../services/bookingsService';
import { carsService } from '../../services/carsService';
import { geocodeService } from '../../services/geocodeService';
import { getErrorMessage } from '../../services/api';
import { pricingService } from '../../services/pricingService';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { Button } from '../../ui/button';
import { cn } from '../../lib/cn';
import { bookingReducedVariants, bookingStepVariants } from './motion';
import { PackageStep } from './steps/PackageStep';
import { ReviewStep } from './steps/ReviewStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { VehicleStep } from './steps/VehicleStep';
import { PACKAGES } from '../../constants/config';
import { DEFAULT_CURRENCY } from '../../constants/config';
import { formatCents } from '../../utils/format';
import { BookingCarsSkeleton } from './BookingCarsSkeleton';
import { BookingSummaryPanel } from './BookingSummaryPanel';

const STEP_META = [
  { key: 'vehicle', title: 'Vehicle', subtitle: 'Which car', Icon: Car },
  { key: 'package', title: 'Package & price', subtitle: 'Tier & size', Icon: Sparkles },
  { key: 'when', title: 'Where & when', subtitle: 'Address & time', Icon: MapPin },
  { key: 'review', title: 'Review', subtitle: 'Confirm', Icon: CheckCircle },
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toLocalDateValue(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toLocalTimeValue(date) {
  const d = new Date(date);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function defaultScheduleParts(hoursAhead = 24) {
  const d = new Date();
  d.setTime(d.getTime() + hoursAhead * 3600 * 1000);
  return { date: toLocalDateValue(d), time: toLocalTimeValue(d) };
}

function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const d = new Date(`${dateStr}T${timeStr}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function StepConnector({ filled, reduced }) {
  return (
    <div
      className="relative mx-0.5 hidden min-h-[44px] min-w-[0.75rem] flex-1 items-center sm:flex"
      aria-hidden
    >
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-wg-border/80 dark:bg-white/10">
        <m.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400/95 via-cyan-400 to-indigo-500/90 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
          initial={false}
          animate={{ width: filled ? '100%' : '0%' }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 34 }}
        />
      </div>
    </div>
  );
}

export function BookingWizard() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const variants = reduced ? bookingReducedVariants : bookingStepVariants;

  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [carId, setCarId] = useState('');
  const [packageId, setPackageId] = useState('super_deluxe');
  const [vehicleSize, setVehicleSize] = useState('sedan');
  const [address, setAddress] = useState('');
  const [serviceLat, setServiceLat] = useState(null);
  const [serviceLng, setServiceLng] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(() => defaultScheduleParts(24).date);
  const [scheduledTime, setScheduledTime] = useState(() => defaultScheduleParts(24).time);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);
  const geocodeSeqRef = useRef(0);
  const [priceCents, setPriceCents] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const stepRegionRef = useRef(null);

  useEffect(() => {
    const el = stepRegionRef.current;
    if (!el) return;
    window.requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
    });
  }, [step]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await carsService.list();
        if (!cancelled) {
          setCars(list);
          if (list.length) setCarId((prev) => prev || list[0].id);
        }
      } catch {
        if (!cancelled) setCars([]);
      } finally {
        if (!cancelled) setLoadingCars(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPricingLoading(true);
      try {
        const p = await pricingService.calculate(packageId, vehicleSize);
        if (!cancelled) setPriceCents(p.estimated_price_cents);
      } catch {
        if (!cancelled) setPriceCents(null);
      } finally {
        if (!cancelled) setPricingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [packageId, vehicleSize]);

  const scheduledDateTime = useMemo(
    () => combineDateAndTime(scheduledDate, scheduledTime),
    [scheduledDate, scheduledTime],
  );

  const scheduledIso = useMemo(() => {
    if (scheduledDateTime) return scheduledDateTime.toISOString();
    return new Date(Date.now() + 86400000).toISOString();
  }, [scheduledDateTime]);

  const scheduledLabel = useMemo(
    () => (scheduledDateTime ? scheduledDateTime.toLocaleString() : '—'),
    [scheduledDateTime],
  );

  const scheduledInFuture = useMemo(
    () => scheduledDateTime != null && scheduledDateTime.getTime() > Date.now() + 60_000,
    [scheduledDateTime],
  );

  const minDate = useMemo(() => toLocalDateValue(new Date()), []);

  const minTime = useMemo(() => {
    const today = toLocalDateValue(new Date());
    if (scheduledDate !== today) return undefined;
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return toLocalTimeValue(d);
  }, [scheduledDate]);

  useEffect(() => {
    const trimmed = address.trim();
    if (trimmed.length < 5) {
      setServiceLat(null);
      setServiceLng(null);
      setGeocodeError(null);
      setGeocoding(false);
      return undefined;
    }

    const seq = ++geocodeSeqRef.current;
    const timer = window.setTimeout(async () => {
      setGeocoding(true);
      setGeocodeError(null);
      try {
        const { lat, lng, approximate } = await geocodeService.resolve(trimmed);
        if (seq !== geocodeSeqRef.current) return;
        setServiceLat(lat);
        setServiceLng(lng);
        setGeocodeError(
          approximate
            ? 'Approximate area — drag the pin to your exact spot (gate, parking, building).'
            : null,
        );
      } catch (err) {
        if (seq !== geocodeSeqRef.current) return;
        setGeocodeError(getErrorMessage(err));
        setServiceLat(null);
        setServiceLng(null);
      } finally {
        if (seq === geocodeSeqRef.current) setGeocoding(false);
      }
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [address]);

  const canNextFrom = (s) => {
    if (s === 0) return cars.length > 0 && !!carId;
    if (s === 1) return true;
    if (s === 2) {
      return (
        address.trim().length >= 5 &&
        serviceLat != null &&
        serviceLng != null &&
        !geocoding &&
        Boolean(scheduledDate && scheduledTime) &&
        scheduledInFuture
      );
    }
    return false;
  };

  const goNext = () => {
    if (step >= STEP_META.length - 1) return;
    if (!canNextFrom(step)) {
      if (step === 2) {
        if (address.trim().length < 5) toast.error('Enter a complete service address (at least 5 characters).');
        else if (geocoding) toast.error('Still locating your address on the map…');
        else if (serviceLat == null || serviceLng == null)
          toast.error('We could not place that address — refine it or set the pin on the map.');
        else if (!scheduledDate || !scheduledTime) toast.error('Choose a service date and time.');
        else if (!scheduledInFuture) toast.error('Choose a date and time in the future.');
      }
      return;
    }
    setDirection(1);
    setStep((x) => x + 1);
  };

  const goBack = () => {
    if (step <= 0) return;
    setDirection(-1);
    setStep((x) => Math.max(0, x - 1));
  };

  const submit = async () => {
    if (!carId) {
      toast.error('Add a vehicle under Cars first.');
      return;
    }
    if (address.trim().length < 5) {
      toast.error('Enter a complete service address.');
      return;
    }
    if (serviceLat == null || serviceLng == null) {
      toast.error('Set your exact location on the map.');
      return;
    }
    if (!scheduledInFuture) {
      toast.error('Scheduled time must be in the future.');
      return;
    }
    if (priceCents == null) {
      toast.error('Pricing unavailable — check API connection.');
      return;
    }
    setSubmitting(true);
    try {
      const notes = `WashGo|package:${packageId}|vehicle:${vehicleSize}`;
      const booking = await bookingsService.create({
        car_id: carId,
        washer_id: null,
        scheduled_at: scheduledIso,
        service_address: address.trim(),
        latitude: serviceLat,
        longitude: serviceLng,
        price_cents: priceCents,
        currency: DEFAULT_CURRENCY,
        notes,
      });
      toast.success('Booking confirmed — taking you to the detail.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('washgo:bookings-sync', { detail: { source: 'create' } }));
      }
      navigate(`/bookings/${booking.id}`, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const car = cars.find((c) => c.id === carId);
  const pkg = PACKAGES.find((p) => p.id === packageId);
  const progress = ((step + 1) / STEP_META.length) * 100;

  const carSummaryLabel = car ? `${car.make} ${car.model}` : '—';
  const packageSummaryLabel = pkg?.label ?? '—';

  const summaryProps = {
    carLabel: loadingCars ? 'Loading…' : carSummaryLabel,
    packageLabel: packageSummaryLabel,
    priceCents,
    pricingLoading,
    reduced,
    stepIndex: step,
    totalSteps: STEP_META.length,
  };

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden pb-32 md:pb-2">
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/25 bg-wg-surface-elevated/90 px-6 py-8 shadow-wg-card backdrop-blur-md dark:border-white/10 dark:bg-wg-surface-elevated/50 sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-gradient-to-br from-brand-from/25 via-cyan-400/10 to-brand-to/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full bg-indigo-500/15 blur-3xl dark:bg-indigo-400/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/15" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700/90 dark:text-cyan-300/90">WashGo booking</p>
          <h1 className="mt-2 wg-heading-display">Book a wash</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-wg-muted">
            Step {step + 1} of {STEP_META.length}. Estimates refresh as you adjust package and vehicle size.
          </p>
        </div>
      </div>

      <details className="group mb-6 lg:hidden">
        <summary
          className={cn(
            'flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border border-white/30 bg-[color:var(--wg-glass-bg)] px-4 py-3.5 shadow-wg-card backdrop-blur-xl',
            'dark:border-white/10',
            '[&::-webkit-details-marker]:hidden',
          )}
        >
          <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Trip summary</span>
          <span className="flex items-center gap-2 text-sm font-bold tabular-nums text-wg-text">
            {pricingLoading || priceCents == null ? '…' : formatCents(priceCents)}
            <ChevronDown className="size-4 shrink-0 text-wg-muted transition group-open:rotate-180" strokeWidth={2} aria-hidden />
          </span>
        </summary>
        <div className="mt-2 rounded-2xl border border-white/20 bg-wg-surface-elevated/60 p-4 text-sm backdrop-blur-md dark:border-white/10">
          <div className="flex justify-between gap-2 border-b border-wg-border/60 py-2 first:pt-0">
            <span className="text-wg-muted">Vehicle</span>
            <span className="font-medium text-wg-text">{loadingCars ? '…' : carSummaryLabel}</span>
          </div>
          <div className="flex justify-between gap-2 border-b border-wg-border/60 py-2">
            <span className="text-wg-muted">Package</span>
            <span className="font-medium text-wg-text">{packageSummaryLabel}</span>
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <span className="text-wg-muted">Estimate</span>
            <span className="font-semibold tabular-nums text-wg-text">
              {pricingLoading || priceCents == null ? '…' : formatCents(priceCents)}
            </span>
          </div>
        </div>
      </details>

      <div className="lg:grid lg:grid-cols-[1fr_min(340px,100%)] lg:items-start lg:gap-10">
        <div className="min-w-0">
          <div
            className="mb-5 flex w-full min-w-0 flex-nowrap items-center gap-0 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Booking steps"
          >
            {STEP_META.map((meta, i) => {
              const done = i < step;
              const active = i === step;
              const Icon = meta.Icon;
              return (
                <Fragment key={meta.key}>
                  {i > 0 ? <StepConnector filled={step >= i} reduced={reduced} /> : null}
                  <m.button
                    type="button"
                    onClick={() => {
                      if (loadingCars) return;
                      if (i < step) {
                        setDirection(-1);
                        setStep(i);
                      }
                    }}
                    disabled={loadingCars || i > step}
                    whileHover={reduced || loadingCars || i > step ? undefined : { y: -1 }}
                    whileTap={reduced || loadingCars || i > step ? undefined : { scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className={cn(
                      'flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-xs font-semibold transition-shadow sm:px-3.5 sm:text-sm',
                      active &&
                        'border-cyan-500/55 bg-gradient-to-br from-cyan-500/18 via-indigo-600/12 to-indigo-600/5 text-wg-text shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_8px_28px_rgba(6,182,212,0.18)] dark:shadow-[0_0_0_1px_rgba(34,211,238,0.2),0_12px_40px_rgba(34,211,238,0.12)]',
                      done &&
                        !active &&
                        'border-emerald-500/35 bg-emerald-500/[0.07] text-wg-muted hover:border-emerald-500/50 hover:bg-emerald-500/12',
                      !done && !active && 'cursor-not-allowed border-wg-border text-wg-muted opacity-55',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/30 dark:border-white/10 dark:bg-white/5',
                        active && 'border-cyan-400/40 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200',
                        done && !active && 'border-emerald-500/25 text-emerald-700 dark:text-emerald-300',
                      )}
                    >
                      <Icon className="size-4 opacity-90" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="hidden min-w-0 sm:inline">
                      <span className="block truncate">{meta.title}</span>
                      <span className="mt-0.5 block truncate text-[10px] font-medium uppercase tracking-wide text-wg-muted opacity-90">
                        {meta.subtitle}
                      </span>
                    </span>
                    <span className="sm:hidden">{i + 1}</span>
                  </m.button>
                </Fragment>
              );
            })}
          </div>

          <div
            className="relative mb-8 h-2.5 w-full max-w-xl overflow-hidden rounded-full bg-wg-border/90 shadow-inner dark:bg-white/10"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={STEP_META.length}
            aria-label="Booking progress"
          >
            <m.div
              layout
              className="relative h-full rounded-full bg-gradient-to-r from-brand-from via-cyan-400 to-brand-to shadow-[0_0_20px_rgba(34,211,238,0.35)]"
              style={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            />
          </div>

          {loadingCars ? (
            <BookingCarsSkeleton />
          ) : (
            <AnimatePresence mode="wait" custom={direction}>
              <m.div
                ref={stepRegionRef}
                tabIndex={-1}
                key={STEP_META[step].key}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="min-h-[200px] outline-none"
              >
                {step === 0 ? <VehicleStep cars={cars} carId={carId} setCarId={setCarId} /> : null}
                {step === 1 ? (
                  <PackageStep
                    packageId={packageId}
                    setPackageId={setPackageId}
                    vehicleSize={vehicleSize}
                    setVehicleSize={setVehicleSize}
                    priceCents={priceCents}
                    pricingLoading={pricingLoading}
                  />
                ) : null}
                {step === 2 ? (
                  <ScheduleStep
                    address={address}
                    setAddress={setAddress}
                    serviceLat={serviceLat}
                    serviceLng={serviceLng}
                    onLocationChange={({ lat, lng }) => {
                      setServiceLat(lat);
                      setServiceLng(lng);
                      setGeocodeError(null);
                    }}
                    scheduledDate={scheduledDate}
                    setScheduledDate={setScheduledDate}
                    scheduledTime={scheduledTime}
                    setScheduledTime={setScheduledTime}
                    scheduledLabel={scheduledLabel}
                    geocoding={geocoding}
                    geocodeError={geocodeError}
                    minDate={minDate}
                    minTime={minTime}
                  />
                ) : null}
                {step === 3 ? (
                  <ReviewStep
                    cars={cars}
                    carId={carId}
                    packageId={packageId}
                    vehicleSize={vehicleSize}
                    address={address}
                    serviceLat={serviceLat}
                    serviceLng={serviceLng}
                    scheduledLabel={scheduledLabel}
                    priceCents={priceCents}
                    pricingLoading={pricingLoading}
                  />
                ) : null}
              </m.div>
            </AnimatePresence>
          )}

          <div className="mt-8 hidden gap-3 md:flex">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} disabled={loadingCars}>
                Back
              </Button>
            ) : null}
            {step < STEP_META.length - 1 ? (
              <m.div whileTap={reduced || loadingCars ? undefined : { scale: 0.98 }} className="inline-block">
                <Button type="button" onClick={goNext} disabled={!canNextFrom(step) || loadingCars}>
                  Continue
                </Button>
              </m.div>
            ) : (
              <Button type="button" loading={submitting} onClick={() => void submit()} disabled={cars.length === 0 || loadingCars}>
                Confirm booking
              </Button>
            )}
          </div>
        </div>

        <aside className="mt-10 hidden lg:mt-0 lg:block">
          <div className="sticky top-24">
            <BookingSummaryPanel {...summaryProps} />
          </div>
        </aside>
      </div>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-white/20 px-4 py-3 wg-glass-surface shadow-[0_-8px_32px_rgb(0_0_0/0.08)] dark:border-white/10 dark:shadow-black/30 md:hidden',
          'pb-[max(0.85rem,env(safe-area-inset-bottom))]',
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 lg:max-w-none">
          {step > 0 ? (
            <Button type="button" variant="outline" className="min-h-[44px] flex-1 sm:flex-none" onClick={goBack} disabled={loadingCars}>
              Back
            </Button>
          ) : (
            <span className="hidden w-20 sm:block" />
          )}
          {step < STEP_META.length - 1 ? (
            <m.div whileTap={reduced || loadingCars ? undefined : { scale: 0.98 }} className="flex flex-1 sm:max-w-[200px]">
              <Button type="button" className="min-h-[44px] w-full sm:min-w-[140px]" onClick={goNext} disabled={!canNextFrom(step) || loadingCars}>
                Continue
              </Button>
            </m.div>
          ) : (
            <Button
              type="button"
              className="min-h-[44px] flex-1 sm:min-w-[180px]"
              loading={submitting}
              onClick={() => void submit()}
              disabled={cars.length === 0 || loadingCars}
            >
              Confirm booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
