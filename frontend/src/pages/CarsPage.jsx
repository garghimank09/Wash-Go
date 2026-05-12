import { useEffect, useState } from 'react';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Loader } from '../components/Loader';
import { carsService } from '../services/carsService';
import { getErrorMessage } from '../services/api';

export function CarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ make: '', model: '', year: '', plate: '', color: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await carsService.list();
      setCars(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const addCar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const year = form.year.trim() ? parseInt(form.year, 10) : null;
      if (form.year.trim() && Number.isNaN(year)) {
        setError('Year must be numeric');
        setSaving(false);
        return;
      }
      await carsService.create({
        make: form.make.trim(),
        model: form.model.trim(),
        year,
        license_plate: form.plate.trim(),
        color: form.color.trim() || null,
      });
      setForm({ make: '', model: '', year: '', plate: '', color: '' });
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (car) => {
    if (!window.confirm(`Remove ${car.make} ${car.model} (${car.license_plate})?`)) return;
    try {
      await carsService.remove(car.id);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Cars</h1>
        <p className="text-slate-600 dark:text-slate-400">Synced with `GET/POST/DELETE /cars`.</p>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add vehicle</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={addCar}>
          <Input label="Make" value={form.make} onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))} required />
          <Input label="Model" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} required />
          <Input label="Year" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
          <Input label="License plate" value={form.plate} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))} required />
          <Input
            className="md:col-span-2"
            label="Color (optional)"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
          />
          <div className="md:col-span-2">
            <Button type="submit" loading={saving}>
              Save car
            </Button>
          </div>
        </form>
      </Card>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {loading ? (
        <Loader />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cars.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {c.make} {c.model}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {c.license_plate}
                    {c.year ? ` · ${c.year}` : ''}
                    {c.color ? ` · ${c.color}` : ''}
                  </p>
                </div>
                <Button type="button" variant="danger" size="sm" onClick={() => remove(c)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
