import { useCallback, useEffect, useState } from 'react';

import { membershipPlansService } from '../services/membershipPlansService';
import { getErrorMessage } from '../services/api';

export function useMembershipPlans() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await membershipPlansService.list();
      setItems(data.items || []);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, loading, error, reload };
}
