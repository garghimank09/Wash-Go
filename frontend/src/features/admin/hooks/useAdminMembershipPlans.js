import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api';
import { adminService } from '../../../services/adminService';

export function useAdminMembershipPlans() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.listMembershipPlans();
      setItems(data.items || []);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createPlan = useCallback(
    async (body) => {
      const created = await adminService.createMembershipPlan(body);
      await reload();
      return created;
    },
    [reload],
  );

  const updatePlan = useCallback(
    async (slug, body) => {
      const updated = await adminService.updateMembershipPlan(slug, body);
      await reload();
      return updated;
    },
    [reload],
  );

  const deactivatePlan = useCallback(
    async (slug) => {
      const updated = await adminService.deactivateMembershipPlan(slug);
      await reload();
      return updated;
    },
    [reload],
  );

  return { items, loading, error, reload, createPlan, updatePlan, deactivatePlan };
}
