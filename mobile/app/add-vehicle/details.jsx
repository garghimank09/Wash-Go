import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAddVehicle } from '../../context/AddVehicleContext';
import AppIcon from '../../components/customer/AppIcon';
import StepHeader from '../../components/customer/StepHeader';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import PickerSheet from '../../components/customer/PickerSheet';

const MAKES = [
  'Toyota',
  'Honda',
  'Hyundai',
  'Maruti',
  'Tata',
  'Mahindra',
  'Volkswagen',
  'Ford',
  'BMW',
  'Mercedes',
  'Audi',
  'Other',
];

const COLORS = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Brown', 'Other'];

const currentYear = new Date().getFullYear();

export default function VehicleDetails() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, setField, setLastStep } = useAddVehicle();
  const [errors, setErrors] = useState({});
  const [picker, setPicker] = useState(null);
  const s = styles(theme);

  useEffect(() => {
    setLastStep('details');
  }, [setLastStep]);

  const validate = () => {
    const next = {};
    if (!form.make) next.make = 'Select your vehicle brand';
    if (!form.model.trim()) next.model = 'Enter the model name';
    if (!form.year) {
      next.year = 'Enter the year';
    } else {
      const y = parseInt(form.year, 10);
      if (Number.isNaN(y) || y < 1980 || y > currentYear + 1) {
        next.year = `Year must be between 1980 and ${currentYear + 1}`;
      }
    }
    if (!form.license_plate.trim()) next.license_plate = 'Enter your plate number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    if (validate()) router.push('/add-vehicle/review');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader title="Vehicle Details" step="Step 1 of 2" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingBottom: insets.bottom + 120 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.sectionTitle}>Basic Information</Text>
          <Text style={s.sectionSub}>Tell us about your vehicle</Text>

          <Field label="Vehicle Brand" required error={errors.make}>
            <Pressable
              style={[s.selectInput, errors.make && s.inputError]}
              onPress={() => setPicker('make')}
            >
              <Text style={form.make ? s.selectText : s.selectPlaceholder}>
                {form.make || 'Select brand'}
              </Text>
              <AppIcon name="expand-more" size={22} color={theme.text.secondary} />
            </Pressable>
          </Field>

          <Field label="Vehicle Model" required error={errors.model}>
            <TextInput
              style={[s.input, errors.model && s.inputError]}
              placeholder="e.g. City, Creta, Polo XE"
              placeholderTextColor={theme.text.muted}
              value={form.model}
              onChangeText={(v) => setField('model', v)}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Field>

          <Field label="Manufacturing Year" required error={errors.year}>
            <TextInput
              style={[s.input, errors.year && s.inputError]}
              placeholder="e.g. 2020"
              placeholderTextColor={theme.text.muted}
              value={form.year}
              onChangeText={(v) => setField('year', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={4}
              returnKeyType="next"
            />
          </Field>

          <Field label="Plate Number" required error={errors.license_plate}>
            <TextInput
              style={[s.input, s.plateInput, errors.license_plate && s.inputError]}
              placeholder="HR 87 DX 1557"
              placeholderTextColor={theme.text.muted}
              value={form.license_plate}
              onChangeText={(v) => setField('license_plate', v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
            />
          </Field>

          <Field label="Vehicle Color" hint="Optional">
            <Pressable
              style={s.selectInput}
              onPress={() => setPicker('color')}
            >
              <Text style={form.color ? s.selectText : s.selectPlaceholder}>
                {form.color || 'Select color'}
              </Text>
              <AppIcon name="expand-more" size={22} color={theme.text.secondary} />
            </Pressable>
          </Field>
        </ScrollView>

        <CustomerFooterBar>
          <CustomerPrimaryButton label="Continue" onPress={handleContinue} />
        </CustomerFooterBar>
      </KeyboardAvoidingView>

      <PickerSheet
        visible={picker === 'make'}
        title="Select brand"
        options={MAKES}
        value={form.make}
        onSelect={(val) => setField('make', val)}
        onClose={() => setPicker(null)}
      />
      <PickerSheet
        visible={picker === 'color'}
        title="Select color"
        options={COLORS}
        value={form.color}
        onSelect={(val) => setField('color', val)}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}

function Field({ label, required, hint, error, children }) {
  const { theme } = useTheme();
  const s = fieldStyles(theme);
  return (
    <View style={s.wrap}>
      <View style={s.labelRow}>
        <Text style={s.label}>
          {label}
          {required ? <Text style={s.required}> *</Text> : null}
        </Text>
        {hint ? <Text style={s.hint}>{hint}</Text> : null}
      </View>
      {children}
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = (theme) =>
  StyleSheet.create({
    wrap: { marginBottom: 18 },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    label: { fontSize: 13, fontWeight: '600', color: theme.text.secondary },
    required: { color: theme.customer.error },
    hint: { fontSize: 11, color: theme.text.muted },
    error: {
      marginTop: 6,
      fontSize: 12,
      color: theme.customer.error,
    },
  });

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
    input: {
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderRadius: theme.radius.md,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.text.primary,
    },
    plateInput: {
      fontWeight: '700',
      letterSpacing: 2,
    },
    inputError: { borderColor: theme.customer.error },
    selectInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderRadius: theme.radius.md,
      paddingHorizontal: 16,
      paddingVertical: 14,
      minHeight: 52,
    },
    selectText: { fontSize: 16, color: theme.text.primary, fontWeight: '500' },
    selectPlaceholder: { fontSize: 16, color: theme.text.muted },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
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
  });
};
