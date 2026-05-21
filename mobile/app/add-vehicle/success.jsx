import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useAddVehicle } from '../../context/AddVehicleContext';
import AppIcon from '../../components/customer/AppIcon';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import VehicleArt, { resolveBodyColor } from '../../components/customer/VehicleArt';

const CONFETTI = [
  { cx: 30, cy: 30, r: 4, color: '#06b6d4' },
  { cx: 90, cy: 12, r: 3, color: '#e89337' },
  { cx: 160, cy: 38, r: 5, color: '#2170e4' },
  { cx: 220, cy: 18, r: 3, color: '#06b6d4' },
  { cx: 270, cy: 50, r: 4, color: '#e89337' },
  { cx: 50, cy: 70, r: 3, color: '#2170e4' },
  { cx: 200, cy: 78, r: 4, color: '#06b6d4' },
];

export default function VehicleAddedSuccess() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, reset } = useAddVehicle();
  const snapshot = useRef({ ...form });
  const s = styles(theme);

  useEffect(() => {
    snapshot.current = { ...form };
  }, [form]);

  const handleDone = () => {
    reset();
    router.replace('/(customer)/garage');
  };

  const data = snapshot.current;
  const bodyColor = resolveBodyColor(data.color, '#a5d4e6');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.confettiWrap} pointerEvents="none">
        <Svg width="100%" height={100} viewBox="0 0 300 100">
          {CONFETTI.map((d, i) => (
            <Circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.color} opacity={0.85} />
          ))}
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.checkWrap}>
          <View style={s.checkCircle}>
            <AppIcon name="check" size={40} color={theme.button.primary.text} />
          </View>
        </View>

        <Text style={s.title}>Vehicle Added Successfully!</Text>
        <Text style={s.subtitle}>Your vehicle has been added to your garage.</Text>

        <View style={s.summary}>
          <VehicleArt
            width={220}
            height={120}
            bodyColor={bodyColor}
            accentColor={theme.accent.primary}
          />
          <Text style={s.summaryName}>
            {data.make} {data.model}
          </Text>
          <View style={s.chipRow}>
            <View style={s.chip}>
              <Text style={s.chipText}>{data.license_plate}</Text>
            </View>
            {data.year ? (
              <View style={s.chip}>
                <Text style={s.chipText}>{data.year}</Text>
              </View>
            ) : null}
            {data.color ? (
              <View style={[s.chip, s.colorChip]}>
                <View style={[s.colorDot, { backgroundColor: bodyColor }]} />
                <Text style={s.chipText}>{data.color}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <CustomerFooterBar>
        <CustomerPrimaryButton label="Done" onPress={handleDone} />
      </CustomerFooterBar>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    confettiWrap: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      height: 100,
      alignItems: 'center',
    },
    content: { paddingHorizontal: 24, paddingTop: 60, alignItems: 'center' },
    checkWrap: { alignItems: 'center', marginBottom: 16 },
    checkCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.accent.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadow.md,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text.primary,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 28,
    },
    summary: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
      paddingVertical: 20,
      paddingHorizontal: 16,
      ...theme.shadow.sm,
    },
    summaryName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      marginTop: 8,
      letterSpacing: -0.2,
    },
    chipRow: {
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
      backgroundColor: c.surfaceContainerLow,
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
