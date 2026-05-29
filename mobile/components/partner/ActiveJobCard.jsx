import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { MapPin, Navigation, Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPartnerShadow } from '../../constants/partnerTheme';
import { formatPayoutCurrency, formatOptionalNumber } from '../../lib/partnerFormatters';
import { formatPartnerServiceDescriptor } from '../../lib/partnerServiceDescriptor';

const PHASE_LABEL = {
  searching: 'Searching',
  awaiting_acceptance: 'Awaiting',
  accepted: 'Accepted',
  on_the_way: 'On the way',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const PHASE_PALETTE = {
  light: {
    accepted: { fg: '#4338ca', bg: 'rgba(99,102,241,0.12)' },
    on_the_way: { fg: '#0891b2', bg: 'rgba(6,182,212,0.16)' },
    in_progress: { fg: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
    awaiting_acceptance: { fg: '#b45309', bg: 'rgba(245,158,11,0.16)' },
    searching: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)' },
    completed: { fg: '#047857', bg: 'rgba(16,185,129,0.14)' },
    cancelled: { fg: '#c2410c', bg: 'rgba(248,113,113,0.14)' },
  },
  dark: {
    accepted: { fg: '#a5b4fc', bg: 'rgba(129,140,248,0.18)' },
    on_the_way: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.18)' },
    in_progress: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.18)' },
    awaiting_acceptance: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.18)' },
    searching: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.16)' },
    completed: { fg: '#34d399', bg: 'rgba(52,211,153,0.18)' },
    cancelled: { fg: '#fb923c', bg: 'rgba(251,146,60,0.16)' },
  },
};

/** Map the booking API status to a UI phase if the card does not provide one. */
function statusToPhase(status) {
  switch (status) {
    case 'in_progress':
      return 'in_progress';
    case 'confirmed':
      return 'accepted';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'searching';
  }
}

export default function ActiveJobCard({ job, index = 0, onPress }) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);
  const phaseKey = job.phase || statusToPhase(job.status);
  const phaseColors = (isDark ? PHASE_PALETTE.dark : PHASE_PALETTE.light)[phaseKey] ||
    PHASE_PALETTE.light.accepted;
  const distanceKm = Number.isFinite(job.distanceKm) ? job.distanceKm : null;
  const etaMinutes = Number.isFinite(job.etaMinutes) ? job.etaMinutes : null;
  const progress = Number.isFinite(job.progress) ? Math.max(0, Math.min(1, job.progress)) : 0;
  const serviceDescriptor = formatPartnerServiceDescriptor(job.packageLabel);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260, delay: 50 + index * 40 }}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onPress?.(job);
        }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.customer.surfaceContainerLowest,
            borderColor: theme.customer.outlineVariant,
          },
          shadows.rim,
          pressed && { opacity: 0.94 },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: theme.customer.primaryBg }]}>
            <Text style={[styles.avatarText, { color: theme.accent.primary }]}>
              {job.customer.initial}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.customer, { color: theme.text.primary }]} numberOfLines={1}>
              {job.customer.name}
            </Text>
            {job.vehicleLabel ? (
              <Text style={[styles.pkg, { color: theme.text.secondary }]} numberOfLines={1}>
                {job.vehicleLabel}
              </Text>
            ) : null}
          </View>
          <View style={[styles.phasePill, { backgroundColor: phaseColors.bg }]}>
            <Text style={[styles.phaseText, { color: phaseColors.fg }]}>
              {PHASE_LABEL[phaseKey] || phaseKey}
            </Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <MapPin size={14} color={theme.text.muted} strokeWidth={2} />
          <Text style={[styles.address, { color: theme.text.secondary }]} numberOfLines={1}>
            {job.address}
          </Text>
        </View>

        <View style={styles.metricsRow}>
          {distanceKm != null && Number.isFinite(Number(distanceKm)) ? (
            <View style={styles.metricChip}>
              <Navigation size={12} color={theme.accent.primary} strokeWidth={2.4} />
              <Text style={[styles.metricText, { color: theme.text.primary }]}>
                {formatOptionalNumber(distanceKm, { fractionDigits: 1 })} km
              </Text>
            </View>
          ) : null}
          {etaMinutes != null && Number.isFinite(Number(etaMinutes)) ? (
            <View style={styles.metricChip}>
              <Clock size={12} color={theme.accent.primary} strokeWidth={2.4} />
              <Text style={[styles.metricText, { color: theme.text.primary }]}>
                {etaMinutes}m ETA
              </Text>
            </View>
          ) : null}
          <View style={{ flex: 1 }} />
          <View style={styles.payoutCol}>
            <Text
              style={[styles.price, { color: theme.text.primary }]}
              numberOfLines={1}
            >
              {formatPayoutCurrency(job.partnerPayoutCents ?? job.priceCents, job.currency)}
              {serviceDescriptor ? (
                <Text style={[styles.serviceDescriptor, { color: theme.text.secondary }]}>
                  {' · '}
                  {serviceDescriptor}
                </Text>
              ) : null}
            </Text>
          </View>
          <ChevronRight size={18} color={theme.text.muted} strokeWidth={2} />
        </View>

        {progress > 0 ? (
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: theme.customer.outlineVariant },
            ]}
          >
            <LinearGradient
              colors={[theme.customer.gradientStart, theme.customer.gradientEnd]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]}
            />
          </View>
        ) : null}
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 12,
    overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800' },
  customer: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  pkg: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  phasePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  phaseText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  address: { fontSize: 13, flex: 1, fontWeight: '500' },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: { fontSize: 12, fontWeight: '700' },
  payoutCol: {
    maxWidth: '58%',
    flexShrink: 1,
    alignItems: 'flex-end',
  },
  price: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3, textAlign: 'right' },
  serviceDescriptor: { fontSize: 12, fontWeight: '600', letterSpacing: -0.1 },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 999 },
});
