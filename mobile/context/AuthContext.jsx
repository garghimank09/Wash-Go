import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService } from '../services/authService';
import { setUnauthorizedHandler } from '../lib/sessionStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const bootstrap = useCallback(async () => {
    const { user: bootUser } = await authService.bootstrap();
    if (bootUser?.role === 'customer') {
      setUser(bootUser);
    } else if (bootUser) {
      // Washer/admin tokens from a previous session — clear until partner app exists
      await authService.logout();
      setUser(null);
    } else {
      setUser(null);
    }
    setInitializing(false);
    return bootUser;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      setUser(null);
    });
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email, password) => {
    const result = await authService.customerLogin(email, password);
    setUser(result.user);
    return result.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const result = await authService.signup(payload);
    setUser(result.user);
    return result.user;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.getUser();
      setUser(me);
      return me;
    } catch {
      await logout();
      return null;
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user && user.role === 'customer'),
      isCustomer: user?.role === 'customer',
      login,
      signup,
      logout,
      refreshUser,
      bootstrap,
    }),
    [user, initializing, login, signup, logout, refreshUser, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
