import { useEffect, useRef } from 'react';

import { partnerLocationService } from '../services/trackingService';

const POST_INTERVAL_MS = 3000;

/**
 * Stream washer GPS to the API while on an active navigation phase.
 */
export function useWasherGeolocation({ enabled, bookingId }) {
  const lastPost = useRef(0);
  const watchId = useRef(null);

  useEffect(() => {
    if (!enabled || !bookingId || typeof navigator === 'undefined' || !navigator.geolocation) {
      return undefined;
    }

    const post = (coords) => {
      const now = Date.now();
      if (now - lastPost.current < POST_INTERVAL_MS) return;
      lastPost.current = now;
      void partnerLocationService
        .update({
          latitude: coords.latitude,
          longitude: coords.longitude,
          heading: coords.heading ?? null,
        })
        .catch(() => {
          /* silent — map still shows simulated path */
        });
    };

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        post({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          heading: pos.coords.heading >= 0 ? pos.coords.heading : null,
        });
      },
      () => {
        /* permission denied — simulated tracking on server */
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 },
    );

    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [enabled, bookingId]);
}
