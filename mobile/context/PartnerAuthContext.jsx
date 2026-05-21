import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { partnerAuthService } from '../services/partnerAuthService';
import {
  setPartnerUnauthorizedHandler,
  setLastActiveRole,
} from '../lib/partnerSessionStore';

const PartnerAuthContext = createContext(null);

export function PartnerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logoutPartner = useCallback(async () => {
    await partnerAuthService.logout();
    await setLastActiveRole(null);
    setUser(null);
  }, []);

  const bootstrap = useCallback(async () => {
    const { user: bootUser } = await partnerAuthService.bootstrap();
    setUser(bootUser);
    setInitializing(false);
    return bootUser;
  }, []);

  useEffect(() => {
    setPartnerUnauthorizedHandler(async () => {
      setUser(null);
    });
    bootstrap();
  }, [bootstrap]);

  const loginPartner = useCallback(async (email, password) => {
    const result = await partnerAuthService.login(email, password);
    setUser(result.user);
    await setLastActiveRole('partner');
    return result.user;
  }, []);

  const signupPartner = useCallback(async (payload) => {
    const result = await partnerAuthService.signup(payload);
    setUser(result.user);
    await setLastActiveRole('partner');
    return result.user;
  }, []);

  const refreshPartner = useCallback(async () => {
    try {
      const me = await partnerAuthService.me();
      setUser(me);
      return me;
    } catch {
      await logoutPartner();
      return null;
    }
  }, [logoutPartner]);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isPartnerAuthenticated: Boolean(user && user.role === 'washer'),
      loginPartner,
      signupPartner,
      logoutPartner,
      refreshPartner,
      bootstrap,
    }),
    [user, initializing, loginPartner, signupPartner, logoutPartner, refreshPartner, bootstrap],
  );

  return (
    <PartnerAuthContext.Provider value={value}>
      {children}
    </PartnerAuthContext.Provider>
  );
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext);
  if (!ctx) {
    throw new Error('usePartnerAuth must be used within PartnerAuthProvider');
  }
  return ctx;
}
