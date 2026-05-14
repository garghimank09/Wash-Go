import { useEffect } from 'react';

import { trySpawnLiveDispatchOffer } from '../features/washer/mock/liveDispatchSimulation';

/**
 * Periodically spawns expiring live offers while partner is online — demo dispatch pressure.
 * @param {boolean} online
 */
export function useLiveDispatchSimulation(online) {
  useEffect(() => {
    if (!online) return undefined;

    const burst = () => {
      trySpawnLiveDispatchOffer({ online });
    };
    const t0 = setTimeout(burst, 5200 + Math.random() * 3600);

    const id = setInterval(() => {
      trySpawnLiveDispatchOffer({ online });
    }, 22000 + Math.floor(Math.random() * 18000));

    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, [online]);
}
