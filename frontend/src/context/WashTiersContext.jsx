import { createContext, useContext, useMemo } from 'react';

import { useWashTiers } from '../hooks/useWashTiers';

const WashTiersContext = createContext(null);

export function WashTiersProvider({ children }) {
  const value = useWashTiers();
  const memo = useMemo(() => value, [value.tiers, value.loading, value.error, value.reload]);
  return <WashTiersContext.Provider value={memo}>{children}</WashTiersContext.Provider>;
}

export function useWashTiersContext() {
  const ctx = useContext(WashTiersContext);
  if (!ctx) {
    throw new Error('useWashTiersContext must be used within WashTiersProvider');
  }
  return ctx;
}

/** Safe outside provider — returns empty tiers. */
export function useWashTiersOptional() {
  const ctx = useContext(WashTiersContext);
  return ctx ?? { tiers: [], loading: false, error: '', reload: async () => {} };
}
