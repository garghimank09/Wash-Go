import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import CustomerTabBar from '../../components/customer/CustomerTabBar';
import AuthGate from '../../components/auth/AuthGate';
import CustomerBookingSyncBridge from '../../components/customer/CustomerBookingSyncBridge';
import RealtimeBanner from '../../components/notifications/RealtimeBanner';
import { useCustomerTabBarInset } from '../../hooks/useCustomerContentPadding';

export default function CustomerLayout() {
  const { theme } = useTheme();
  const tabBarInset = useCustomerTabBarInset();

  return (
    <AuthGate>
      <CustomerBookingSyncBridge />
      <RealtimeBanner />
      <View style={{ flex: 1, backgroundColor: theme.customer.surface }}>
        <View style={{ flex: 1, paddingBottom: tabBarInset }}>
          <Tabs
            tabBar={() => null}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
            <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
            <Tabs.Screen name="garage" options={{ title: 'Garage' }} />
            <Tabs.Screen name="rewards" options={{ title: 'Rewards' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
          </Tabs>
        </View>
        <CustomerTabBar />
      </View>
    </AuthGate>
  );
}
