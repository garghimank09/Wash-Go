import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import { garageService } from '../../services/garageService';
import { bookingService, decodeBookingMeta } from '../../services/bookingService';
import { getPackage } from '../../services/pricingService';
import AppIcon from '../../components/customer/AppIcon';
import StepHeader from '../../components/customer/StepHeader';
import VehicleArt, { resolveBodyColor } from '../../components/customer/VehicleArt';

export default function VehicleDetail() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { setFields: setBookingFields } = useNewBooking();
  const [vehicle, setVehicle] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [vehicles, bookingList] = await Promise.all([
        garageService.getVehicles(),
        bookingService.getBookings().catch(() => []),
      ]);
      const found = vehicles.find((v) => String(v.id) === String(id));
      setVehicle(found || null);
      setBookings(bookingList);
    } catch (err) {
      console.error('Vehicle load error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(customer)/garage');
  };

  const handleRemove = () => {
    setSheetOpen(false);
    Alert.alert(
      'Remove vehicle',
      `Remove ${vehicle?.make} ${vehicle?.model} from your garage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await garageService.deleteVehicle(vehicle.id);
              router.replace('/(customer)/garage');
            } catch (err) {
              Alert.alert('Could not remove', err.message);
            }
          },
        },
      ]
    );
  };

  const s = styles(theme);

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StepHeader title="Vehicle" onBack={handleBack} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StepHeader title="Vehicle" onBack={handleBack} />
        <View style={s.center}>
          <Text style={s.emptyTitle}>Vehicle not found</Text>
          <Text style={s.emptySub}>It may have been removed from your garage.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const bodyColor = resolveBodyColor(vehicle.color, '#a5d4e6');
  const washHistory = bookings.filter(
    (b) => String(b.car_id) === String(vehicle.id) && b.status === 'completed'
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader
        title="Vehicle"
        onBack={handleBack}
        right={
          <Pressable onPress={() => setSheetOpen(true)} hitSlop={12} style={s.headerMore}>
            <AppIcon name="more-vert" size={22} color={theme.text.primary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.hero}>
          <VehicleArt
            width={240}
            height={130}
            bodyColor={bodyColor}
            accentColor={theme.accent.primary}
          />
          <Text style={s.heroName}>
            {vehicle.make} {vehicle.model}
          </Text>
          <View style={s.plateBox}>
            <Text style={s.plateText}>{vehicle.license_plate}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Details</Text>
        <View style={s.card}>
          <Row label="Vehicle Brand" value={vehicle.make} theme={theme} />
          <Row label="Vehicle Model" value={vehicle.model} theme={theme} />
          <Row label="Manufacturing Year" value={vehicle.year || '—'} theme={theme} />
          <Row label="Plate Number" value={vehicle.license_plate} theme={theme} mono />
          <Row
            label="Vehicle Color"
            value={vehicle.color || 'Not set'}
            theme={theme}
            last
          />
        </View>

        <Text style={s.sectionTitle}>Wash history</Text>
        {washHistory.length === 0 ? (
          <View style={[s.card, s.emptyHistory]}>
            <View style={s.historyIconWrap}>
              <AppIcon name="history" size={26} color={theme.text.muted} />
            </View>
            <Text style={s.emptyTitle}>No washes yet</Text>
            <Text style={s.emptySub}>
              Completed washes for this vehicle will appear here.
            </Text>
          </View>
        ) : (
          <View style={s.card}>
            {washHistory.slice(0, 5).map((b, idx) => (
              <View
                key={b.id}
                style={[
                  s.historyRow,
                  idx < washHistory.length - 1 && s.historyDivider,
                ]}
              >
                <View style={s.historyDot}>
                  <AppIcon name="check" size={14} color={theme.button.primary.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.historyTitle}>
                    {getPackage(decodeBookingMeta(b.notes).packageId)?.label || 'Wash'}
                  </Text>
                  <Text style={s.historySub} numberOfLines={1}>
                    {b.service_address || 'Completed'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => {
            setBookingFields({ carId: vehicle.id });
            router.push('/new-wash/package');
          }}
          activeOpacity={0.88}
        >
          <Text style={s.primaryBtnText}>Book a wash</Text>
        </TouchableOpacity>
      </View>

      <ActionSheet
        visible={sheetOpen}
        theme={theme}
        onClose={() => setSheetOpen(false)}
        onDelete={handleRemove}
      />
    </SafeAreaView>
  );
}

function Row({ label, value, theme, mono, last }) {
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

function ActionSheet({ visible, theme, onClose, onDelete }) {
  const insets = useSafeAreaInsets();
  const c = theme.customer;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' }}
        onPress={onClose}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: c.surfaceContainerLowest,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16) + 8,
        }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: c.outlineVariant,
            marginBottom: 12,
          }}
        />
        <Pressable
          style={({ pressed }) => [sheetRowStyle, pressed && { opacity: 0.8 }]}
          onPress={onClose}
        >
          <AppIcon name="star-border" size={22} color={theme.text.primary} />
          <Text style={{ fontSize: 15, fontWeight: '500', color: theme.text.primary }}>
            Set as default
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [sheetRowStyle, pressed && { opacity: 0.8 }]}
          onPress={onDelete}
        >
          <AppIcon name="delete-outline" size={22} color={c.error} />
          <Text style={{ fontSize: 15, fontWeight: '500', color: c.error }}>
            Remove vehicle
          </Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{
            marginTop: 8,
            marginHorizontal: 4,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: c.surfaceContainerLow,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const sheetRowStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14,
  paddingHorizontal: 12,
  paddingVertical: 14,
  borderRadius: 12,
};

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    headerMore: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: { paddingHorizontal: 20, paddingTop: 4 },
    hero: {
      alignItems: 'center',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: theme.radius.lg,
      paddingVertical: 20,
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    heroName: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
      marginTop: 8,
      letterSpacing: -0.3,
    },
    plateBox: {
      marginTop: 10,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
    },
    plateText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: 2,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.secondary,
      marginBottom: 10,
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    emptyHistory: { alignItems: 'center', paddingVertical: 24 },
    historyIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: theme.text.primary },
    emptySub: {
      fontSize: 13,
      color: theme.text.secondary,
      marginTop: 4,
      textAlign: 'center',
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
    },
    historyDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.outlineVariant + '80',
    },
    historyDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.accent.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyTitle: { fontSize: 14, fontWeight: '600', color: theme.text.primary },
    historySub: { fontSize: 12, color: theme.text.secondary, marginTop: 2 },
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
