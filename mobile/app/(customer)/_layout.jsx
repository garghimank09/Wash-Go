import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import CustomerTabBar from '../../components/customer/CustomerTabBar';
import AuthGate from '../../components/auth/AuthGate';
import { useCustomerTabBarInset } from '../../hooks/useCustomerContentPadding';

export default function CustomerLayout() {
  const { theme } = useTheme();
  const tabBarInset = useCustomerTabBarInset();

  return (
    <AuthGate>
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
