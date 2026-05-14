import { useState } from 'react';
import { m } from 'framer-motion';
import { Car } from 'lucide-react';

import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { FloatingInput } from '../../ui/floating-input';
import { useReducedMotion } from '../../lib/useReducedMotion';

export function GarageAddVehicleForm({ onAdd, saving }) {
  const reduced = useReducedMotion();
  const [form, setForm] = useState({ make: '', model: '', year: '', plate: '', color: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onAdd({ ...form });
      setForm({ make: '', model: '', year: '', plate: '', color: '' });
    } catch {
      /* validation / API errors surfaced by parent */
    }
  };

  return (
    <m.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduced ? 0 : 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        variant="glass"
        className="border-cyan-500/20 bg-gradient-to-b from-cyan-500/[0.07] via-wg-surface-elevated/95 to-wg-surface-elevated/95 shadow-wg-card dark:border-cyan-500/10"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/25 to-brand-to/20 text-cyan-700 dark:text-cyan-200">
            <Car className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="wg-heading-section">Vehicle details</h2>
            <p className="mt-1 text-xs leading-relaxed text-wg-muted">
              Tell us about your car — saved securely to your WashGo account.
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={(e) => void submit(e)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FloatingInput
              label="Vehicle brand"
              name="make"
              value={form.make}
              onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
              required
              autoComplete="organization"
            />
            <FloatingInput
              label="Vehicle model"
              name="model"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              required
              autoComplete="off"
            />
            <div className="sm:col-span-2">
              <div className="max-w-full sm:max-w-[13rem]">
                <FloatingInput
                  label="Manufacturing year"
                  hint="Optional"
                  name="year"
                  inputMode="numeric"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
                <FloatingInput
                  label="Plate number"
                  name="plate"
                  value={form.plate}
                  onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
                  required
                  autoComplete="off"
                  className="sm:col-span-2"
                  spellCheck={false}
                />
            <FloatingInput
              label="Vehicle color"
              hint="Optional"
              name="color"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              autoComplete="off"
              className="sm:col-span-2"
              spellCheck={false}
            />
          </div>
          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            Save to garage
          </Button>
        </form>
      </Card>
    </m.div>
  );
}
