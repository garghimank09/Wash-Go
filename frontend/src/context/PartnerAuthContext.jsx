import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Outlet } from 'react-router-dom';

import { redirectToMarketingHome } from '../lib/appPaths';
import { partnerAuthService } from '../services/partnerAuthService';

const PartnerAuthContext = createContext(null);

function usePartnerAuthState() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(() => Boolean(partnerAuthService.getToken()));

  const logoutPartner = useCallback(() => {
    partnerAuthService.setToken(null);
    setUser(null);
    redirectToMarketingHome();
  }, []);

  const loginPartner = useCallback(async (email, password, otpCode) => {
    const data = await partnerAuthService.login(email, password, otpCode);
    partnerAuthService.setToken(data.access_token);
    const me = await partnerAuthService.me();
    if (me.role !== 'washer') {
      partnerAuthService.setToken(null);
      setUser(null);
      const err = new Error('PARTNER_ROLE');
      throw err;
    }
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    const on401 = () => {
      partnerAuthService.setToken(null);
      setUser(null);
    };
    window.addEventListener('washgo:partner-unauthorized', on401);
    return () => window.removeEventListener('washgo:partner-unauthorized', on401);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = partnerAuthService.getToken();
    if (!token) {
      return undefined;
    }
    (async () => {
      try {
        const me = await partnerAuthService.me();
        if (!cancelled) {
          if (me.role !== 'washer') {
            partnerAuthService.setToken(null);
            setUser(null);
          } else {
            setUser(me);
          }
        }
      } catch {
        if (!cancelled) {
          partnerAuthService.setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signupPartner = useCallback(async (payload) => {
    const data = await partnerAuthService.signup(payload);
    partnerAuthService.setToken(data.access_token);
    const me = await partnerAuthService.me();
    if (me.role !== 'washer') {
      partnerAuthService.setToken(null);
      setUser(null);
      throw new Error('PARTNER_ROLE');
    }
    setUser(me);
    return me;
  }, []);

  return useMemo(
    () => ({
      user,
      initializing,
      loginPartner,
      logoutPartner,
      signupPartner,
    }),
    [user, initializing, loginPartner, logoutPartner, signupPartner],
  );
}

/** Wraps all `/partner/*` routes (login + protected shell). */
export function PartnerAuthProvider() {
  const value = usePartnerAuthState();
  return (
    <PartnerAuthContext.Provider value={value}>
      <Outlet />
    </PartnerAuthContext.Provider>
  );
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext);
  if (!ctx) throw new Error('usePartnerAuth must be used within PartnerAuthProvider');
  return ctx;
}
