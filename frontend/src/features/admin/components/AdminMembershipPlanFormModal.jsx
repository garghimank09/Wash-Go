import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '../../../services/api';
import { Button } from '../../../ui/button';
import { Modal } from '../../../ui/modal';

const emptyForm = () => ({
  slug: '',
  name: '',
  description: '',
  priceRupees: '',
  washes_included: '5',
  sort_order: 0,
  is_popular: false,
  is_active: true,
  features: [''],
});

function planToForm(plan) {
  if (!plan) return emptyForm();
  return {
    slug: plan.slug,
    name: plan.name,
    description: plan.description ?? '',
    priceRupees: String((plan.price_cents ?? 0) / 100),
    washes_included: String(plan.washes_included ?? 1),
    sort_order: plan.sort_order ?? 0,
    is_popular: Boolean(plan.is_popular),
    is_active: plan.is_active !== false,
    features: plan.features?.length ? [...plan.features] : [''],
  };
}

function formToPayload(form, isEdit) {
  const features = form.features.map((f) => f.trim()).filter(Boolean);
  const price_cents = Math.round(parseFloat(form.priceRupees) * 100);
  if (!Number.isFinite(price_cents) || price_cents <= 0) {
    throw new Error('Enter a valid price in rupees');
  }
  if (!form.name.trim()) throw new Error('Plan name is required');
  if (!features.length) throw new Error('Add at least one feature');
  const washes_included = parseInt(form.washes_included, 10);
  if (!Number.isFinite(washes_included) || washes_included < 1) {
    throw new Error('Enter washes included (1 or more)');
  }

  const base = {
    name: form.name.trim(),
    description: form.description.trim() || null,
    price_cents,
    currency: 'INR',
    duration_days: 30,
    features,
    washes_included,
    sort_order: Number(form.sort_order) || 0,
    is_popular: form.is_popular,
    is_active: form.is_active,
  };

  if (isEdit) return base;
  if (!form.slug.trim()) throw new Error('Slug is required');
  return { ...base, slug: form.slug.trim().toLowerCase() };
}

export function AdminMembershipPlanFormModal({ open, onClose, plan, onCreate, onUpdate }) {
  const isEdit = Boolean(plan?.slug);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(planToForm(plan));
  }, [open, plan]);

  const setFeature = (index, value) => {
    setForm((f) => {
      const next = [...f.features];
      next[index] = value;
      return { ...f, features: next };
    });
  };

  const addFeature = () => setForm((f) => ({ ...f, features: [...f.features, ''] }));
  const removeFeature = (index) =>
    setForm((f) => ({
      ...f,
      features: f.features.length > 1 ? f.features.filter((_, i) => i !== index) : [''],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = formToPayload(form, isEdit);
      if (isEdit) await onUpdate(plan.slug, payload);
      else await onCreate(payload);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit membership plan' : 'Add membership plan'}
      description="Plans appear on the landing page with price in Indian rupees (₹/month)."
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="admin-membership-plan-form" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create plan'}
          </Button>
        </div>
      }
    >
      <form id="admin-membership-plan-form" className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Plan name</span>
            <input
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Gleam"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Slug</span>
            <input
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 font-mono text-sm text-wg-text wg-focus-ring disabled:opacity-60"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="gleam"
              disabled={isEdit}
              required={!isEdit}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Monthly price (₹)</span>
            <input
              type="number"
              min="1"
              step="1"
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
              value={form.priceRupees}
              onChange={(e) => setForm((f) => ({ ...f, priceRupees: e.target.value }))}
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Description (optional)</span>
            <input
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Washes per month</span>
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
              value={form.washes_included}
              onChange={(e) => setForm((f) => ({ ...f, washes_included: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Sort order</span>
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={form.is_popular}
              onChange={(e) => setForm((f) => ({ ...f, is_popular: e.target.checked }))}
              className="size-4 rounded border-wg-border"
            />
            <span className="text-sm font-semibold text-wg-text">Mark as Popular (highlighted card)</span>
          </label>
          {isEdit ? (
            <label className="flex items-center gap-2 pt-6 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="size-4 rounded border-wg-border"
              />
              <span className="text-sm font-semibold text-wg-text">Active (visible on landing page)</span>
            </label>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Checklist features</span>
            <Button type="button" size="sm" variant="outline" className="gap-1" onClick={addFeature}>
              <Plus className="size-3.5" aria-hidden />
              Add feature
            </Button>
          </div>
          <ul className="mt-2 space-y-2">
            {form.features.map((feat, i) => (
              <li key={i} className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
                  value={feat}
                  onChange={(e) => setFeature(i, e.target.value)}
                  placeholder="e.g. 5 washes / month"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-label="Remove feature"
                  onClick={() => removeFeature(i)}
                  disabled={form.features.length <= 1}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </Modal>
  );
}
