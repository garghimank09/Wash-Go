import { useState } from 'react';
import { m } from 'framer-motion';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '../../services/api';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { Button } from '../../ui/button';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminMembershipPlanFormModal } from './components/AdminMembershipPlanFormModal';
import { AdminMembershipPlansTable } from './components/AdminMembershipPlansTable';
import { useAdminMembershipPlans } from './hooks/useAdminMembershipPlans';

export function AdminMembershipPlansView() {
  const reduced = useReducedMotion();
  const { items, loading, error, createPlan, updatePlan, deactivatePlan } = useAdminMembershipPlans();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setModalOpen(true);
  };

  const handleDeactivate = async (plan) => {
    if (!window.confirm(`Deactivate "${plan.name}"? It will disappear from the landing page.`)) return;
    try {
      await deactivatePlan(plan.slug);
      toast.success('Plan deactivated');
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
          <h1 className="wg-heading-display">Membership plans</h1>
          <p className="mt-1 max-w-2xl text-sm text-wg-muted">
            Manage landing-page membership cards — monthly price in ₹ and checklist features.
          </p>
        </div>
        <Button type="button" size="sm" className="gap-2 shrink-0" onClick={openCreate}>
          <Plus className="size-4" strokeWidth={1.75} aria-hidden />
          Add plan
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
          <p className="text-sm text-wg-muted">Loading plans…</p>
        ) : (
          <AdminMembershipPlansTable rows={items} onEdit={openEdit} onDeactivate={handleDeactivate} />
        )}
      </m.div>

      <AdminMembershipPlanFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={editing}
        onCreate={createPlan}
        onUpdate={updatePlan}
      />
    </m.div>
  );
}
