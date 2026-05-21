import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAddVehicle } from '../../context/AddVehicleContext';
import { garageService } from '../../services/garageService';
import StepHeader from '../../components/customer/StepHeader';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import VehicleArt, { resolveBodyColor } from '../../components/customer/VehicleArt';

export default function ReviewVehicle() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, setLastStep } = useAddVehicle();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  useEffect(() => {
    setLastStep('review');
  }, [setLastStep]);

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await garageService.addVehicle({
        make: form.make.trim(),
        model: form.model.trim(),
        year: form.year ? parseInt(form.year, 10) : null,
        license_plate: form.license_plate.trim(),
        color: form.color ? form.color.trim() : null,
      });
      router.replace('/add-vehicle/success');
    } catch (err) {
      setError(err.message || 'Could not save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const bodyColor = resolveBodyColor(form.color, '#a5d4e6');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader title="Review & Save" step="Step 2 of 2" />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 180 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.sectionTitle}>Review Vehicle Details</Text>
        <Text style={s.sectionSub}>Please confirm your vehicle information</Text>

        {error ? (
          <View style={s.errorBanner}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={s.hero}>
          <VehicleArt
            width={220}
            height={120}
            bodyColor={bodyColor}
            accentColor={theme.accent.primary}
          />
          <Text style={s.heroName}>
            {form.make} {form.model}
          </Text>
          <View style={s.heroChips}>
            <View style={s.chip}>
              <Text style={s.chipText}>{form.license_plate}</Text>
            </View>
            {form.year ? (
              <View style={s.chip}>
                <Text style={s.chipText}>{form.year}</Text>
              </View>
            ) : null}
            {form.color ? (
              <View style={[s.chip, s.colorChip]}>
                <View style={[s.colorDot, { backgroundColor: bodyColor }]} />
                <Text style={s.chipText}>{form.color}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={s.card}>
          <ReviewRow label="Vehicle Brand" value={form.make} theme={theme} />
          <ReviewRow label="Vehicle Model" value={form.model} theme={theme} />
          <ReviewRow
            label="Manufacturing Year"
            value={form.year || '—'}
            theme={theme}
          />
          <ReviewRow
            label="Plate Number"
            value={form.license_plate}
            theme={theme}
            mono
          />
          <ReviewRow
            label="Vehicle Color"
            value={form.color || 'Not set'}
            theme={theme}
            last
          />
        </View>
      </ScrollView>

      <CustomerFooterBar>
        <CustomerPrimaryButton
          label="Save Vehicle"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
        />
        <TouchableOpacity
          style={s.secondaryBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={s.secondaryBtnText}>Edit Details</Text>
        </TouchableOpacity>
      </CustomerFooterBar>
    </SafeAreaView>
  );
}

function ReviewRow({ label, value, theme, mono, last }) {
  const c = theme.customer;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: c.outlineVariant + '80',
      }}
    >
      <Text style={{ fontSize: 13, color: theme.text.secondary }}>{label}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: theme.text.primary,
          letterSpacing: mono ? 1 : 0,
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
    scroll: { paddingHorizontal: 20, paddingTop: 8 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.2,
    },
    sectionSub: {
      fontSize: 13,
      color: theme.text.secondary,
      marginTop: 2,
      marginBottom: 20,
    },
    errorBanner: {
      backgroundColor: 'rgba(220,38,38,0.08)',
      borderRadius: theme.radius.md,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 16,
    },
    errorText: { fontSize: 13, color: theme.customer.error, fontWeight: '600' },
    hero: {
      alignItems: 'center',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: theme.radius.lg,
      paddingVertical: 20,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    heroName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      marginTop: 8,
      letterSpacing: -0.2,
    },
    heroChips: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
    },
    colorChip: { gap: 6 },
    colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    chipText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.secondary,
      letterSpacing: 0.4,
    },
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
      paddingHorizontal: 16,
    },
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
      gap: 6,
    },
    primaryBtn: {
      backgroundColor: theme.accent.primary,
      paddingVertical: 16,
      borderRadius: theme.radius.full,
      alignItems: 'center',
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
      color: theme.accent.primary,
    },
  });
};
