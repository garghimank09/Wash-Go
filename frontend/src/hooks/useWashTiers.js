import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../services/api';
import { tierToPackage, washTiersService } from '../services/washTiersService';

export function useWashTiers() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await washTiersService.list();
      const items = (data.items ?? []).map(tierToPackage);
      setTiers(items);
    } catch (err) {
      setError(getErrorMessage(err));
      setTiers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { tiers, loading, error, reload };
}
