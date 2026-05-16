import { useAuth } from '../context/AuthContext';
import { usePartnerAuth } from '../context/PartnerAuthContext';
import { useBookingSyncStream } from '../hooks/useBookingSyncStream';
import { canAccessAdmin } from '../lib/canAccessAdmin';
import { authService } from '../services/authService';
import { partnerAuthService } from '../services/partnerAuthService';

/**
 * Opens one SSE connection per authenticated shell (customer or partner).
 * Hooks listen for {@link BOOKINGS_SYNC_EVENT} and refetch booking data.
 */
function BookingSyncBridgeInner({ token, enabled }) {
  useBookingSyncStream({ token, enabled });
  return null;
}

export function CustomerBookingSyncBridge() {
  const { user } = useAuth();
  const token = user ? authService.getToken() : null;
  return <BookingSyncBridgeInner token={token} enabled={!!user} />;
}

export function PartnerBookingSyncBridge() {
  const { user } = usePartnerAuth();
  const token = user ? partnerAuthService.getToken() : null;
  return <BookingSyncBridgeInner token={token} enabled={!!user} />;
}

export function AdminBookingSyncBridge() {
  const { user } = useAuth();
  const token = user ? authService.getToken() : null;
  return <BookingSyncBridgeInner token={token} enabled={!!user && canAccessAdmin(user)} />;
}
