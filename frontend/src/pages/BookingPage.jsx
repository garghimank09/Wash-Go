import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Loader } from '../components/Loader';
import { bookingsService } from '../services/bookingsService';
import { carsService } from '../services/carsService';
import { getErrorMessage } from '../services/api';
import { pricingService } from '../services/pricingService';
import { PACKAGES, VEHICLE_SIZES } from '../constants/config';
import { formatCents } from '../utils/format';

const HOURS_PRESET = [3, 24, 48];

export function BookingPage() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [carId, setCarId] = useState('');
  const [packageId, setPackageId] = useState('deluxe');
  const [vehicleSize, setVehicleSize] = useState('sedan');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState(24);
  const [priceCents, setPriceCents] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const scheduledIso = useMemo(() => {
    const d = new Date();
    d.setTime(d.getTime() + Math.max(1, hours) * 3600 * 1000);
    return d.toISOString();
  }, [hours]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!carId) {
      setError('Add a vehicle under Cars first.');
      return;
    }
    if (address.trim().length < 5) {
      setError('Enter a complete service address.');
      return;
    }
    if (priceCents == null) {
      setError('Pricing unavailable — check API connection.');
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
        price_cents: priceCents,
        currency: 'USD',
        notes,
      });
      navigate(`/bookings/${booking.id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCars) return <Loader fullScreen message="Loading vehicles…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Book a wash</h1>
        <p className="text-slate-600 dark:text-slate-400">Packages call `/pricing/calculate`; submit hits `/bookings`.</p>
      </div>

      <form className="space-y-8" onSubmit={submit}>
        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vehicle</h2>
          {cars.length === 0 ? (
            <p className="mt-2 text-sm text-amber-600">No cars on file — add one from the Cars page.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {cars.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCarId(c.id)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    carId === c.id
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {c.make} {c.model}
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Wash package</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {PACKAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPackageId(p.id)}
                className={`rounded-xl border px-4 py-2 text-left text-sm font-semibold transition ${
                  packageId === p.id
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vehicle size</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {VEHICLE_SIZES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVehicleSize(v.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                  vehicleSize === v.id
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Estimated price</h2>
          {pricingLoading ? (
            <Loader />
          ) : priceCents != null ? (
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{formatCents(priceCents)}</p>
          ) : (
            <p className="mt-2 text-sm text-rose-600">Could not estimate — verify auth & API.</p>
          )}
        </Card>

        <Input label="Service address" as="textarea" value={address} onChange={(e) => setAddress(e.target.value)} />

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Schedule</h2>
          <p className="mt-1 text-xs text-slate-500">Must be in the future (server validated).</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {HOURS_PRESET.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHours(h)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                  hours === h ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                +{h}h
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm font-medium text-slate-600 dark:text-slate-300">
            Hours from now
            <input
              type="number"
              min={1}
              max={720}
              value={hours}
              onChange={(e) => setHours(Math.min(720, Math.max(1, Number(e.target.value) || 1)))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">Scheduled: {new Date(scheduledIso).toLocaleString()}</p>
        </Card>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" className="w-full sm:w-auto" loading={submitting} disabled={cars.length === 0}>
          Confirm booking
        </Button>
      </form>
    </div>
  );
}
