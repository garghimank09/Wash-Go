import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  Alert,
  AppState,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from 'react-native-maps';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import {
  bookingService,
  CANCEL_REASONS,
  decodeBookingMeta,
  formatPriceCents,
} from '../../services/bookingService';
import { garageService } from '../../services/garageService';
import { getPackage, getVehicleSize } from '../../services/pricingService';
import {
  deriveCustomerPhase,
  PHASE_SUBTITLE,
  canCancelPhase,
  canRescheduleBooking,
  shouldTrackLive,
  isPhaseTerminal,
} from '../../lib/customerBookingPhase';
import AppIcon from '../../components/customer/AppIcon';
import StepHeader from '../../components/customer/StepHeader';
import PhasePill from '../../components/customer/PhasePill';
import ServiceTimeline from '../../components/customer/ServiceTimeline';
import CustomerSkeleton from '../../components/customer/ui/CustomerSkeleton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import DateTimeField, { formatScheduledLabel } from '../../components/customer/DateTimeField';

const DETAIL_POLL_MS = 8000;
const TRACKING_POLL_MS = 4000;

export default function BookingDetail() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const focusedRef = useRef(false);
  const appActiveRef = useRef(true);

  const c = theme.customer;
  const s = styles(theme);

  const loadBooking = useCallback(async () => {
    try {
      setError('');
      const data = await bookingService.getBookingById(id);
      setBooking(data);
      if (data.car_id) {
        try {
          const vehicles = await garageService.getVehicles();
          setVehicle(vehicles.find((v) => v.id === data.car_id) || null);
        } catch {
          // ignore — vehicle lookup is non-blocking
        }
      }
    } catch (err) {
      setError(err.message || 'Could not load booking');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      loadBooking();
      const sub = AppState.addEventListener('change', (state) => {
        appActiveRef.current = state === 'active';
      });
      const interval = setInterval(() => {
        if (focusedRef.current && appActiveRef.current) loadBooking();
      }, DETAIL_POLL_MS);
      return () => {
        focusedRef.current = false;
        sub.remove();
        clearInterval(interval);
      };
    }, [loadBooking])
  );

  const phase = booking ? deriveCustomerPhase(booking) : null;
  const trackLive = phase && shouldTrackLive(phase);

  const loadTracking = useCallback(async () => {
    if (!id || !trackLive) return;
    try {
      const data = await bookingService.getTracking(id);
      setTracking(data);
    } catch {
      // silent
    }
  }, [id, trackLive]);

  useEffect(() => {
    if (!trackLive) {
      setTracking(null);
      return undefined;
    }
    loadTracking();
    const interval = setInterval(() => {
      if (focusedRef.current && appActiveRef.current) loadTracking();
    }, TRACKING_POLL_MS);
    return () => clearInterval(interval);
  }, [trackLive, loadTracking]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(customer)/bookings');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBooking();
    loadTracking();
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StepHeader title="Booking" onBack={handleBack} />
        <CustomerSkeleton />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StepHeader title="Booking" onBack={handleBack} />
        <View style={s.center}>
          <Text style={s.emptyTitle}>Booking not found</Text>
          {error ? <Text style={s.emptySub}>{error}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  const { packageId, vehicleSize } = decodeBookingMeta(booking.notes);
  const pkg = getPackage(packageId);
  const size = getVehicleSize(vehicleSize);
  const canCancel = canCancelPhase(phase);
  const canReschedule = canRescheduleBooking(booking);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader title="Booking" onBack={handleBack} />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 140 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroCard}>
          <View style={s.heroTopRow}>
            <PhasePill phase={phase} />
            <Text style={s.heroPrice}>
              {formatPriceCents(booking.price_cents, booking.currency)}
            </Text>
          </View>
          <Text style={s.heroTitle}>{pkg?.label || 'Wash'}</Text>
          <Text style={s.heroSub}>{PHASE_SUBTITLE[phase]}</Text>
        </View>

        {trackLive ? (
          <TrackingCard tracking={tracking} theme={theme} />
        ) : null}

        <SectionTitle theme={theme}>Service progress</SectionTitle>
        <View style={s.card}>
          <ServiceTimeline phase={phase} />
        </View>

        {booking.washer ? (
          <>
            <SectionTitle theme={theme}>Your washer</SectionTitle>
            <View style={[s.card, s.washerCard]}>
              <View style={s.washerAvatar}>
                <AppIcon name="person" size={22} color={theme.button.primary.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.washerName}>
                  {booking.washer.full_name || 'Assigned washer'}
                </Text>
                <View style={s.washerMeta}>
                  {booking.washer.rating_avg != null ? (
                    <View style={s.ratingChip}>
                      <AppIcon name="star" size={11} color={'#f59e0b'} />
                      <Text style={s.ratingText}>
                        {Number(booking.washer.rating_avg).toFixed(1)}
                      </Text>
                    </View>
                  ) : null}
                  {booking.washer.service_area ? (
                    <Text style={s.washerArea}>{booking.washer.service_area}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          </>
        ) : null}

        <SectionTitle theme={theme}>Booking details</SectionTitle>
        <View style={s.card}>
          <Row label="Package" value={pkg?.label || '—'} theme={theme} />
          <Row label="Vehicle size" value={size?.label || '—'} theme={theme} />
          <Row
            label="Vehicle"
            value={vehicle ? `${vehicle.make} ${vehicle.model}` : '—'}
            theme={theme}
          />
          <Row
            label="Scheduled"
            value={formatScheduledLabel(booking.scheduled_at)}
            theme={theme}
          />
          <Row
            label="Address"
            value={booking.service_address}
            theme={theme}
            multiline
            last
          />
        </View>

        {canReschedule || canCancel ? (
          <View style={{ gap: 8, marginTop: 18 }}>
            {canReschedule ? (
              <TouchableOpacity
                style={s.outlineBtn}
                onPress={() => setRescheduleOpen(true)}
                activeOpacity={0.88}
              >
                <AppIcon name="event" size={16} color={theme.accent.primary} />
                <Text style={s.outlineBtnText}>Reschedule</Text>
              </TouchableOpacity>
            ) : null}
            {canCancel ? (
              <TouchableOpacity
                style={s.destructiveBtn}
                onPress={() => setCancelOpen(true)}
                activeOpacity={0.88}
              >
                <AppIcon name="cancel" size={16} color={c.error} />
                <Text style={s.destructiveBtnText}>Cancel booking</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : !isPhaseTerminal(phase) ? (
          <View style={s.supportBox}>
            <AppIcon name="info-outline" size={14} color={theme.text.secondary} />
            <Text style={s.supportText}>
              Need to make changes? Contact support to update this booking.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <CancelSheet
        visible={cancelOpen}
        theme={theme}
        onClose={() => setCancelOpen(false)}
        onConfirm={async (reasonKey) => {
          try {
            await bookingService.cancelBooking(id, { reasonKey });
            setCancelOpen(false);
            await loadBooking();
          } catch (err) {
            Alert.alert('Could not cancel', err.message);
          }
        }}
      />

      <RescheduleSheet
        visible={rescheduleOpen}
        theme={theme}
        initial={booking.scheduled_at}
        onClose={() => setRescheduleOpen(false)}
        onConfirm={async (iso) => {
          try {
            await bookingService.rescheduleBooking(id, iso);
            setRescheduleOpen(false);
            await loadBooking();
          } catch (err) {
            Alert.alert('Could not reschedule', err.message);
          }
        }}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ theme, children }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: theme.text.muted,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

function Row({ label, value, theme, multiline, last }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: theme.customer.outlineVariant + '80',
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 13, color: theme.text.secondary }}>{label}</Text>
      <Text
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: '700',
          color: theme.text.primary,
          textAlign: 'right',
        }}
        numberOfLines={multiline ? 3 : 1}
      >
        {value}
      </Text>
    </View>
  );
}

function TrackingCard({ tracking, theme }) {
  const c = theme.customer;
  const s = styles(theme);

  const customer = tracking?.customer;
  const washer = tracking?.washer;
  const route = tracking?.route || [];
  const hasMap = customer?.latitude != null && customer?.longitude != null;

  const initialRegion = hasMap
    ? {
        latitude: customer.latitude,
        longitude: customer.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    : null;

  return (
    <View style={[s.card, { marginTop: 14, padding: 0, overflow: 'hidden' }]}>
      <View style={s.trackingHeader}>
        <View>
          <Text style={s.trackingLabel}>Live tracking</Text>
          {tracking?.eta_minutes != null ? (
            <Text style={s.trackingEta}>
              ETA {tracking.eta_minutes} {tracking.eta_minutes === 1 ? 'min' : 'mins'}
            </Text>
          ) : (
            <Text style={s.trackingEta}>Updating…</Text>
          )}
        </View>
        {tracking?.live ? (
          <View style={s.liveChip}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        ) : null}
      </View>

      {hasMap ? (
        <View style={s.mapBox}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            pitchEnabled={false}
            rotateEnabled={false}
            toolbarEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: customer.latitude,
                longitude: customer.longitude,
              }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={s.markerCustomer}>
                <View
                  style={[s.markerDot, { backgroundColor: theme.accent.primary }]}
                />
              </View>
            </Marker>
            {washer?.latitude != null && washer?.longitude != null ? (
              <Marker
                coordinate={{
                  latitude: washer.latitude,
                  longitude: washer.longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={s.washerMarker}>
                  <AppIcon name="local-car-wash" size={14} color="#fff" />
                </View>
              </Marker>
            ) : null}
            {route.length > 1 ? (
              <Polyline
                coordinates={route.map((p) => ({
                  latitude: p.latitude,
                  longitude: p.longitude,
                }))}
                strokeColor={theme.accent.primary}
                strokeWidth={3}
              />
            ) : null}
          </MapView>
        </View>
      ) : (
        <View style={[s.mapBox, { backgroundColor: c.surfaceContainerLow }]}>
          <ActivityIndicator color={theme.accent.primary} />
        </View>
      )}
    </View>
  );
}

function CancelSheet({ visible, theme, onClose, onConfirm }) {
  const insets = useSafeAreaInsets();
  const c = theme.customer;
  const s = sheetStyles(theme);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await onConfirm(selected);
    } finally {
      setSubmitting(false);
      setSelected(null);
    }
  };

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
        style={[
          s.sheet,
          {
            backgroundColor: c.surfaceContainerLowest,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={s.grabber} />
        <Text style={s.sheetTitle}>Cancel booking</Text>
        <Text style={s.sheetSub}>Tell us why you’re cancelling (optional)</Text>

        <View style={{ marginTop: 12 }}>
          {CANCEL_REASONS.map((r) => {
            const sel = selected === r.key;
            return (
              <Pressable
                key={r.key}
                onPress={() => setSelected(r.key)}
                style={({ pressed }) => [
                  s.reasonRow,
                  sel && { backgroundColor: c.primaryBg },
                  pressed && { opacity: 0.92 },
                ]}
              >
                <View style={[s.radio, sel && s.radioSelected]}>
                  {sel ? <AppIcon name="check" size={12} color={theme.button.primary.text} /> : null}
                </View>
                <Text style={s.reasonText}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <TouchableOpacity
          style={[s.destructiveBtn, !selected && { opacity: 0.5 }]}
          onPress={confirm}
          disabled={!selected || submitting}
          activeOpacity={0.88}
        >
          {submitting ? (
            <ActivityIndicator color={c.error} />
          ) : (
            <Text style={s.destructiveBtnText}>Cancel booking</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={{ paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text.secondary }}>Keep it</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function RescheduleSheet({ visible, theme, initial, onClose, onConfirm }) {
  const insets = useSafeAreaInsets();
  const c = theme.customer;
  const s = sheetStyles(theme);
  const [iso, setIso] = useState(initial || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) setIso(initial || null);
  }, [visible, initial]);

  const confirm = async () => {
    if (!iso) return;
    setSubmitting(true);
    try {
      await onConfirm(iso);
    } finally {
      setSubmitting(false);
    }
  };

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
        style={[
          s.sheet,
          {
            backgroundColor: c.surfaceContainerLowest,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={s.grabber} />
        <Text style={s.sheetTitle}>Reschedule</Text>
        <Text style={s.sheetSub}>Pick a new date and time for your wash.</Text>
        <View style={{ marginTop: 14 }}>
          <DateTimeField
            value={iso}
            onChange={setIso}
            minimumDate={new Date()}
            label="New date & time"
          />
        </View>
        <TouchableOpacity
          style={[s.primaryBtn, !iso && { opacity: 0.5 }]}
          onPress={confirm}
          disabled={!iso || submitting}
          activeOpacity={0.88}
        >
          {submitting ? (
            <ActivityIndicator color={theme.button.primary.text} />
          ) : (
            <Text style={s.primaryBtnText}>Save changes</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={{ paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text.secondary }}>Keep current time</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    scroll: { paddingHorizontal: 20, paddingTop: 4 },
    heroCard: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
      padding: 16,
      ...theme.shadow.sm,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroPrice: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text.primary,
      marginTop: 12,
      letterSpacing: -0.4,
    },
    heroSub: {
      fontSize: 13,
      color: theme.text.secondary,
      marginTop: 4,
    },
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant + '80',
      padding: 16,
    },
    washerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    washerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.accent.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    washerName: { fontSize: 15, fontWeight: '700', color: theme.text.primary, letterSpacing: -0.2 },
    washerMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    ratingChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: 'rgba(245,158,11,0.12)',
    },
    ratingText: { fontSize: 11, fontWeight: '700', color: '#b45309' },
    washerArea: { fontSize: 12, color: theme.text.secondary, fontWeight: '500' },
    outlineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: theme.radius.full,
      borderWidth: 1.5,
      borderColor: theme.accent.primary,
      backgroundColor: c.surfaceContainerLowest,
    },
    outlineBtnText: { fontSize: 14, fontWeight: '700', color: theme.accent.primary },
    destructiveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: theme.radius.full,
      borderWidth: 1.5,
      borderColor: c.error,
      backgroundColor: c.surfaceContainerLowest,
    },
    destructiveBtnText: { fontSize: 14, fontWeight: '700', color: c.error },
    supportBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      padding: 12,
      borderRadius: 12,
      backgroundColor: c.surfaceContainerLow,
      marginTop: 18,
    },
    supportText: {
      flex: 1,
      fontSize: 12,
      color: theme.text.secondary,
      lineHeight: 18,
    },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: theme.text.primary },
    emptySub: {
      fontSize: 13,
      color: theme.text.secondary,
      marginTop: 6,
      textAlign: 'center',
    },
    trackingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 10,
    },
    trackingLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.muted,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    trackingEta: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.3,
      marginTop: 2,
    },
    liveChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: 'rgba(220,38,38,0.12)',
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.error,
    },
    liveText: {
      fontSize: 10,
      fontWeight: '800',
      color: c.error,
      letterSpacing: 0.6,
    },
    mapBox: {
      width: '100%',
      height: 200,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markerCustomer: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#fff',
      borderWidth: 3,
      borderColor: theme.accent.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markerDot: { width: 8, height: 8, borderRadius: 4 },
    washerMarker: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.accent.primary,
      borderWidth: 2,
      borderColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};

const sheetStyles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    grabber: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.outlineVariant,
      marginBottom: 12,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.3,
    },
    sheetSub: { fontSize: 13, color: theme.text.secondary, marginTop: 4 },
    reasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 12,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      backgroundColor: theme.accent.primary,
      borderColor: theme.accent.primary,
    },
    reasonText: { fontSize: 14, fontWeight: '500', color: theme.text.primary },
    destructiveBtn: {
      marginTop: 18,
      paddingVertical: 14,
      borderRadius: theme.radius.full,
      borderWidth: 1.5,
      borderColor: c.error,
      alignItems: 'center',
    },
    destructiveBtnText: { fontSize: 14, fontWeight: '700', color: c.error },
    primaryBtn: {
      marginTop: 18,
      paddingVertical: 14,
      borderRadius: theme.radius.full,
      backgroundColor: theme.accent.primary,
      alignItems: 'center',
    },
    primaryBtnText: { fontSize: 14, fontWeight: '700', color: theme.button.primary.text },
  });
};
