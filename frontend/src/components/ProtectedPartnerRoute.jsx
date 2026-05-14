import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { usePartnerAuth } from '../context/PartnerAuthContext';
import { partnerAuthService } from '../services/partnerAuthService';
import { Loader } from '../ui/loader';

/** Partner shell: requires partner JWT + hydrated `/auth/me` (washer-only enforced in {@link WasherRoute}). */
export function ProtectedPartnerRoute() {
  const { user, initializing } = usePartnerAuth();
  const location = useLocation();
  const hasToken = Boolean(partnerAuthService.getToken());

  if (!hasToken) {
    return <Navigate to="/partner/login" replace state={{ from: location.pathname }} />;
  }
  if (initializing) {
    return <Loader fullScreen message="Loading partner console…" />;
  }
  if (!user) {
    return <Navigate to="/partner/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
