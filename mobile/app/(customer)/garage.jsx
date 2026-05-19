import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAddVehicle } from '../../context/AddVehicleContext';
import { garageService } from '../../services/garageService';
import AppIcon from '../../components/customer/AppIcon';
import VehicleArt, { resolveBodyColor } from '../../components/customer/VehicleArt';

const STEP_LABEL = {
  intro: 'Add new vehicle',
  details: 'Step 1 of 2 — Vehicle details',
  review: 'Step 2 of 2 — Review & save',
};

export default function Garage() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form: draftForm, lastStep, hasDraft, reset: resetDraft } = useAddVehicle();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetVehicle, setSheetVehicle] = useState(null);

  const loadVehicles = useCallback(async () => {
    try {
      const data = await garageService.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Garage load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVehicles();
  }, [loadVehicles]);

  const confirmDelete = (vehicle) => {
    setSheetVehicle(null);
    Alert.alert(
      'Remove vehicle',
      `Remove ${vehicle.make} ${vehicle.model} from your garage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await garageService.deleteVehicle(vehicle.id);
              loadVehicles();
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
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.pageTitle}>My Garage</Text>
        <Pressable style={s.headerIcon} hitSlop={8}>
          <AppIcon name="notifications" size={22} color={theme.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 120 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {hasDraft ? (
          <View style={s.resumeCard}>
            <View style={s.resumeIcon}>
              <AppIcon name="schedule" size={20} color={theme.accent.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.resumeTitle}>Continue adding vehicle</Text>
              <Text style={s.resumeSub} numberOfLines={1}>
                {draftForm.make || 'Unfinished'}
                {draftForm.model ? ` ${draftForm.model}` : ''} •{' '}
                {STEP_LABEL[lastStep] || 'In progress'}
              </Text>
            </View>
            <Pressable
              onPress={() =>
                router.push(`/add-vehicle/${lastStep === 'intro' ? 'details' : lastStep}`)
              }
              style={s.resumeBtn}
            >
              <Text style={s.resumeBtnText}>Resume</Text>
            </Pressable>
            <Pressable
              onPress={() => resetDraft()}
              hitSlop={8}
              style={s.resumeDismiss}
            >
              <AppIcon name="close" size={18} color={theme.text.muted} />
            </Pressable>
          </View>
        ) : null}

        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Your vehicles</Text>
          {vehicles.length > 0 ? (
            <View style={s.countPill}>
              <Text style={s.countText}>
                {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
              </Text>
            </View>
          ) : null}
        </View>

        {vehicles.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={s.emptyArt}>
              <VehicleArt width={200} height={120} accentColor={theme.accent.primary} />
            </View>
            <Text style={s.emptyTitle}>No vehicles yet</Text>
            <Text style={s.emptySub}>
              Save your cars for faster booking, smart reminders, and a tidy wash history.
            </Text>
            <TouchableOpacity
              activeOpacity={0.88}
              style={s.primaryBtn}
              onPress={() => router.push('/add-vehicle/intro')}
            >
              <Text style={s.primaryBtnText}>Add your first vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                theme={theme}
                onPress={() =>
                  router.push({
                    pathname: '/vehicle/[id]',
                    params: { id: String(v.id) },
                  })
                }
                onMore={() => setSheetVehicle(v)}
              />
            ))}

            <Pressable
              style={({ pressed }) => [s.addCard, pressed && { opacity: 0.85 }]}
              onPress={() => router.push('/add-vehicle/intro')}
            >
              <View style={s.addPlusBox}>
                <AppIcon name="add" size={26} color={theme.accent.primary} />
              </View>
              <Text style={s.addCardTitle}>Add New Vehicle</Text>
              <Text style={s.addCardSub}>
                Keep all your vehicles in one place for faster booking
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <VehicleActionSheet
        vehicle={sheetVehicle}
        theme={theme}
        onClose={() => setSheetVehicle(null)}
        onDelete={confirmDelete}
      />
    </SafeAreaView>
  );
}

function VehicleCard({ vehicle, theme, onPress, onMore }) {
  const s = cardStyles(theme);
  const bodyColor = resolveBodyColor(vehicle.color, '#a5d4e6');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.95 }]}
    >
      <View style={s.artWrap}>
        <VehicleArt
          width={220}
          height={120}
          bodyColor={bodyColor}
          accentColor={theme.accent.primary}
        />
      </View>
      <View style={s.body}>
        <View style={s.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.name} numberOfLines={1}>
              {vehicle.make} {vehicle.model}
            </Text>
            <View style={s.plateRow}>
              <Text style={s.plateText}>
                {vehicle.license_plate || 'No plate'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onMore();
            }}
            hitSlop={12}
            style={s.moreBtn}
          >
            <AppIcon name="more-vert" size={20} color={theme.text.secondary} />
          </Pressable>
        </View>
        <View style={s.chipRow}>
          {vehicle.year ? (
            <View style={s.chip}>
              <Text style={s.chipText}>{vehicle.year}</Text>
            </View>
          ) : null}
          {vehicle.color ? (
            <View style={[s.chip, s.colorChip]}>
              <View style={[s.colorDot, { backgroundColor: bodyColor }]} />
              <Text style={s.chipText}>{vehicle.color}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function VehicleActionSheet({ vehicle, theme, onClose, onDelete }) {
  const insets = useSafeAreaInsets();
  const s = sheetStyles(theme);
  const visible = !!vehicle;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={s.handle} />
        <Text style={s.title}>
          {vehicle ? `${vehicle.make} ${vehicle.model}` : ''}
        </Text>
        <Pressable
          style={({ pressed }) => [s.row, pressed && { opacity: 0.8 }]}
          onPress={onClose}
        >
          <AppIcon name="star-border" size={22} color={theme.text.primary} />
          <Text style={s.rowText}>Set as default</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.row, pressed && { opacity: 0.8 }]}
          onPress={() => vehicle && onDelete(vehicle)}
        >
          <AppIcon name="delete-outline" size={22} color={theme.customer.error} />
          <Text style={[s.rowText, { color: theme.customer.error }]}>
            Remove vehicle
          </Text>
        </Pressable>
        <Pressable style={s.cancelBtn} onPress={onClose}>
          <Text style={s.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 4,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.5,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: { paddingHorizontal: 20, paddingTop: 8 },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.secondary,
    },
    countPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      backgroundColor: c.primaryBg,
    },
    countText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.accent.primary,
      letterSpacing: 0.3,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingTop: 24,
      paddingHorizontal: 8,
    },
    emptyArt: { marginBottom: 16 },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 6,
    },
    emptySub: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
      paddingHorizontal: 12,
    },
    primaryBtn: {
      backgroundColor: theme.accent.primary,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: theme.radius.full,
    },
    primaryBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
    addCard: {
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: theme.accent.primary + '60',
      backgroundColor: c.primaryBg,
      paddingVertical: 22,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginTop: 4,
    },
    addPlusBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.surfaceContainerLowest,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    addCardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.accent.primary,
      marginBottom: 4,
    },
    addCardSub: {
      fontSize: 12,
      color: theme.text.secondary,
      textAlign: 'center',
    },
    resumeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      paddingRight: 8,
      marginBottom: 12,
      borderRadius: theme.radius.lg,
      backgroundColor: c.primaryBg,
      borderWidth: 1,
      borderColor: theme.accent.primary + '40',
    },
    resumeIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surfaceContainerLowest,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resumeTitle: { fontSize: 13, fontWeight: '700', color: theme.text.primary },
    resumeSub: {
      fontSize: 11,
      color: theme.text.secondary,
      marginTop: 2,
    },
    resumeBtn: {
      backgroundColor: theme.accent.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radius.full,
    },
    resumeBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
    resumeDismiss: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};

const cardStyles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
      overflow: 'hidden',
      marginBottom: 16,
      ...theme.shadow.sm,
    },
    artWrap: {
      backgroundColor: c.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
    },
    body: { padding: 16 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    name: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.2,
    },
    plateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    plateText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text.secondary,
      letterSpacing: 1,
    },
    moreBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant + '40',
    },
    colorChip: { gap: 6 },
    colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
    },
    chipText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.text.secondary,
      letterSpacing: 0.2,
    },
  });
};

const sheetStyles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: c.surfaceContainerLowest,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 12,
      paddingTop: 8,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.outlineVariant,
      marginBottom: 12,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.secondary,
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderRadius: theme.radius.md,
    },
    rowText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text.primary,
    },
    cancelBtn: {
      marginTop: 8,
      marginHorizontal: 4,
      paddingVertical: 14,
      borderRadius: theme.radius.md,
      backgroundColor: c.surfaceContainerLow,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.primary,
    },
  });
};
