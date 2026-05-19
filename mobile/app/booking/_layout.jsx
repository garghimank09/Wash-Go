import { Stack } from 'expo-router';
import AuthGate from '../../components/auth/AuthGate';

export default function BookingLayout() {
  return (
    <AuthGate>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </AuthGate>
  );
}
