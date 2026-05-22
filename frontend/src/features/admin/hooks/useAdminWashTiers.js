import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getErrorMessage } from '../../../services/api';
import { adminService } from '../../../services/adminService';

export function useAdminWashTiers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.listWashTiers();
      setItems(data.items ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createTier = useCallback(
    async (body) => {
      const created = await adminService.createWashTier(body);
      toast.success(`Tier "${created.name}" created`);
      await reload();
      return created;
    },
    [reload],
  );

  const updateTier = useCallback(
    async (slug, body) => {
      const updated = await adminService.updateWashTier(slug, body);
      toast.success(`Tier "${updated.name}" updated`);
      await reload();
      return updated;
    },
    [reload],
  );

  const deactivateTier = useCallback(
    async (slug) => {
      await adminService.deactivateWashTier(slug);
      toast.success('Tier deactivated');
      await reload();
    },
    [reload],
  );

  return {
    items,
    loading,
    error,
    reload,
    createTier,
    updateTier,
    deactivateTier,
  };
}
