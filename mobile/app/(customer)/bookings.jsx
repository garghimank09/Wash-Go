import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  AppState,
  Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useCustomerScrollEndPadding } from '../../hooks/useCustomerContentPadding';
import CustomerSkeleton from '../../components/customer/ui/CustomerSkeleton';
import CustomerEmptyState from '../../components/customer/ui/CustomerEmptyState';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import { useNewBooking } from '../../context/NewBookingContext';
import { bookingService } from '../../services/bookingService';
import {
  deriveCustomerPhase,
  isPhaseActive,
} from '../../lib/customerBookingPhase';
import AppIcon from '../../components/customer/AppIcon';
import BookingCard from '../../components/customer/BookingCard';
import NewBookingFab from '../../components/customer/NewBookingFab';
import BookingFilterMenu from '../../components/customer/BookingFilterSheet';

const LIST_POLL_MS = 30000;

const STEP_LABEL = {
  vehicle: 'Pick vehicle',
  package: 'Pick package',
  schedule: 'Pick time',
  review: 'Review & confirm',
};

export default function Bookings() {
  const { theme } = useTheme();
  const router = useRouter();
  const scrollEndPadding = useCustomerScrollEndPadding();
  const { hasDraft, lastStep, reset: resetDraft } = useNewBooking();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const focusedRef = useRef(false);
  const appActiveRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Bookings load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      load();
      const sub = AppState.addEventListener('change', (state) => {
        appActiveRef.current = state === 'active';
      });
      const interval = setInterval(() => {
        if (focusedRef.current && appActiveRef.current) load();
      }, LIST_POLL_MS);
      return () => {
        focusedRef.current = false;
        sub.remove();
        clearInterval(interval);
      };
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const counts = {
    All: bookings.length,
    Active: bookings.filter((b) => isPhaseActive(deriveCustomerPhase(b))).length,
    Completed: bookings.filter((b) => b.status === 'completed').length,
    Cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') {
      return isPhaseActive(deriveCustomerPhase(b));
    }
    if (activeFilter === 'Completed') return b.status === 'completed';
    if (activeFilter === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  const s = styles(theme);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <CustomerSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.pageTitle}>My bookings</Text>
          {counts.Active > 0 ? (
            <Text style={s.subTitle}>
              {counts.Active} active {counts.Active === 1 ? 'booking' : 'bookings'}
            </Text>
          ) : (
            <Text style={s.subTitle}>Your wash history & active bookings</Text>
          )}
        </View>
        <View style={s.headerActions}>
          <NewBookingFab onPress={() => router.push('/new-wash/vehicle')} />
          <BookingFilterMenu
            selected={activeFilter}
            counts={counts}
            onSelect={setActiveFilter}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: scrollEndPadding + 24 }]}
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
              <Text style={s.resumeTitle}>Continue booking</Text>
              <Text style={s.resumeSub} numberOfLines={1}>
                {STEP_LABEL[lastStep] || 'In progress'}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push(`/new-wash/${lastStep || 'vehicle'}`)}
              style={s.resumeBtn}
            >
              <Text style={s.resumeBtnText}>Resume</Text>
            </Pressable>
            <Pressable onPress={() => resetDraft()} hitSlop={8} style={s.resumeDismiss}>
              <AppIcon name="close" size={18} color={theme.text.muted} />
            </Pressable>
          </View>
        ) : null}

        {filteredBookings.length === 0 ? (
          <CustomerEmptyState
            icon="local-car-wash"
            title={
              activeFilter === 'All' ? 'No bookings yet' : `No ${activeFilter.toLowerCase()} bookings`
            }
            body={
              activeFilter === 'All'
                ? 'Book your first wash to get started.'
                : 'Try a different filter or book a new wash.'
            }
            action={
              <CustomerPrimaryButton
                label="Book a wash"
                onPress={() => router.push('/new-wash/vehicle')}
              />
            }
          />
        ) : (
          filteredBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPress={() => router.push(`/booking/${b.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
    },
    subTitle: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    scroll: {
      paddingHorizontal: CUSTOMER_LAYOUT.screenPadding,
      paddingTop: 12,
    },
    resumeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      paddingRight: 8,
      marginBottom: 12,
      borderRadius: CUSTOMER_LAYOUT.card.radius,
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
    resumeSub: { fontSize: 11, color: theme.text.secondary, marginTop: 2 },
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
    emptyState: {
      alignItems: 'center',
      paddingTop: 48,
      paddingHorizontal: 24,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 6,
    },
    emptySub: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 22,
    },
    primaryBtn: {
      backgroundColor: theme.accent.primary,
      borderRadius: theme.radius.full,
      paddingVertical: 13,
      paddingHorizontal: 28,
      alignItems: 'center',
    },
    primaryBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
  });
};
