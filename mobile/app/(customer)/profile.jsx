import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AppIcon from '../../components/customer/AppIcon';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const s = styles(theme);

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
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.content}>
        <View style={s.iconWrap}>
          <AppIcon name="person" size={40} color={theme.accent.primary} />
        </View>
        <Text style={s.title}>{user?.full_name || 'Profile'}</Text>
        {user?.email ? (
          <Text style={s.email}>{user.email}</Text>
        ) : null}
        <Text style={s.subtitle}>Account settings</Text>
        <Text style={s.body}>
          Payment methods and preferences will be available in a future update.
        </Text>
        <TouchableOpacity
          style={[s.logoutBtn, loggingOut && { opacity: 0.6 }]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator color={theme.text.primary} />
          ) : (
            <>
              <AppIcon name="logout" size={18} color={theme.customer.error} />
              <Text style={s.logoutText}>Log out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    email: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.accent.primary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    body: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 28,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: c.error + '60',
    },
    logoutText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.error,
    },
  });
};
