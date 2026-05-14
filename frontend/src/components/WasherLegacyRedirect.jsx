import { Navigate, useLocation } from 'react-router-dom';

/** Maps legacy `/washer/*` URLs to `/partner/*` after the partner shell migration. */
export function WasherLegacyRedirect() {
  const location = useLocation();
  const next = location.pathname.replace(/^\/washer(\/|$)/, '/partner$1') || '/partner';
  const search = location.search || '';
  const hash = location.hash || '';
  return <Navigate to={`${next}${search}${hash}`} replace />;
}
