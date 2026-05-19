import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from '../../components/customer/AppIcon';

export default function RewardsScreen() {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.content}>
        <View style={s.iconWrap}>
          <AppIcon name="card-giftcard" size={40} color={theme.accent.primary} />
        </View>
        <Text style={s.title}>Rewards</Text>
        <Text style={s.subtitle}>Coming soon</Text>
        <Text style={s.body}>
          Earn points on every wash and redeem exclusive perks.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.customer.surface },
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
      backgroundColor: theme.customer.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.accent.primary,
      marginBottom: 12,
    },
    body: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
