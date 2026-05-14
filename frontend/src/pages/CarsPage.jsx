import { useState } from 'react';

import { GarageAddVehicleForm } from '../features/garage/GarageAddVehicleForm';
import { GarageHero } from '../features/garage/GarageHero';
import { GarageVehicleGrid } from '../features/garage/GarageVehicleGrid';
import { useBookings } from '../hooks/useBookings';
import { useCars } from '../hooks/useCars';
import { carsService } from '../services/carsService';
import { getErrorMessage } from '../services/api';

export function CarsPage() {
  const { cars, loading, error: carsError, reload } = useCars();
  const { items: bookings, loading: bookingsLoading, error: bookingsError, reload: reloadBookings } = useBookings();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const fuseError = actionError || carsError || bookingsError || '';

  const handleAdd = async (form) => {
    setActionError('');
    setSaving(true);
    try {
      const year = form.year.trim() ? parseInt(form.year, 10) : null;
      if (form.year.trim() && Number.isNaN(year)) {
        setActionError('Year must be numeric');
        throw new Error('validation');
      }
      await carsService.create({
        make: form.make.trim(),
        model: form.model.trim(),
        year,
        license_plate: form.plate.trim(),
        color: form.color.trim() || null,
      });
      await reload();
      void reloadBookings();
    } catch (e) {
      if (e?.message !== 'validation') {
        setActionError(getErrorMessage(e));
      }
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const removeCar = async (car) => {
    if (!window.confirm(`Remove ${car.make} ${car.model} (${car.license_plate}) from your garage?`)) return;
    setActionError('');
    try {
      await carsService.remove(car.id);
      await reload();
      void reloadBookings();
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6 lg:space-y-7">
      <GarageHero vehicleCount={cars.length} loading={loading} />

      {fuseError ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-800 dark:text-rose-200">
          {fuseError}
        </p>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-20">
            <GarageAddVehicleForm onAdd={handleAdd} saving={saving} />
          </div>
        </aside>

        <section className="min-w-0 lg:col-span-7 xl:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-wg-muted">Saved vehicles</h2>
              <p className="mt-1 text-xs text-wg-muted">Live data from your bookings · tap through to manage washes</p>
            </div>
          </div>
          <GarageVehicleGrid
            cars={cars}
            bookings={bookings}
            loading={loading}
            bookingsLoading={bookingsLoading}
            onRemoveCar={removeCar}
          />
        </section>
      </div>
    </div>
  );
}
