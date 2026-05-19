import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import { pricingService, PACKAGES, VEHICLE_SIZES } from '../../services/pricingService';
import { formatPriceCents } from '../../services/bookingService';
import AppIcon from '../../components/customer/AppIcon';
import StepHeader from '../../components/customer/StepHeader';
import PackageCard from '../../components/customer/PackageCard';
import SizeChip from '../../components/customer/SizeChip';

export default function NewWashPackage() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, setField, setFields, setLastStep } = useNewBooking();
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [estimatePerPackage, setEstimatePerPackage] = useState({});
  const priceAnim = useRef(new Animated.Value(0)).current;
  const s = styles(theme);

  useEffect(() => {
    setLastStep('package');
  }, [setLastStep]);

  // Calculate all three package prices for the chosen vehicle size
  useEffect(() => {
    let cancelled = false;
    setEstimating(true);
    setEstimateError('');

    const run = async () => {
      try {
        const results = await Promise.all(
          PACKAGES.map((p) => pricingService.calculate(p.id, form.vehicleSize))
        );
        if (cancelled) return;
        const map = {};
        results.forEach((r, idx) => {
          map[PACKAGES[idx].id] = r.estimated_price_cents;
        });
        setEstimatePerPackage(map);
        const selectedCents = map[form.packageId];
        if (selectedCents != null) setField('priceCents', selectedCents);

        Animated.timing(priceAnim, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => priceAnim.setValue(0));
      } catch (err) {
        if (!cancelled) setEstimateError(err.message || 'Pricing unavailable');
      } finally {
        if (!cancelled) setEstimating(false);
      }
    };

    const timeout = setTimeout(run, 240);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // priceAnim and setField are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.vehicleSize]);

  // When user picks a different package, set price from cache immediately
  useEffect(() => {
    const cents = estimatePerPackage[form.packageId];
    if (cents != null) {
      setField('priceCents', cents);
      Animated.timing(priceAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start(() => priceAnim.setValue(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.packageId, estimatePerPackage]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/new-wash/vehicle');
  };

  const handleContinue = () => router.push('/new-wash/schedule');

  const totalLabel = form.priceCents != null
    ? formatPriceCents(form.priceCents)
    : estimating
    ? '...'
    : '—';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader title="Pick a package" step="Step 2 of 4" onBack={handleBack} />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.sectionLabel}>Vehicle size</Text>
        <View style={s.sizeRow}>
          {VEHICLE_SIZES.map((sz) => (
            <SizeChip
              key={sz.id}
              label={sz.label}
              selected={form.vehicleSize === sz.id}
              onPress={() => setField('vehicleSize', sz.id)}
            />
          ))}
        </View>

        <Text style={[s.sectionLabel, { marginTop: 22 }]}>Wash package</Text>
        <View style={{ gap: 12 }}>
          {PACKAGES.map((p) => (
            <PackageCard
              key={p.id}
              pkg={p}
              selected={form.packageId === p.id}
              recommended={p.id === 'deluxe'}
              priceLabel={
                estimatePerPackage[p.id] != null
                  ? formatPriceCents(estimatePerPackage[p.id])
                  : '—'
              }
              onPress={() => setField('packageId', p.id)}
            />
          ))}
        </View>

        {estimateError ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{estimateError}</Text>
          </View>
        ) : null}
      </ScrollView>

      <Animated.View
        style={[
          s.footer,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={s.totalRow}>
          <View>
            <Text style={s.totalLabel}>Estimated total</Text>
            <Animated.Text
              style={[
                s.totalValue,
                {
                  transform: [
                    {
                      translateY: priceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -2],
                      }),
                    },
                  ],
                  opacity: priceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.6],
                  }),
                },
              ]}
            >
              {totalLabel}
            </Animated.Text>
          </View>
          {estimating ? (
            <ActivityIndicator color={theme.accent.primary} />
          ) : null}
        </View>
        <TouchableOpacity
          style={[s.primaryBtn, form.priceCents == null && s.primaryBtnDisabled]}
          onPress={handleContinue}
          disabled={form.priceCents == null}
          activeOpacity={0.88}
        >
          <Text style={s.primaryBtnText}>Continue</Text>
          <AppIcon name="arrow-forward" size={18} color={theme.button.primary.text} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    scroll: { paddingHorizontal: 20, paddingTop: 4 },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 10,
    },
    sizeRow: { flexDirection: 'row', gap: 10 },
    errorBox: {
      marginTop: 16,
      padding: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(220,38,38,0.08)',
    },
    errorText: { fontSize: 13, color: c.error, fontWeight: '600' },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    totalLabel: {
      fontSize: 11,
      color: theme.text.muted,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    totalValue: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
      marginTop: 2,
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
    primaryBtnDisabled: { opacity: 0.4 },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
  });
};
