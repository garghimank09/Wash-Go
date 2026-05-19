import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { AddVehicleProvider } from '../context/AddVehicleContext';
import { NewBookingProvider } from '../context/NewBookingContext';
import { NotificationProvider } from '../context/NotificationContext';

function RootLayoutNav() {
  const { theme, isDark } = useTheme();

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: theme.background.primary }}
    >
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AddVehicleProvider>
            <NewBookingProvider>
              <RootLayoutNav />
            </NewBookingProvider>
          </AddVehicleProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
