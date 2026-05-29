import { View } from 'react-native';
import { Slot, useSegments } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import PartnerTabBar from '../../components/partner/PartnerTabBar';
import PartnerAuthGate from '../../components/partner/PartnerAuthGate';
import { usePartnerTabBarInset } from '../../hooks/usePartnerContentPadding';
import { usePartnerBookingSync } from '../../hooks/usePartnerBookingSync';
import { PartnerEarningsProvider } from '../../context/PartnerEarningsContext';

function PartnerShell({ children }) {
  // Single source of truth for booking-sync polling — lives at the layout so
  // every partner screen sees the same fingerprint without duplicate timers.
  usePartnerBookingSync();
  return children;
}

export default function PartnerLayout() {
  const { theme } = useTheme();
  const tabBarInset = usePartnerTabBarInset();
  const segments = useSegments();
  // Hide the floating tab bar while a partner job is active so the
  // FloatingActionFooter owns the bottom area without contention.
  const hideTabBar = Array.isArray(segments) && segments.some((s) => s === 'job');

  return (
    <PartnerAuthGate>
      <PartnerEarningsProvider>
        <PartnerShell>
          <View style={{ flex: 1, backgroundColor: theme.customer.surface }}>
            <View style={{ flex: 1, paddingBottom: hideTabBar ? 0 : tabBarInset }}>
              <Slot />
            </View>
            {!hideTabBar ? <PartnerTabBar /> : null}
          </View>
        </PartnerShell>
      </PartnerEarningsProvider>
    </PartnerAuthGate>
  );
}
