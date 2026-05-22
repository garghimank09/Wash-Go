import { useCallback, useEffect, useState } from 'react';

import { membershipService } from '../services/membershipService';
import { getErrorMessage } from '../services/api';

export function useMyMembership() {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await membershipService.getMine();
      setMembership(data.membership ?? null);
    } catch (err) {
      setError(getErrorMessage(err));
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { membership, loading, error, reload, setMembership };
}
