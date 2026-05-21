import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import CustomerScreen from '../../components/customer/ui/CustomerScreen';
import CustomerCard from '../../components/customer/ui/CustomerCard';
import CustomerGhostButton from '../../components/customer/ui/CustomerGhostButton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import AppIcon from '../../components/customer/AppIcon';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/(auth)/welcome');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <CustomerScreen edges={['top']} contentStyle={styles.content}>
      <CustomerCard style={styles.heroCard} padding={20}>
        <View style={[styles.avatar, { backgroundColor: theme.customer.primaryBg }]}>
          <AppIcon name="person" size={36} color={theme.accent.primary} />
        </View>
        <Text style={[styles.name, { color: theme.text.primary }]}>
          {user?.full_name || 'Profile'}
        </Text>
        {user?.email ? (
          <Text style={[styles.email, { color: theme.text.secondary }]}>{user.email}</Text>
        ) : null}
        <Text style={[styles.hint, { color: theme.text.muted }]}>
          Payment methods and preferences will be available in a future update.
        </Text>
      </CustomerCard>

      <CustomerGhostButton
        label={loggingOut ? 'Signing out…' : 'Sign out'}
        onPress={handleLogout}
        disabled={loggingOut}
        style={styles.logout}
      />
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: CUSTOMER_LAYOUT.screenPadding,
    paddingTop: 16,
    gap: 16,
  },
  heroCard: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },
  logout: {
    marginTop: 8,
  },
});
