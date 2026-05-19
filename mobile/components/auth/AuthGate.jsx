import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function AuthGate({ children }) {
  const { user, initializing, isAuthenticated } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (initializing) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    }
  }, [initializing, isAuthenticated, router]);

  if (initializing) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: theme.customer.surface },
        ]}
      >
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </View>
    );
  }

  if (!user || user.role !== 'customer') {
    return null;
  }

  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
