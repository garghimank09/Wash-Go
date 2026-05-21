import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import { formatPriceCents } from '../../services/bookingService';
import { getPackage } from '../../services/pricingService';
import AppIcon from '../../components/customer/AppIcon';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import CustomerGhostButton from '../../components/customer/ui/CustomerGhostButton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import { formatScheduledLabel } from '../../components/customer/DateTimeField';

export default function NewWashSuccess() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { form, reset } = useNewBooking();
  const snapshot = useRef({ ...form });
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const s = styles(theme);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 280,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkOpacity, contentOpacity]);

  const data = snapshot.current;
  const pkg = getPackage(data.packageId);

  const handleTrack = () => {
    reset();
    if (id) router.replace(`/booking/${id}`);
    else router.replace('/(customer)/bookings');
  };

  const handleHome = () => {
    reset();
    router.replace('/(customer)/dashboard');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.center}>
        <Animated.View
          style={[
            s.checkCircle,
            { opacity: checkOpacity },
          ]}
        >
          <AppIcon name="check" size={44} color={theme.button.primary.text} />
        </Animated.View>

        <Animated.View
          style={{ opacity: contentOpacity, alignItems: 'center', marginTop: 22 }}
        >
          <Text style={s.title}>Booking confirmed</Text>
          <Text style={s.subtitle}>
            We are finding the best washer for your booking.
          </Text>

          <View style={s.summary}>
            <Row label="Package" value={pkg?.label || 'Wash'} theme={theme} />
            <Row
              label="When"
              value={formatScheduledLabel(data.scheduledAt)}
              theme={theme}
            />
            <Row
              label="Total"
              value={formatPriceCents(data.priceCents)}
              theme={theme}
              accent
              last
            />
          </View>
        </Animated.View>
      </View>

      <CustomerFooterBar>
        <CustomerPrimaryButton label="Track booking" onPress={handleTrack} />
        <CustomerGhostButton label="Back to home" onPress={handleHome} />
      </CustomerFooterBar>
    </SafeAreaView>
  );
}

function Row({ label, value, theme, accent, last }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: theme.customer.outlineVariant + '80',
      }}
    >
      <Text style={{ fontSize: 13, color: theme.text.secondary }}>{label}</Text>
      <Text
        style={{
          fontSize: accent ? 17 : 14,
          fontWeight: accent ? '800' : '700',
          color: accent ? theme.accent.dark : theme.text.primary,
          letterSpacing: accent ? -0.3 : -0.1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    checkCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.accent.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadow.md,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginTop: 6,
      marginBottom: 24,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 20,
    },
    summary: {
      width: '100%',
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
      paddingHorizontal: 16,
      ...theme.shadow.sm,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
      gap: 4,
    },
    primaryBtn: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: theme.accent.primary,
      paddingVertical: 16,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
    secondaryBtn: { paddingVertical: 12, alignItems: 'center' },
    secondaryBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.secondary,
    },
  });
};
