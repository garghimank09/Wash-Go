import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authApi, LoginPayload, SignupPayload } from '../services/authApi';
import { getStoredToken, setStoredToken } from '../services/authStorage';
import type { User } from '../types/api';

type AuthContextValue = {
  user: User | null;
  bootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data } = await authApi.me();
    setUser(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getStoredToken();
        if (token && !cancelled) await refreshUser();
      } catch {
        await setStoredToken(null);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await authApi.login(payload);
    await setStoredToken(data.access_token);
    await refreshUser();
  }, [refreshUser]);

  const signup = useCallback(
    async (payload: SignupPayload) => {
      await authApi.signup(payload);
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(async () => {
    await setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, bootstrapping, login, signup, logout, refreshUser }),
    [user, bootstrapping, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
