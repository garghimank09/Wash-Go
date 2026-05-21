import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from '../../components/customer/AppIcon';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const router = useRouter();
  const c = theme.customer;
  const s = styles(theme);

  return (
    <SafeAreaView style={s.safe}>
      <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
        <AppIcon name="arrow-back" size={22} color={theme.text.primary} />
      </Pressable>

      <View style={s.center}>
        <View style={s.iconWrap}>
          <AppIcon name="lock-outline" size={32} color={theme.accent.primary} />
        </View>
        <Text style={s.title}>Password reset</Text>
        <Text style={s.body}>
          Password reset is coming soon. If you need help accessing your account,
          please contact support.
        </Text>
        <CustomerPrimaryButton
          label="Back to sign in"
          onPress={() => router.replace('/(auth)/login')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.surface,
      paddingHorizontal: 24,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 10,
      letterSpacing: -0.3,
    },
    body: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 28,
      maxWidth: 300,
    },
    primaryBtn: {
      backgroundColor: theme.accent.primary,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: theme.radius.full,
    },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
  });
};
