import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PARTNER_STATUSES } from '../constants/partnerTheme';
import {
  partnerAvailabilityService,
  statusToAvailable,
  availableToStatus,
} from '../services/partnerAvailabilityService';
import { usePartnerAuth } from './PartnerAuthContext';

const STORAGE_KEY = '@washgo_partner_status';
const DEFAULT_STATUS = 'online_accepting';

const PartnerStatusContext = createContext(null);

export function PartnerStatusProvider({ children }) {
  const { isPartnerAuthenticated } = usePartnerAuth();
  const [status, setStatusState] = useState(DEFAULT_STATUS);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [serviceArea, setServiceArea] = useState(null);
  const inFlightRef = useRef(false);

  // Hydrate the locally cached status pill first — so the UI never blanks
  // while we wait for the partner-availability network call.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw && PARTNER_STATUSES.includes(raw)) {
          setStatusState(raw);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Once signed in, reconcile with the backend availability flag.
  useEffect(() => {
    if (!isPartnerAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await partnerAvailabilityService.get();
        if (cancelled) return;
        const next = availableToStatus(!!data.is_available);
        setStatusState(next);
        setServiceArea(data.service_area || null);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
      } catch {
        /* the local cached status is good enough until network recovers */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPartnerAuthenticated]);

  const setStatus = useCallback(
    async (next) => {
      if (!PARTNER_STATUSES.includes(next)) return;
      const previous = status;
      setStatusState(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      if (!isPartnerAuthenticated || inFlightRef.current) return;
      inFlightRef.current = true;
      setSyncing(true);
      try {
        const data = await partnerAvailabilityService.setAvailable(
          statusToAvailable(next),
        );
        if (data?.service_area !== undefined) {
          setServiceArea(data.service_area || null);
        }
      } catch {
        // Roll back on failure so the UI stays honest about backend state.
        setStatusState(previous);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, previous);
        } catch {
          /* ignore */
        }
      } finally {
        inFlightRef.current = false;
        setSyncing(false);
      }
    },
    [status, isPartnerAuthenticated],
  );

  const isOnline = status === 'online_accepting' || status === 'online_busy';
  const isAccepting = status === 'online_accepting';

  const value = useMemo(
    () => ({
      status,
      setStatus,
      isOnline,
      isAccepting,
      hydrated,
      syncing,
      serviceArea,
    }),
    [status, setStatus, isOnline, isAccepting, hydrated, syncing, serviceArea],
  );

  return (
    <PartnerStatusContext.Provider value={value}>
      {children}
    </PartnerStatusContext.Provider>
  );
}

export function usePartnerStatus() {
  const ctx = useContext(PartnerStatusContext);
  if (!ctx) {
    throw new Error('usePartnerStatus must be used within PartnerStatusProvider');
  }
  return ctx;
}
