import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Navigation,
  Play,
  ChevronDown,
  MapPin,
  Timer,
  Route,
} from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getScheduleTokens, getScheduleStatus } from '../../../constants/scheduleTheme';
import { formatPayoutCurrency, formatBookingTime } from '../../../lib/partnerFormatters';
import { formatPartnerServiceDescriptor } from '../../../lib/partnerServiceDescriptor';
import { navigateToAddress } from '../../../lib/openExternalMaps';
import ScheduleStatusPill from './ScheduleStatusPill';

/** Navigation labels — opens the shared job workspace, not a lifecycle action. */
const ACTION_LABELS = {
  pending: 'Open job',
  confirmed: 'Open job',
  scheduled: 'Open job',
  en_route: 'Continue',
  in_progress: 'Continue',
  completed: 'View summary',
  cancelled: 'View',
};

export default function TimelineBookingCard({ booking, index = 0 }) {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const shadows = getPartnerShadow(isDark);
  const tokens = getScheduleTokens(isDark);
  const statusTokens = getScheduleStatus(booking.status, isDark);

  const [expanded, setExpanded] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const rotate = useSharedValue(0);

  const toggleExpanded = () => {
    Haptics.selectionAsync().catch(() => {});
    const next = !expanded;
    setExpanded(next);
    rotate.value = withTiming(next ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value * 180}deg` }],
  }));

  const handleNavigate = async () => {
    if (navigating) return;
    Haptics.selectionAsync().catch(() => {});
    setNavigating(true);
    try {
      await navigateToAddress({
        coords: booking.coords,
        address: booking.address,
        label: booking.address || booking.customer?.name || 'Customer',
      });
    } finally {
      setNavigating(false);
    }
  };

  const handlePrimaryAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (booking.id) {
      router.push(`/(partner)/job/${booking.id}`);
    }
  };

  const isCompleted = booking.status === 'completed';
  const actionLabel = ACTION_LABELS[booking.status] || 'Open job';
  const serviceDescriptor = formatPartnerServiceDescriptor(booking.packageLabel);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260, delay: 40 + index * 35 }}
      style={styles.row}
    >
      <View style={styles.spineCol}>
        <View style={[styles.spineLine, { backgroundColor: tokens.spine.line }]} />
        <View
          style={[
            styles.node,
            {
              backgroundColor: statusTokens.bg,
              borderColor: statusTokens.dot,
            },
          ]}
        >
          <View style={[styles.nodeInner, { backgroundColor: statusTokens.dot }]} />
        </View>
        <Text style={[styles.timeStrong, { color: theme.text.primary }]}>
          {formatBookingTime(booking.time)}
        </Text>
        {booking.durationMins ? (
          <Text style={[styles.timeDuration, { color: theme.text.muted }]}>
            {booking.durationMins}m
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.customer.surfaceContainerLowest,
            borderColor: theme.customer.outlineVariant,
          },
          shadows.rim,
        ]}
      >
        <Pressable
          onPress={toggleExpanded}
          style={({ pressed }) => [pressed && { opacity: 0.94 }]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={[styles.customer, { color: theme.text.primary }]} numberOfLines={1}>
                {booking.customer.name}
              </Text>
              {booking.vehicleLabel ? (
                <Text style={[styles.package, { color: theme.text.secondary }]} numberOfLines={1}>
                  {booking.vehicleLabel}
                </Text>
              ) : null}
            </View>
            <Animated.View style={chevronStyle}>
              <ChevronDown size={16} color={theme.text.muted} strokeWidth={2.4} />
            </Animated.View>
          </View>

          <View style={styles.addressRow}>
            <MapPin size={12} color={theme.text.muted} strokeWidth={2.4} />
            <Text style={[styles.address, { color: theme.text.secondary }]} numberOfLines={1}>
              {booking.address}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <ScheduleStatusPill status={booking.status} />
            {booking.etaMins ? (
              <View style={[styles.metaChip, { backgroundColor: theme.customer.primaryBg }]}>
                <Timer size={11} color={theme.accent.primary} strokeWidth={2.4} />
                <Text style={[styles.metaText, { color: theme.accent.primary }]}>
                  {booking.etaMins}m ETA
                </Text>
              </View>
            ) : null}
            {booking.distanceKm ? (
              <View style={[styles.metaChip, { backgroundColor: theme.customer.surfaceContainerLow }]}>
                <Route size={11} color={theme.text.secondary} strokeWidth={2.4} />
                <Text style={[styles.metaText, { color: theme.text.secondary }]}>
                  {booking.distanceKm} km
                </Text>
              </View>
            ) : null}
            <View style={styles.metaSpacer} />
            <View style={styles.payoutBlock}>
              <Text style={[styles.payout, { color: theme.text.primary }]} numberOfLines={1}>
                {formatPayoutCurrency(
                  booking.partnerPayoutCents ?? booking.priceCents,
                  booking.currency,
                )}
                {serviceDescriptor ? (
                  <Text style={[styles.payoutDescriptor, { color: theme.text.secondary }]}>
                    {' · '}
                    {serviceDescriptor}
                  </Text>
                ) : null}
              </Text>
            </View>
          </View>
        </Pressable>

        {expanded ? (
          <MotiView
            from={{ opacity: 0, translateY: -2 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 220 }}
            style={[styles.detail, { borderTopColor: theme.customer.outlineVariant }]}
          >
            {booking.vehicleLabel ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.text.muted }]}>
                  Vehicle
                </Text>
                <Text style={[styles.detailValue, { color: theme.text.primary }]} numberOfLines={1}>
                  {booking.vehicleLabel}
                </Text>
              </View>
            ) : null}
            {booking.customer.phoneMasked ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.text.muted }]}>
                  Phone
                </Text>
                <Text style={[styles.detailValue, { color: theme.text.primary }]}>
                  {booking.customer.phoneMasked}
                </Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                onPress={handleNavigate}
                disabled={navigating}
                style={[
                  styles.actionChip,
                  { backgroundColor: tokens.actionChip.bg },
                  navigating && { opacity: 0.7 },
                ]}
              >
                {navigating ? (
                  <ActivityIndicator size="small" color={tokens.actionChip.fg} />
                ) : (
                  <Navigation size={14} color={tokens.actionChip.fg} strokeWidth={2.4} />
                )}
                <Text style={[styles.actionLabel, { color: tokens.actionChip.fg }]}>
                  Navigate
                </Text>
              </Pressable>
              <Pressable
                onPress={handlePrimaryAction}
                style={[
                  styles.actionChip,
                  styles.actionChipPrimary,
                  {
                    backgroundColor: isCompleted
                      ? tokens.actionChip.bg
                      : tokens.actionChip.primaryBg,
                  },
                ]}
              >
                <Play
                  size={14}
                  color={isCompleted ? tokens.actionChip.fg : tokens.actionChip.primaryFg}
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    styles.actionLabel,
                    {
                      color: isCompleted
                        ? tokens.actionChip.fg
                        : tokens.actionChip.primaryFg,
                    },
                  ]}
                >
                  {actionLabel}
                </Text>
              </Pressable>
            </View>
          </MotiView>
        ) : null}
      </View>
    </MotiView>
  );
}

const SPINE_OFFSET = 64;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  spineCol: {
    width: SPINE_OFFSET,
    alignItems: 'center',
    paddingTop: 6,
  },
  spineLine: {
    position: 'absolute',
    top: 24,
    bottom: -14,
    left: SPINE_OFFSET / 2 - 1,
    width: 2,
    borderRadius: 1,
  },
  node: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeStrong: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  timeDuration: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerLeft: { flex: 1 },
  customer: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  package: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  address: { fontSize: 12, fontWeight: '500', flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  metaText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  metaSpacer: { flex: 1 },
  payoutBlock: { maxWidth: '52%', flexShrink: 1, alignItems: 'flex-end' },
  payout: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2, textAlign: 'right' },
  payoutDescriptor: { fontSize: 11, fontWeight: '600', letterSpacing: -0.05 },
  detail: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  detailValue: { fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'right' },
  actions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionChipPrimary: {
    flex: 1,
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: -0.1 },
});
