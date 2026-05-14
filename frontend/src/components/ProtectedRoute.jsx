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
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
