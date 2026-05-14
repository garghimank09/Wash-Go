import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

import { usePartnerAuth } from '../context/PartnerAuthContext';

/** Partner shell: only washer role (partner JWT). Customer tokens never reach this tree. */
export function WasherRoute() {
  const { user, logoutPartner } = usePartnerAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  const allowed = user?.role === 'washer';

  useEffect(() => {
    if (user && !allowed && !toastShown.current) {
      toastShown.current = true;
      toast.error('Partner dashboard is for washer accounts only.');
      logoutPartner();
    }
  }, [user, allowed, logoutPartner]);

  if (!user) {
    return <Navigate to="/partner/login" replace />;
  }

  if (!allowed) {
    return <Navigate to="/partner/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
