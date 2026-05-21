import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { PartnerAuthProvider } from '../context/PartnerAuthContext';
import { AddVehicleProvider } from '../context/AddVehicleContext';
import { NewBookingProvider } from '../context/NewBookingContext';
import { NotificationProvider } from '../context/NotificationContext';
import { PartnerStatusProvider } from '../context/PartnerStatusContext';
import { PartnerNotificationProvider } from '../context/PartnerNotificationContext';
import { ToastProvider } from '../context/ToastContext';

function RootLayoutNav() {
  const { theme, isDark } = useTheme();

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: theme.background.primary }}
    >
      <SafeAreaProvider>
        <ToastProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen
            name="(partner)"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="add-vehicle"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="vehicle"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="new-wash"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="booking"
            options={{ animation: 'slide_from_right' }}
          />
        </Stack>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PartnerAuthProvider>
          <NotificationProvider>
            <PartnerStatusProvider>
              <PartnerNotificationProvider>
                <AddVehicleProvider>
                  <NewBookingProvider>
                    <RootLayoutNav />
                  </NewBookingProvider>
                </AddVehicleProvider>
              </PartnerNotificationProvider>
            </PartnerStatusProvider>
          </NotificationProvider>
        </PartnerAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
