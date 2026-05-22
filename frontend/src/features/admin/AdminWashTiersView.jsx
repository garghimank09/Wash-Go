import { useState } from 'react';
import { m } from 'framer-motion';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '../../services/api';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { Button } from '../../ui/button';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminWashTierFormModal } from './components/AdminWashTierFormModal';
import { AdminWashTiersTable } from './components/AdminWashTiersTable';
import { useAdminWashTiers } from './hooks/useAdminWashTiers';

export function AdminWashTiersView() {
  const reduced = useReducedMotion();
  const { items, loading, error, createTier, updateTier, deactivateTier } = useAdminWashTiers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (tier) => {
    setEditing(tier);
    setModalOpen(true);
  };

  const handleDeactivate = async (tier) => {
    if (!window.confirm(`Deactivate "${tier.name}"? Customers will no longer see this tier.`)) return;
    try {
      await deactivateTier(tier.slug);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <m.div
      className="space-y-6 lg:space-y-8"
      variants={adminSectionContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={adminSectionItem(reduced)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="wg-heading-display">Wash tier plans</h1>
          <p className="mt-1 max-w-2xl text-sm text-wg-muted">
            Manage packages, pricing, and feature checklists shown on the customer booking flow.
          </p>
        </div>
        <Button type="button" size="sm" className="gap-2 shrink-0" onClick={openCreate}>
          <Plus className="size-4" strokeWidth={1.75} aria-hidden />
          Add tier
        </Button>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminDataNotice />
      </m.div>

      {error ? (
        <m.p variants={adminSectionItem(reduced)} className="text-sm text-rose-600">
          {error}
        </m.p>
      ) : null}

      <m.div variants={adminSectionItem(reduced)}>
        {loading ? (
          <p className="text-sm text-wg-muted">Loading tiers…</p>
        ) : (
          <AdminWashTiersTable rows={items} onEdit={openEdit} onDeactivate={handleDeactivate} />
        )}
      </m.div>

      <AdminWashTierFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tier={editing}
        onCreate={createTier}
        onUpdate={updateTier}
      />
    </m.div>
  );
}
