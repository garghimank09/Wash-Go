import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { canAccessAdmin } from '../lib/canAccessAdmin';

export function AdminRoute() {
  const { user } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  const allowed = canAccessAdmin(user);

  useEffect(() => {
    if (user && !allowed && !toastShown.current) {
      toastShown.current = true;
      toast.error('Admin access required.');
    }
  }, [user, allowed]);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="text-sm text-wg-muted">Loading admin console…</p>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
