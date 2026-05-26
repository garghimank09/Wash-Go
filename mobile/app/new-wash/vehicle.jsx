import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import { garageService } from '../../services/garageService';
import AppIcon from '../../components/customer/AppIcon';
import StepHeader from '../../components/customer/StepHeader';
import CustomerStepProgress from '../../components/customer/CustomerStepProgress';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import CustomerSkeleton from '../../components/customer/ui/CustomerSkeleton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import VehicleArt, { resolveBodyColor } from '../../components/customer/VehicleArt';

export default function NewWashVehicle() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, setField, setLastStep, hasDraft, lastStep } = useNewBooking();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const s = styles(theme);

  useEffect(() => {
    setLastStep('vehicle');
  }, [setLastStep]);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await garageService.getVehicles();
      setVehicles(data);
      // If user only has one car and none selected, auto-pick it
      if (data.length === 1 && !form.carId) {
        setField('carId', data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Could not load vehicles');
    } finally {
      setLoading(false);
    }
  }, [form.carId, setField]);

  // Reload on focus so newly added vehicles appear
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(customer)/dashboard');
  };

  const handleContinue = () => {
    if (!form.carId) return;
    router.push('/new-wash/package');
  };

  const showContinueSetup = hasDraft && lastStep !== 'vehicle' && form.carId;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader title="Choose your vehicle" step="Step 1 of 5" onBack={handleBack} />
      <CustomerStepProgress currentStep="vehicle" />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.intro}>Which car are we washing?</Text>

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <CustomerSkeleton />
        ) : vehicles.length === 0 ? (
          <View style={s.emptyCard}>
            <VehicleArt width={180} height={104} accentColor={theme.accent.primary} />
            <Text style={s.emptyTitle}>No vehicles yet</Text>
            <Text style={s.emptySub}>
              Add a vehicle to your garage to book a wash.
            </Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => router.push('/add-vehicle/intro')}
              activeOpacity={0.88}
            >
              <Text style={s.emptyBtnText}>Add a vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {vehicles.map((v) => {
              const selected = form.carId === v.id;
              const bodyColor = resolveBodyColor(v.color, '#a5d4e6');
              return (
                <Pressable
                  key={v.id}
                  onPress={() => setField('carId', v.id)}
                  style={({ pressed }) => [
                    s.vehicleCard,
                    selected && s.vehicleCardSelected,
                    pressed && { opacity: 0.95 },
                  ]}
                >
                  <View style={s.vehicleArt}>
                    <VehicleArt
                      width={88}
                      height={56}
                      bodyColor={bodyColor}
                      accentColor={theme.accent.primary}
                      shadow={false}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.vehicleName}>
                      {v.make} {v.model}
                    </Text>
                    <View style={s.metaRow}>
                      <View style={s.plateBox}>
                        <Text style={s.plateText}>{v.license_plate}</Text>
                      </View>
                      {v.year ? <Text style={s.metaText}>{v.year}</Text> : null}
                    </View>
                  </View>
                  <View style={[s.radio, selected && s.radioSelected]}>
                    {selected ? (
                      <AppIcon name="check" size={14} color={theme.button.primary.text} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => router.push('/add-vehicle/intro')}
              style={({ pressed }) => [s.addCard, pressed && { opacity: 0.88 }]}
            >
              <View style={s.addIcon}>
                <AppIcon name="add" size={20} color={theme.accent.primary} />
              </View>
              <Text style={s.addText}>Add another vehicle</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <CustomerFooterBar>
        <CustomerPrimaryButton
          label={showContinueSetup ? 'Continue setup' : 'Continue'}
          onPress={showContinueSetup ? () => router.push(`/new-wash/${lastStep}`) : handleContinue}
          disabled={!form.carId}
        />
      </CustomerFooterBar>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    scroll: { paddingHorizontal: 20, paddingTop: 4 },
    intro: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 16,
    },
    errorBox: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(220,38,38,0.08)',
      marginBottom: 12,
    },
    errorText: { fontSize: 13, color: c.error, fontWeight: '600' },
    loading: { padding: 32, alignItems: 'center' },
    emptyCard: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingVertical: 28,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginTop: 12,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text.primary,
      marginTop: 12,
    },
    emptySub: {
      fontSize: 13,
      color: theme.text.secondary,
      marginTop: 6,
      marginBottom: 18,
      textAlign: 'center',
    },
    emptyBtn: {
      paddingHorizontal: 22,
      paddingVertical: 12,
      borderRadius: theme.radius.full,
      backgroundColor: theme.accent.primary,
    },
    emptyBtnText: {
      color: theme.button.primary.text,
      fontWeight: '700',
      fontSize: 14,
    },
    vehicleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 14,
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLowest,
    },
    vehicleCardSelected: {
      borderColor: theme.accent.primary,
      backgroundColor: c.primaryBg,
      ...theme.shadow.sm,
    },
    vehicleArt: {
      width: 96,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    vehicleName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
    },
    plateBox: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: c.surfaceContainerLow,
    },
    plateText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: 1,
    },
    metaText: { fontSize: 12, color: theme.text.secondary, fontWeight: '500' },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      backgroundColor: theme.accent.primary,
      borderColor: theme.accent.primary,
    },
    addCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: theme.accent.primary + '70',
      backgroundColor: c.primaryBg,
    },
    addIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surfaceContainerLowest,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addText: { fontSize: 14, fontWeight: '700', color: theme.accent.primary },
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
