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
import { scheduleTokenExpiryLogout } from '../lib/authSession';
import { loginViaPartnerPortal } from '../lib/partnerLoginFlow';
import { partnerAuthService } from '../services/partnerAuthService';

const PartnerAuthContext = createContext(null);

function usePartnerAuthState() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logoutPartner = useCallback(() => {
    partnerAuthService.clearSession();
    setUser(null);
    redirectToMarketingHome();
  }, []);

  const loginPartner = useCallback(async (email, password, otpCode) => {
    if (otpCode) {
      const data = await partnerAuthService.login(email, password, otpCode);
      partnerAuthService.saveSession(data);
      const me = await partnerAuthService.me();
      if (me.role === 'admin') {
        partnerAuthService.clearSession();
        const err = new Error('ADMIN_ROLE');
        err.user = me;
        throw err;
      }
      if (me.role !== 'washer') {
        partnerAuthService.clearSession();
        setUser(null);
        throw new Error('PARTNER_ROLE');
      }
      setUser(me);
      return me;
    }

    const result = await loginViaPartnerPortal(email, password);
    if (result.kind === 'admin') {
      const err = new Error('ADMIN_ROLE');
      err.user = result.user;
      throw err;
    }
    setUser(result.user);
    return result.user;
  }, []);

  useEffect(() => {
    const on401 = () => {
      partnerAuthService.clearSession();
      setUser(null);
    };
    window.addEventListener('washgo:partner-unauthorized', on401);
    return () => window.removeEventListener('washgo:partner-unauthorized', on401);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let clearExpiryTimer = () => {};
    const token = partnerAuthService.getToken();
    if (!token) {
      setInitializing(false);
      return undefined;
    }
    (async () => {
      try {
        const me = await partnerAuthService.me();
        if (!cancelled) {
          if (me.role !== 'washer') {
            partnerAuthService.clearSession();
            setUser(null);
          } else {
            setUser(me);
            clearExpiryTimer = scheduleTokenExpiryLogout(
              partnerAuthService.getSessionStorage(),
              () => {
                partnerAuthService.clearSession();
                setUser(null);
                window.dispatchEvent(new CustomEvent('washgo:partner-session-expired'));
              },
            );
          }
        }
      } catch {
        if (!cancelled) {
          partnerAuthService.clearSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
      clearExpiryTimer();
    };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    return scheduleTokenExpiryLogout(partnerAuthService.getSessionStorage(), () => {
      partnerAuthService.clearSession();
      setUser(null);
      window.dispatchEvent(new CustomEvent('washgo:partner-session-expired'));
    });
  }, [user]);

  const signupPartner = useCallback(async (payload) => {
    const data = await partnerAuthService.signup(payload);
    partnerAuthService.saveSession(data);
    const me = await partnerAuthService.me();
    if (me.role !== 'washer') {
      partnerAuthService.clearSession();
      setUser(null);
      throw new Error('PARTNER_ROLE');
    }
    setUser(me);
    return me;
  }, []);

  const refreshPartner = useCallback(async () => {
    const token = partnerAuthService.getToken();
    if (!token) return null;
    try {
      const me = await partnerAuthService.me();
      if (me.role !== 'washer') {
        partnerAuthService.clearSession();
        setUser(null);
        return null;
      }
      setUser(me);
      return me;
    } catch {
      partnerAuthService.clearSession();
      setUser(null);
      return null;
    }
  }, []);

  return useMemo(
    () => ({
      user,
      initializing,
      loginPartner,
      logoutPartner,
      signupPartner,
      refreshPartner,
    }),
    [user, initializing, loginPartner, logoutPartner, signupPartner, refreshPartner],
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
