import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/** Keeps customer + booking wizard surfaces off washer accounts (partner app is separate). */
export function CustomerShellRoute() {
  const { user } = useAuth();
  if (user?.role === 'washer') {
    return <Navigate to="/partner" replace />;
  }
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
