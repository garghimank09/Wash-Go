import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '../../../services/api';
import { Button } from '../../../ui/button';
import { Modal } from '../../../ui/modal';

const ICON_OPTIONS = [
  { value: 'droplets', label: 'Droplets' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'star', label: 'Star' },
  { value: 'crown', label: 'Crown' },
];

const BADGE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'Popular', label: 'Popular' },
  { value: 'Best value', label: 'Best value' },
];

const emptyForm = () => ({
  slug: '',
  name: '',
  description: '',
  priceRupees: '',
  badge: '',
  icon: 'sparkles',
  sort_order: 0,
  is_active: true,
  features: [''],
});

function tierToForm(tier) {
  if (!tier) return emptyForm();
  return {
    slug: tier.slug,
    name: tier.name,
    description: tier.description ?? '',
    priceRupees: String((tier.price_cents ?? 0) / 100),
    badge: tier.badge ?? '',
    icon: tier.icon ?? 'sparkles',
    sort_order: tier.sort_order ?? 0,
    is_active: tier.is_active !== false,
    features: tier.features?.length ? [...tier.features] : [''],
  };
}

function formToPayload(form, isEdit) {
  const features = form.features.map((f) => f.trim()).filter(Boolean);
  const price_cents = Math.round(parseFloat(form.priceRupees) * 100);
  if (!Number.isFinite(price_cents) || price_cents <= 0) {
    throw new Error('Enter a valid price in rupees');
  }
  if (!form.name.trim()) throw new Error('Tier name is required');
  if (!features.length) throw new Error('Add at least one feature');

  const base = {
    name: form.name.trim(),
    description: form.description.trim() || null,
    price_cents,
    features,
    badge: form.badge || null,
    icon: form.icon,
    sort_order: Number(form.sort_order) || 0,
    is_active: form.is_active,
  };

  if (isEdit) return base;
  if (!form.slug.trim()) throw new Error('Slug is required');
  return { ...base, slug: form.slug.trim().toLowerCase() };
}

export function AdminWashTierFormModal({ open, onClose, tier, onCreate, onUpdate }) {
  const isEdit = Boolean(tier?.slug);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(tierToForm(tier));
  }, [open, tier]);

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
      if (isEdit) await onUpdate(tier.slug, payload);
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
      title={isEdit ? 'Edit wash tier' : 'Add wash tier'}
      description="Plans appear on the customer booking flow with checklist features."
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="admin-wash-tier-form" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create tier'}
          </Button>
        </div>
      }
    >
      <form id="admin-wash-tier-form" className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Tier name</span>
            <input
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Super Deluxe"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Slug</span>
            <input
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 font-mono text-sm text-wg-text wg-focus-ring disabled:opacity-60"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="super_deluxe"
              disabled={isEdit}
              required={!isEdit}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Base price (₹)</span>
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
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Description</span>
            <input
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short subtitle under tier name"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Icon</span>
            <select
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            >
              {ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Badge</span>
            <select
              className="mt-1 w-full rounded-xl border border-wg-border bg-wg-surface px-3 py-2 text-sm text-wg-text wg-focus-ring"
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
            >
              {BADGE_OPTIONS.map((o) => (
                <option key={o.value || 'none'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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
          {isEdit ? (
            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="size-4 rounded border-wg-border"
              />
              <span className="text-sm font-semibold text-wg-text">Active (visible to customers)</span>
            </label>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-wg-muted">Included features</span>
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
                  placeholder="e.g. Interior vacuum"
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
