import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Loader } from '../ui/loader';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <Loader fullScreen message="Loading your garage…" />;
  }
  if (!user) {
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
