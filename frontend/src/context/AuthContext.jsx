import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { redirectToMarketingHome } from '../lib/appPaths';
import { scheduleTokenExpiryLogout } from '../lib/authSession';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    redirectToMarketingHome();
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    authService.saveSession(data);
    const me = await authService.me();
    setUser(me);
    return me;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await authService.signup(payload);
    authService.saveSession(data);
    const me = await authService.me();
    setUser(me);
    return me;
  }, []);

  const refreshUser = useCallback(async () => {
    const token = authService.getToken();
    if (!token) return null;
    try {
      const me = await authService.me();
      setUser(me);
      return me;
    } catch {
      authService.clearSession();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const on401 = () => {
      authService.clearSession();
      setUser(null);
    };
    window.addEventListener('washgo:unauthorized', on401);

    let clearExpiryTimer = () => {};
    (async () => {
      const t = authService.getToken();
      if (!t) {
        setInitializing(false);
        return;
      }
      try {
        const me = await authService.me();
        setUser(me);
        clearExpiryTimer = scheduleTokenExpiryLogout(
          authService.getSessionStorage(),
          () => {
            authService.clearSession();
            setUser(null);
            window.dispatchEvent(new CustomEvent('washgo:session-expired'));
          },
        );
      } catch {
        authService.clearSession();
      } finally {
        setInitializing(false);
      }
    })();

    return () => {
      window.removeEventListener('washgo:unauthorized', on401);
      clearExpiryTimer();
    };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    return scheduleTokenExpiryLogout(authService.getSessionStorage(), () => {
      authService.clearSession();
      setUser(null);
      window.dispatchEvent(new CustomEvent('washgo:session-expired'));
    });
  }, [user]);

  const value = useMemo(
    () => ({ user, initializing, login, signup, logout, refreshUser }),
    [user, initializing, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
