import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(() => {
    authService.setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    authService.setToken(data.access_token);
    const me = await authService.me();
    setUser(me);
    return me;
  }, []);

  const signup = useCallback(
    async (payload) => {
      await authService.signup(payload);
      return await login(payload.email, payload.password);
    },
    [login],
  );

  useEffect(() => {
    const on401 = () => {
      authService.setToken(null);
      setUser(null);
    };
    window.addEventListener('washgo:unauthorized', on401);
    (async () => {
      const t = authService.getToken();
      if (!t) {
        setInitializing(false);
        return;
      }
      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        authService.setToken(null);
      } finally {
        setInitializing(false);
      }
    })();
    return () => window.removeEventListener('washgo:unauthorized', on401);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, signup, logout }),
    [user, initializing, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
