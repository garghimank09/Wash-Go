import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerAuth } from '../../context/PartnerAuthContext';

/**
 * Guards every screen under `app/(partner)/`. While the partner session is
 * still bootstrapping we render a blank brand-coloured surface (no flash of
 * the protected UI). Unauthenticated users are bounced to partner login.
 */
export default function PartnerAuthGate({ children }) {
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const { initializing, isPartnerAuthenticated } = usePartnerAuth();

  useEffect(() => {
    if (initializing) return;
    if (!isPartnerAuthenticated) {
      const insidePartner = Array.isArray(segments)
        && segments[0] === '(partner)';
      if (insidePartner) {
        router.replace('/(auth)/partner-login');
      }
    }
  }, [initializing, isPartnerAuthenticated, router, segments]);

  if (initializing || !isPartnerAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.customer.surface }} />
    );
  }

  return children;
}
