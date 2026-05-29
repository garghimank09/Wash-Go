import { useEffect } from 'react';
import { useSegments } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { usePartnerAuth } from '../context/PartnerAuthContext';
import { useTheme } from '../context/ThemeContext';
import { getLastActiveRole } from '../lib/partnerSessionStore';
import { portalFromSegments } from '../lib/themePreferenceStore';

/**
 * Keeps ThemeContext aligned with the active portal and signed-in user so
 * appearance is stored per account (customer vs partner), not device-wide.
 */
export default function ThemeScopeSync() {
  const segments = useSegments();
  const segmentKey = segments.join('/');
  const { user: customerUser } = useAuth();
  const { user: partnerUser } = usePartnerAuth();
  const { setThemeScope } = useTheme();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const routePortal = portalFromSegments(segments);
      let portal = routePortal;
      let userId = null;

      if (portal === 'customer') {
        userId =
          customerUser?.id != null ? String(customerUser.id) : null;
      } else if (portal === 'partner') {
        userId = partnerUser?.id != null ? String(partnerUser.id) : null;
      } else {
        const lastRole = await getLastActiveRole();
        if (lastRole === 'partner' && partnerUser?.id != null) {
          portal = 'partner';
          userId = String(partnerUser.id);
        } else if (lastRole === 'customer' && customerUser?.id != null) {
          portal = 'customer';
          userId = String(customerUser.id);
        } else if (partnerUser?.id != null && customerUser?.id == null) {
          portal = 'partner';
          userId = String(partnerUser.id);
        } else if (customerUser?.id != null && partnerUser?.id == null) {
          portal = 'customer';
          userId = String(customerUser.id);
        } else if (partnerUser?.id != null) {
          portal = 'partner';
          userId = String(partnerUser.id);
        } else if (customerUser?.id != null) {
          portal = 'customer';
          userId = String(customerUser.id);
        }
      }

      if (!cancelled) {
        setThemeScope(portal, userId);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [segmentKey, customerUser?.id, partnerUser?.id, setThemeScope]);

  return null;
}
