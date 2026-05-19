import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAddVehicle } from '../../context/AddVehicleContext';
import AppIcon from '../../components/customer/AppIcon';
import StepHeader from '../../components/customer/StepHeader';
import VehicleArt from '../../components/customer/VehicleArt';

const BENEFITS = [
  {
    icon: 'bolt',
    title: 'Faster Checkout',
    desc: 'No need to enter details again',
  },
  {
    icon: 'history',
    title: 'Wash History',
    desc: 'Track wash history by vehicle',
  },
  {
    icon: 'notifications-active',
    title: 'Smart Reminders',
    desc: 'Get reminders for each vehicle',
  },
];

export default function AddVehicleIntro() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hasDraft, lastStep, setLastStep, reset } = useAddVehicle();
  const s = styles(theme);

  useEffect(() => {
    setLastStep('intro');
  }, [setLastStep]);

  const continuing = hasDraft && lastStep !== 'intro';

  const handleStart = () => {
    if (continuing) {
      router.push(`/add-vehicle/${lastStep}`);
    } else {
      reset();
      router.push('/add-vehicle/details');
    }
  };

  const handleStartFresh = () => {
    reset();
    router.push('/add-vehicle/details');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader
        title="Add New Vehicle"
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(customer)/garage');
        }}
      />
      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingBottom: insets.bottom + (continuing ? 156 : 100) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroWrap}>
          <VehicleArt
            width={240}
            height={140}
            bodyColor="#bfd8e8"
            accentColor={theme.accent.primary}
          />
        </View>

        <Text style={s.title}>Let's add your vehicle</Text>
        <Text style={s.subtitle}>
          Add your vehicle details to unlock faster booking and better service.
        </Text>

        <View style={s.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.title} style={s.benefitRow}>
              <View style={s.iconWrap}>
                <AppIcon name={b.icon} size={22} color={theme.accent.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.benefitTitle}>{b.title}</Text>
                <Text style={s.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={handleStart}
          activeOpacity={0.88}
        >
          <Text style={s.primaryBtnText}>
            {continuing ? 'Continue setup' : 'Add Vehicle'}
          </Text>
          <AppIcon name="arrow-forward" size={20} color={theme.button.primary.text} />
        </TouchableOpacity>
        {continuing ? (
          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={handleStartFresh}
            activeOpacity={0.7}
          >
            <Text style={s.secondaryBtnText}>Start fresh</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    content: {
      paddingHorizontal: 24,
      paddingTop: 8,
    },
    heroWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: theme.radius.lg,
      paddingVertical: 24,
      marginBottom: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
      textAlign: 'center',
      letterSpacing: -0.3,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 8,
      marginBottom: 28,
    },
    benefits: { gap: 14 },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 14,
      borderRadius: theme.radius.lg,
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    benefitTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.primary,
    },
    benefitDesc: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 2,
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
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.secondary,
    },
  });
};
