import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Car,
  Sparkles,
  Clock,
  Wallet,
  Copy,
} from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getJobTokens } from '../../../constants/jobTheme';
import { formatPayoutCurrency, formatCustomerTrustLine } from '../../../lib/partnerFormatters';
import { formatScheduledTime } from '../../../lib/jobPhases';
import { canDialPhone, normalizeForTel } from '../../../lib/partnerPhone';

function DetailRow({ icon: Icon, label, value, sub, tokens, theme }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: tokens.bg }]}>
        <Icon size={16} color={tokens.fg} strokeWidth={2.3} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, { color: theme.text.muted }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: theme.text.primary }]}>{value}</Text>
        {sub ? (
          <Text style={[styles.rowSub, { color: theme.text.secondary }]} numberOfLines={3}>
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Premium customer + booking context sheet — data from `GET /bookings/{id}` only (web parity).
 */
export default function CustomerJobDetailSheet({ visible, job, onClose }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tokens = getJobTokens(isDark);

  if (!job) return null;

  const { customer, address, vehicle, package: pkg, scheduledAt, briefing } = job;
  const trustLine = formatCustomerTrustLine({
    completedWashes: customer?.completedWashes,
    rating: customer?.rating,
  });
  const hasPhone = canDialPhone(customer?.phone);
  const bookingRef = job.bookingId
    ? `#${String(job.bookingId).slice(0, 8)}`
    : null;

  const openTel = () => {
    if (!hasPhone) return;
    const n = normalizeForTel(customer.phone);
    if (n) Linking.openURL(`tel:${n}`).catch(() => {});
  };

  const openSms = () => {
    if (!hasPhone) return;
    const n = normalizeForTel(customer.phone);
    if (n) Linking.openURL(`sms:${n}`).catch(() => {});
  };

  const openMaps = () => {
    const { latitude, longitude } = address?.coords || {};
    if (latitude == null || longitude == null) return;
    const label = encodeURIComponent(customer?.name || 'Customer');
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${label}@${latitude},${longitude}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    Linking.openURL(url).catch(() => {});
  };

  const copyAddress = () => {
    Haptics.selectionAsync().catch(() => {});
    const text = address?.full || address?.line1;
    if (text) Share.share({ message: text }).catch(() => {});
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.customer.surfaceContainerLowest,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: theme.customer.outlineVariant }]} />

        <View style={styles.header}>
          <Text style={[styles.sheetTitle, { color: theme.text.primary }]}>Customer & job</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <X size={20} color={theme.text.muted} strokeWidth={2.2} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <LinearGradient
            colors={isDark ? ['#1e3a8a', '#4338ca'] : ['#0ea5e9', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroInitial}>{customer?.initial || '?'}</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {customer?.name || 'Customer'}
            </Text>
            {bookingRef ? <Text style={styles.heroRef}>Booking {bookingRef}</Text> : null}
            {trustLine ? <Text style={styles.heroMeta}>{trustLine}</Text> : null}
          </LinearGradient>

          <View style={styles.actions}>
            {hasPhone ? (
              <>
                <Pressable
                  onPress={openTel}
                  style={[styles.actionBtn, { backgroundColor: tokens.briefing.info.bg }]}
                >
                  <Phone size={16} color={tokens.briefing.info.fg} strokeWidth={2.3} />
                  <Text style={[styles.actionLabel, { color: tokens.briefing.info.fg }]}>Call</Text>
                </Pressable>
                <Pressable
                  onPress={openSms}
                  style={[styles.actionBtn, { backgroundColor: tokens.briefing.info.bg }]}
                >
                  <MessageCircle size={16} color={tokens.briefing.info.fg} strokeWidth={2.3} />
                  <Text style={[styles.actionLabel, { color: tokens.briefing.info.fg }]}>
                    Message
                  </Text>
                </Pressable>
              </>
            ) : (
              <Text style={[styles.noPhone, { color: theme.text.muted }]}>
                Phone not available for this booking
              </Text>
            )}
            {address?.coords ? (
              <Pressable
                onPress={openMaps}
                style={[styles.actionBtn, { backgroundColor: tokens.briefing.info.bg }]}
              >
                <MapPin size={16} color={tokens.briefing.info.fg} strokeWidth={2.3} />
                <Text style={[styles.actionLabel, { color: tokens.briefing.info.fg }]}>Maps</Text>
              </Pressable>
            ) : null}
            {address?.line1 ? (
              <Pressable
                onPress={copyAddress}
                style={[styles.actionBtn, { backgroundColor: tokens.briefing.neutral.bg }]}
              >
                <Copy size={16} color={tokens.briefing.neutral.fg} strokeWidth={2.3} />
                <Text style={[styles.actionLabel, { color: tokens.briefing.neutral.fg }]}>
                  Address
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor: theme.customer.surface,
                borderColor: theme.customer.outlineVariant,
              },
            ]}
          >
            <DetailRow
              icon={Car}
              label="Vehicle"
              value={vehicle?.label || '—'}
              sub={[vehicle?.type, vehicle?.plate].filter(Boolean).join(' · ') || null}
              tokens={tokens.briefing.neutral}
              theme={theme}
            />
            <DetailRow
              icon={Sparkles}
              label="Package"
              value={pkg?.label || '—'}
              sub={
                Array.isArray(pkg?.items) && pkg.items.length
                  ? pkg.items.join(' · ')
                  : null
              }
              tokens={tokens.briefing.premium}
              theme={theme}
            />
            <DetailRow
              icon={Clock}
              label="Scheduled"
              value={formatScheduledTime(scheduledAt) || '—'}
              tokens={tokens.briefing.info}
              theme={theme}
            />
            <DetailRow
              icon={MapPin}
              label="Service address"
              value={address?.line1 || address?.full || '—'}
              sub={[address?.line2, address?.city].filter(Boolean).join(' · ') || null}
              tokens={tokens.briefing.info}
              theme={theme}
            />
            <DetailRow
              icon={Wallet}
              label="Your payout"
              value={formatPayoutCurrency(
                (job.payoutCents || 0) + (job.surgeBonusCents || 0),
                job.currency,
              )}
              tokens={tokens.briefing.premium}
              theme={theme}
            />
          </View>

          {briefing?.notes ? (
            <View
              style={[
                styles.notesCard,
                {
                  backgroundColor: theme.customer.primaryBg,
                  borderColor: theme.accent.primary + '35',
                },
              ]}
            >
              <Text style={[styles.notesTitle, { color: theme.text.primary }]}>Customer notes</Text>
              <Text style={[styles.notesBody, { color: theme.text.secondary }]}>
                {briefing.notes}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  closeBtn: { padding: 4 },
  scroll: { paddingHorizontal: 20, paddingBottom: 12 },
  hero: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  heroInitial: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    maxWidth: '100%',
  },
  heroRef: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionLabel: { fontSize: 13, fontWeight: '800' },
  noPhone: { fontSize: 12, fontWeight: '600', flex: 1 },
  detailsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 14,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: { fontSize: 14, fontWeight: '700' },
  rowSub: { fontSize: 12, lineHeight: 17 },
  notesCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  notesTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  notesBody: { fontSize: 13, lineHeight: 19 },
});
