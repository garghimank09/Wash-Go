import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { useCustomerScrollEndPadding } from '../../hooks/useCustomerContentPadding';
import CustomerSkeleton from '../../components/customer/ui/CustomerSkeleton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import { useNewBooking } from '../../context/NewBookingContext';
import { authService } from '../../services/authService';
import { bookingService, decodeBookingMeta } from '../../services/bookingService';
import { onBookingsSync } from '../../lib/bookingSyncEvents';
import { garageService } from '../../services/garageService';
import { getPackage } from '../../services/pricingService';
import {
  deriveCustomerPhase,
  isPhaseActive,
  PHASE_SUBTITLE,
} from '../../lib/customerBookingPhase';
import AppIcon from '../../components/customer/AppIcon';
import PhasePill from '../../components/customer/PhasePill';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from '../../components/notifications/NotificationPanel';
import { WASH_POINTS } from '../../lib/rewardsMockData';

const STEP_LABEL = {
  vehicle: 'Pick vehicle',
  package: 'Pick package',
  schedule: 'Pick time',
  review: 'Review & confirm',
};

const CAR_HERO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCsQjW9J63VJw4ohuw8RWszAj96P5Cr_ACLo7ETTY5_KevPXglPGFbGfgRnonQkZoTBRPeoEHAW9akTdCggjoalgg5iVE1CKUVMgqWokFjQSvqOTwJ7Qxj8F-QCtTRM6GJCzgn4WE46pVOqzXCbvwGuAs4bz0v32HW5TH3fdJ1fQuNrRCfQXvrIUbqYzZfbfRpnS1iJJxlGX5dfN0J4mO7cTxslJbpueSYGENgXdfXZb1mn2ncRYJqA3oBNGiTFy11w1zvJcjoUYY4';

const RECOMMENDATIONS = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHFzNbrgQbWHwZKk-XdrspaOsdlSvbLPPrrKWAXhczXAdzs1s_HWPN_4BekVXosRcilFuHrXpbf26GChqJHR6DFOIvcng2pJxj6yhRroMYJlchPkeT1QukNmWASjuJhsrk6HaIVTZop_pUL7kiHBKDrs_1OIfdbNK9zi6T9lvvx_Zf_5MOwlisbWxhTIKK9AEm5BIIZ_sW-eyZOgIM65eLX1mRALzNnPluscXko3InLqAKqG0sn2R0HkgmhfTqh7U9lVeAkFL_Plg',
    badge: 'BEST VALUE',
    title: 'Deluxe Wash',
    sub: 'Exterior + wheels & trim',
    cta: 'Use in next booking',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_PZzvwJG-09pfdCIHG5VHo68J-ooE_pfeZsg-CDTi-mjPTTOKBJKdpQkKar5kJJ6xADCaAEEC55u18Mu2dY2WoPd5XRVOZjMFMjcVqNUpK6sY-ajSKcl6CaXVHbGa2afiItoTHWtONb4AmAwhIUI96o1UaK2vn1pl0rho11yvE4gZXrY1W4ky3b-m0nAGB0Napq8k8rH-Y5is51w_kH_fjRlCHiKTpA7p6mJukDHzqYTIslsQpnKo57qMpttNYyAf4BjTSPmsa1A',
    title: 'Interior Deep Clean',
    sub: 'Sanitize & detail',
    cta: 'From ₹899',
  },
];

function padStat(n) {
  return String(n).padStart(2, '0');
}

export default function Dashboard() {
  const { theme } = useTheme();
  const c = theme.customer;
  const router = useRouter();
  const { hasDraft, lastStep, reset: resetDraft } = useNewBooking();
  const { unreadCount, openPanel, refreshFromBookings } = useNotifications();
  const scrollEndPadding = useCustomerScrollEndPadding();
  const [user, setUser] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [u, vehicleList, bookingList] = await Promise.all([
        authService.getUser(),
        garageService.getVehicles().catch(() => []),
        bookingService.getBookings().catch(() => []),
      ]);
      setUser(u);
      setVehicles(vehicleList);
      setBookings(bookingList);
      refreshFromBookings(bookingList);
      const active = bookingList.find((b) =>
        isPhaseActive(deriveCustomerPhase(b))
      );
      setActiveBooking(active || null);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshFromBookings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const off = onBookingsSync(() => loadData());
    return off;
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const completedWashes = bookings.filter((b) => b.status === 'completed').length;
  const recentCompleted = bookings
    .filter((b) => b.status === 'completed')
    .slice(0, 2);
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const s = styles(theme);

  const overviewStats = [
    {
      icon: 'calendar-month',
      color: theme.customer.secondary,
      bg: theme.customer.secondaryBg,
      label: 'Bookings',
      value: padStat(bookings.length),
    },
    {
      icon: 'check-circle',
      color: theme.customer.tertiary,
      bg: theme.customer.tertiaryBg,
      label: 'Completed',
      value: padStat(completedWashes),
    },
    {
      icon: 'directions-car',
      color: theme.accent.primary,
      bg: theme.customer.primaryBg,
      label: 'Vehicles',
      value: padStat(vehicles.length),
    },
    {
      icon: 'stars',
      color: theme.customer.tertiary,
      bg: theme.customer.tertiaryBg,
      label: 'Rewards',
      value: new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(
        WASH_POINTS,
      ),
      unit: 'Pts',
      filled: true,
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <CustomerSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.headerWrap}>
        <BlurView intensity={60} tint={theme.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={s.header}>
          <Text style={s.logo}>
            Wash<Text style={s.logoAccent}>Go</Text>
          </Text>
          <Pressable style={s.iconBtn} hitSlop={8} onPress={openPanel}>
            <AppIcon name="notifications" color={theme.accent.primary} />
            {unreadCount > 0 ? <View style={s.notifDot} /> : null}
          </Pressable>
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
        <View style={s.section}>
          <Text style={s.greeting}>Hello, {firstName}</Text>
          <Text style={s.greetingSub}>Ready for a sparkling clean?</Text>
        </View>

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

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push('/new-wash/vehicle')}
          style={s.bookCardWrap}
        >
          <LinearGradient
            colors={[c.gradientStart, c.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.bookCard}
          >
            <View style={s.bookCardContent}>
              <Text style={s.bookCardTitle}>Book a wash</Text>
              <Text style={s.bookCardSub}>
                Fast, easy & reliable service at your doorstep.
              </Text>
              <View style={s.bookNowBtn}>
                <Text style={s.bookNowText}>Book Now</Text>
                <AppIcon name="arrow-forward" size={18} color={theme.accent.primary} />
              </View>
            </View>
            <View style={s.bookCardGlow} />
            <Image source={{ uri: CAR_HERO_URI }} style={s.bookCardCar} resizeMode="contain" />
          </LinearGradient>
        </TouchableOpacity>

        {activeBooking && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Active Booking</Text>
            <Pressable
              style={({ pressed }) => [
                s.card,
                s.activeCard,
                pressed && { opacity: 0.94 },
              ]}
              onPress={() => router.push(`/booking/${activeBooking.id}`)}
            >
              <View style={s.activeIconWrap}>
                <AppIcon
                  name="local-car-wash"
                  size={22}
                  color={theme.accent.primary}
                />
              </View>
              <View style={s.activeBody}>
                <PhasePill phase={deriveCustomerPhase(activeBooking)} size="sm" />
                <Text style={s.activeTitle} numberOfLines={1}>
                  {getPackage(decodeBookingMeta(activeBooking.notes).packageId)?.label || 'Wash'}
                </Text>
                <Text style={s.activeSub} numberOfLines={1}>
                  {PHASE_SUBTITLE[deriveCustomerPhase(activeBooking)]}
                </Text>
              </View>
              <View style={s.trackChip}>
                <Text style={s.trackChipText}>
                  Track
                </Text>
                <AppIcon name="chevron-right" size={14} color={theme.accent.primary} />
              </View>
            </Pressable>
          </View>
        )}

        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Overview</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/bookings')}>
              <Text style={s.linkBtn}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={s.overviewGrid}>
            {overviewStats.map((stat) => (
              <View key={stat.label} style={[s.card, s.statCard]}>
                <View style={[s.statIconBox, { backgroundColor: stat.bg }]}>
                  <AppIcon
                    name={stat.icon}
                    size={20}
                    color={stat.color}
                    filled={stat.filled}
                  />
                </View>
                <Text style={s.statLabel}>{stat.label}</Text>
                <Text style={s.statValue}>
                  {stat.value}
                  {stat.unit ? (
                    <Text style={s.statUnit}> {stat.unit}</Text>
                  ) : null}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionRowStart}>
            <AppIcon name="lightbulb" size={20} color={theme.accent.primary} />
            <Text style={[s.sectionTitle, { marginBottom: 0 }]}>Smart picks for you</Text>
          </View>
          <View style={[s.card, s.smartPicksWrap]}>
            <Text style={s.mutedBody}>Based on your garage and wash history.</Text>
            <View style={[s.card, s.smartPickCard]}>
              <View style={s.tipIconBox}>
                <AppIcon name="auto-awesome" color={theme.accent.primary} />
              </View>
              <View style={s.flex1}>
                <Text style={s.cardHeading}>Stack exterior + interior</Text>
                <Text style={s.mutedSmall}>
                  Book both in one visit when pollen or commute grime spikes — crews batch the
                  prep.
                </Text>
                <View style={s.openRow}>
                  <Text style={s.linkBtn}>OPEN</Text>
                  <AppIcon name="chevron-right" size={16} color={theme.accent.primary} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <View style={[s.card, s.plusCard]}>
            <View style={s.plusBadge}>
              <Text style={s.plusBadgeText}>POPULAR</Text>
            </View>
            <Text style={[s.sectionTitle, { color: theme.accent.primary }]}>WashGo Plus</Text>
            <View style={s.priceRow}>
              <Text style={s.priceBig}>₹399</Text>
              <Text style={s.priceUnit}>/mo</Text>
            </View>
            {['Priority scheduling', 'AI wash recap', 'Member pricing'].map((item) => (
              <View key={item} style={s.plusFeature}>
                <AppIcon name="check-circle" size={18} color={theme.accent.primary} />
                <Text style={s.plusFeatureText}>{item}</Text>
              </View>
            ))}
            <TouchableOpacity style={s.plusCta} activeOpacity={0.85}>
              <Text style={s.plusCtaText}>Join waitlist</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Recommended for you</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.recScroll}
          >
            {RECOMMENDATIONS.map((rec) => (
              <TouchableOpacity
                key={rec.title}
                style={[s.card, s.recCard]}
                activeOpacity={0.9}
                onPress={() => router.push('/new-wash/vehicle')}
              >
                <View style={s.recImageWrap}>
                  <Image source={{ uri: rec.img }} style={s.recImage} />
                  {rec.badge ? (
                    <View style={s.recBadge}>
                      <Text style={s.recBadgeText}>{rec.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={s.recBody}>
                  <Text style={s.cardHeading}>{rec.title}</Text>
                  <Text style={s.mutedSmall}>{rec.sub}</Text>
                  <Text style={s.recCta}>{rec.cta}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={s.section}>
          <View style={s.sectionRowStart}>
            <AppIcon name="auto-fix-high" size={20} color={theme.accent.primary} />
            <Text style={[s.sectionTitle, { marginBottom: 0 }]}>Vehicle care tips</Text>
          </View>
          <View style={[s.card, s.tipsWrap]}>
            <Text style={s.mutedBody}>
              Short reads tailored to how most WashGo drivers use their cars.
            </Text>
            {[
              {
                icon: 'wb-sunny',
                title: 'Dry climate weeks',
                desc: 'Dust builds faster on paint — a mid-week rinse keeps gloss longer between full washes.',
              },
              {
                icon: 'ac-unit',
                title: 'After rain',
                desc: 'Road film etches fastest when wet. Schedule within 48h of heavy rain for best results.',
              },
            ].map((tip) => (
              <View key={tip.title} style={s.tipRow}>
                <View style={s.tipIconBox}>
                  <AppIcon name={tip.icon} size={20} color={theme.accent.primary} />
                </View>
                <View style={s.flex1}>
                  <Text style={s.cardHeading}>{tip.title}</Text>
                  <Text style={s.mutedSmall}>{tip.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Wash History</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/bookings')}>
              <Text style={s.linkBtn}>Full history</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.card, s.historyCard]}>
            {recentCompleted.length > 0 ? (
              recentCompleted.map((b) => {
                const meta = decodeBookingMeta(b.notes);
                const pkg = getPackage(meta.packageId);
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={s.historyRow}
                    onPress={() => router.push(`/booking/${b.id}`)}
                  >
                    <View style={s.historyIconWrap}>
                      <AppIcon name="check-circle" size={22} color={theme.accent.primary} />
                    </View>
                    <View style={s.flex1}>
                      <Text style={s.cardHeading}>{pkg?.label || 'Completed wash'}</Text>
                      <Text style={s.mutedSmall} numberOfLines={1}>
                        {b.service_address || 'Wash completed'}
                      </Text>
                    </View>
                    <AppIcon name="chevron-right" size={20} color={theme.text.muted} />
                  </TouchableOpacity>
                );
              })
            ) : (
              <>
                <View style={s.historyEmptyIcon}>
                  <AppIcon name="history" size={32} color={theme.text.muted} />
                </View>
                <Text style={s.mutedBody}>
                  Completed washes will appear here as a timeline.
                </Text>
                <TouchableOpacity onPress={() => router.push('/new-wash/vehicle')}>
                  <Text style={[s.linkBtn, s.historyCta]}>Book your first wash</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/new-wash/vehicle')}
        style={s.fabWrap}
      >
        <LinearGradient
          colors={[c.gradientStart, c.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.fab}
        >
          <AppIcon name="add" size={32} color={theme.text.inverse} />
        </LinearGradient>
      </TouchableOpacity>

      <NotificationPanel />
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    headerWrap: {
      overflow: 'hidden',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.outlineVariant,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    iconBtn: {
      padding: 8,
      borderRadius: theme.radius.full,
      position: 'relative',
    },
    logo: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.5,
    },
    logoAccent: {
      color: theme.accent.primary,
    },
    notifDot: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.error,
      borderWidth: 2,
      borderColor: c.surface,
    },
    scroll: {
      paddingHorizontal: CUSTOMER_LAYOUT.screenPadding,
      paddingTop: 16,
      gap: CUSTOMER_LAYOUT.sectionGap + 10,
    },
    section: { gap: 8 },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionRowStart: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    greeting: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
    },
    greetingSub: {
      fontSize: 14,
      color: theme.text.secondary,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 8,
    },
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant + '50',
      ...theme.shadow.sm,
    },
    bookCardWrap: { borderRadius: theme.radius.lg, overflow: 'hidden', ...theme.shadow.md },
    bookCard: {
      borderRadius: theme.radius.lg,
      padding: 24,
      minHeight: 160,
      overflow: 'hidden',
    },
    bookCardContent: { zIndex: 2, maxWidth: '62%' },
    bookCardTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text.inverse,
      marginBottom: 4,
    },
    bookCardSub: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 20,
      marginBottom: 16,
    },
    bookNowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      backgroundColor: theme.text.inverse,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: theme.radius.full,
      ...theme.shadow.sm,
    },
    bookNowText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.accent.primary,
    },
    bookCardGlow: {
      position: 'absolute',
      right: -32,
      bottom: -32,
      width: 192,
      height: 192,
      borderRadius: 96,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    bookCardCar: {
      position: 'absolute',
      top: 16,
      right: -48,
      width: 200,
      height: 100,
      opacity: 0.45,
      transform: [{ rotate: '-5deg' }],
    },
    activeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 16,
      backgroundColor: c.surfaceContainerLow,
    },
    activeCardReview: {
      borderWidth: 1,
      borderColor: 'rgba(245,158,11,0.35)',
      backgroundColor: 'rgba(245,158,11,0.08)',
    },
    activeIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.primaryBgStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeBody: { flex: 1, gap: 4 },
    activeTitle: { fontSize: 15, fontWeight: '700', color: theme.text.primary, letterSpacing: -0.2 },
    activeSub: {
      fontSize: 12,
      color: theme.text.secondary,
    },
    trackChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: c.primaryBg,
    },
    trackChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.accent.primary,
    },
    resumeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      paddingRight: 8,
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
    linkBtn: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.accent.primary,
    },
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    statCard: {
      width: '47%',
      padding: 16,
    },
    statIconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.secondary,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text.primary,
      marginTop: 2,
    },
    statUnit: { fontSize: 12, fontWeight: '400' },
    smartPicksWrap: {
      padding: 16,
      backgroundColor: c.surfaceContainerLow,
      borderColor: theme.accent.primary + '33',
    },
    smartPickCard: {
      flexDirection: 'row',
      gap: 16,
      padding: 16,
      marginTop: 16,
    },
    tipIconBox: {
      backgroundColor: c.primaryBg,
      padding: 8,
      borderRadius: 8,
    },
    flex1: { flex: 1 },
    cardHeading: { fontSize: 14, fontWeight: '700', color: theme.text.primary },
    mutedBody: { fontSize: 14, color: theme.text.secondary, lineHeight: 20 },
    mutedSmall: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 4,
      lineHeight: 18,
    },
    openRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 2,
    },
    plusCard: {
      padding: 24,
      backgroundColor: c.plusBg,
      borderColor: theme.accent.primary + '33',
      overflow: 'hidden',
    },
    plusBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: theme.customer.secondary,
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderBottomLeftRadius: 8,
    },
    plusBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.text.inverse,
      letterSpacing: 1,
    },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 16 },
    priceBig: { fontSize: 24, fontWeight: '700', color: theme.text.primary },
    priceUnit: { fontSize: 12, color: theme.text.secondary },
    plusFeature: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    plusFeatureText: { fontSize: 14, color: theme.text.primary },
    plusCta: {
      marginTop: 16,
      paddingVertical: 12,
      borderRadius: theme.radius.full,
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.accent.primary + '33',
      alignItems: 'center',
    },
    plusCtaText: { fontSize: 14, fontWeight: '700', color: theme.accent.primary },
    recScroll: { gap: 16, paddingBottom: 8 },
    recCard: { width: 240, overflow: 'hidden', padding: 0 },
    recImageWrap: { height: 128, position: 'relative' },
    recImage: { width: '100%', height: '100%' },
    recBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.accent.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
    },
    recBadgeText: { fontSize: 10, fontWeight: '700', color: theme.text.inverse },
    recBody: { padding: 12 },
    recCta: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.accent.primary,
      marginTop: 8,
    },
    tipsWrap: { padding: 16, backgroundColor: c.surfaceContainerLow, gap: 16 },
    tipRow: { flexDirection: 'row', gap: 16 },
    historyCard: { padding: 16, alignItems: 'center' },
    historyEmptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    historyCta: { marginTop: 16 },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      paddingVertical: 8,
    },
    historyIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fabWrap: {
      position: 'absolute',
      bottom: 96,
      right: 24,
      zIndex: 40,
      ...theme.shadow.md,
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
