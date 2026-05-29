import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import {
  MapPin,
  MessageCircle,
  Copy,
  Crown,
  Car,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getJobTokens } from '../../../constants/jobTheme';
import {
  formatPayoutCurrency,
  formatCustomerTrustLine,
} from '../../../lib/partnerFormatters';
import { canDialPhone, normalizeForTel } from '../../../lib/partnerPhone';
import { formatScheduledTime } from '../../../lib/jobPhases';
import { openMapPin } from '../../../lib/openExternalMaps';

const COPY_FEEDBACK_MS = 1400;

function joinParts(parts, sep = ' · ') {
  return parts.filter((p) => p != null && String(p).trim()).join(sep);
}

/**
 * Premium customer card. Headed by the customer avatar with a premium badge
 * (when applicable). Body packs the operational data (vehicle, package,
 * scheduled time, payout) and field actions (message when available, maps, address).
 */
export default function CustomerInfoCard({ job, onOpenDetails }) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);
  const tokens = getJobTokens(isDark);
  const [copied, setCopied] = useState(false);

  if (!job) return null;
  const {
    customer = {},
    address = {},
    vehicle = {},
    package: pkg = {},
    scheduledAt,
    payoutCents,
    surgeBonusCents,
    currency: jobCurrency = 'INR',
  } = job;

  const trustLine = formatCustomerTrustLine({
    completedWashes: customer.completedWashes,
    rating: customer.rating,
  });
  const hasPhone = canDialPhone(customer.phone);
  const addressSubline = joinParts([address.line2, address.city]);
  const vehiclePrimary = joinParts([vehicle.label, vehicle.color]);
  const vehicleSecondary = joinParts([vehicle.type, vehicle.plate]);
  const packageItems =
    Array.isArray(pkg.items) && pkg.items.length > 0 ? pkg.items.join(' · ') : null;
  const durationMins = Number(pkg.durationMins);
  const scheduledLabel = joinParts([
    formatScheduledTime(scheduledAt),
    Number.isFinite(durationMins) ? `${Math.round(durationMins)} min` : null,
  ]);

  const handleMaps = async () => {
    Haptics.selectionAsync().catch(() => {});
    const { latitude, longitude } = address.coords || {};
    await openMapPin({
      latitude,
      longitude,
      label: customer.name || address.full || address.line1 || 'Customer',
    });
  };

  const handleCopy = async () => {
    Haptics.selectionAsync().catch(() => {});
    try {
      await Share.share({ message: address.full || address.line1 });
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  const handleMessage = () => {
    if (!hasPhone) return;
    Haptics.selectionAsync().catch(() => {});
    const n = normalizeForTel(customer.phone);
    if (!n) return;
    Linking.openURL(`sms:${n}`).catch(() => {});
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260 }}
      style={[
        styles.card,
        {
          backgroundColor: theme.customer.surfaceContainerLowest,
          borderColor: theme.customer.outlineVariant,
        },
        shadows.soft,
      ]}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onOpenDetails?.();
        }}
        disabled={!onOpenDetails}
        style={({ pressed }) => [styles.headerRow, pressed && onOpenDetails && { opacity: 0.94 }]}
        accessibilityRole="button"
        accessibilityLabel="View customer and job details"
      >
        <LinearGradient
          colors={isDark ? ['#1e3a8a', '#4338ca'] : ['#0ea5e9', '#6366f1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.avatar, shadows.rim]}
        >
          <Text style={styles.avatarText}>{customer.initial || '?'}</Text>
        </LinearGradient>
        <View style={styles.headerCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
              {customer.name || 'Customer'}
            </Text>
            {customer.premium ? (
              <View
                style={[
                  styles.premiumPill,
                  { backgroundColor: tokens.briefing.premium.bg },
                ]}
              >
                <Crown size={10} color={tokens.briefing.premium.fg} strokeWidth={2.6} />
                <Text style={[styles.premiumText, { color: tokens.briefing.premium.fg }]}>
                  Premium
                </Text>
              </View>
            ) : null}
          </View>
          {trustLine ? (
            <View style={styles.metaRow}>
              <Sparkles size={11} color={theme.text.muted} strokeWidth={2.4} />
              <Text style={[styles.metaText, { color: theme.text.muted }]} numberOfLines={1}>
                {trustLine}
              </Text>
            </View>
          ) : onOpenDetails ? (
            <Text style={[styles.tapHint, { color: theme.accent.primary }]}>
              Tap for full details
            </Text>
          ) : null}
        </View>
        <View style={styles.payoutCol}>
          <Text style={[styles.payoutLabel, { color: theme.text.muted }]}>Payout</Text>
          <Text style={[styles.payoutValue, { color: theme.text.primary }]}>
            {formatPayoutCurrency(payoutCents + (surgeBonusCents || 0), jobCurrency)}
          </Text>
          {surgeBonusCents ? (
            <Text style={[styles.payoutBonus, { color: tokens.briefing.warning.fg }]}>
              +{formatPayoutCurrency(surgeBonusCents, jobCurrency)} surge
            </Text>
          ) : null}
        </View>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: theme.customer.outlineVariant }]} />

      <View style={styles.metaList}>
        <View style={styles.metaItem}>
          <View style={[styles.metaIcon, { backgroundColor: tokens.briefing.info.bg }]}>
            <MapPin size={14} color={tokens.briefing.info.fg} strokeWidth={2.4} />
          </View>
          <View style={styles.metaTextCol}>
            <Text style={[styles.metaItemLabel, { color: theme.text.muted }]}>
              Service address
            </Text>
            <Text style={[styles.metaItemValue, { color: theme.text.primary }]} numberOfLines={2}>
              {address.line1 || address.full}
            </Text>
            {addressSubline ? (
              <Text style={[styles.metaItemSub, { color: theme.text.secondary }]} numberOfLines={1}>
                {addressSubline}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.metaItem}>
          <View style={[styles.metaIcon, { backgroundColor: tokens.briefing.neutral.bg }]}>
            <Car size={14} color={tokens.briefing.neutral.fg} strokeWidth={2.4} />
          </View>
          <View style={styles.metaTextCol}>
            <Text style={[styles.metaItemLabel, { color: theme.text.muted }]}>Vehicle</Text>
            <Text style={[styles.metaItemValue, { color: theme.text.primary }]} numberOfLines={1}>
              {vehiclePrimary || vehicle.label}
            </Text>
            {vehicleSecondary ? (
              <Text style={[styles.metaItemSub, { color: theme.text.secondary }]} numberOfLines={1}>
                {vehicleSecondary}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.metaItem}>
          <View style={[styles.metaIcon, { backgroundColor: tokens.briefing.premium.bg }]}>
            <Sparkles size={14} color={tokens.briefing.premium.fg} strokeWidth={2.4} />
          </View>
          <View style={styles.metaTextCol}>
            <Text style={[styles.metaItemLabel, { color: theme.text.muted }]}>Package</Text>
            <Text style={[styles.metaItemValue, { color: theme.text.primary }]}>
              {pkg.label || '—'}
            </Text>
            {packageItems ? (
              <Text style={[styles.metaItemSub, { color: theme.text.secondary }]} numberOfLines={2}>
                {packageItems}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.metaItem}>
          <View style={[styles.metaIcon, { backgroundColor: tokens.briefing.info.bg }]}>
            <Clock size={14} color={tokens.briefing.info.fg} strokeWidth={2.4} />
          </View>
          <View style={styles.metaTextCol}>
            <Text style={[styles.metaItemLabel, { color: theme.text.muted }]}>
              Scheduled
            </Text>
            <Text style={[styles.metaItemValue, { color: theme.text.primary }]}>
              {scheduledLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {hasPhone ? (
          <ActionButton icon={MessageCircle} label="Message" onPress={handleMessage} />
        ) : null}
        <ActionButton icon={MapPin} label="Maps" onPress={handleMaps} />
        <ActionButton
          icon={copied ? Check : Copy}
          label={copied ? 'Copied' : 'Address'}
          onPress={handleCopy}
        />
      </View>
    </MotiView>
  );
}

function ActionButton({ icon: Icon, label, onPress }) {
  const { isDark } = useTheme();
  const tokens = getJobTokens(isDark);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        {
          backgroundColor: tokens.briefing.info.bg,
        },
        pressed && { opacity: 0.92 },
      ]}
    >
      <Icon size={14} color={tokens.briefing.info.fg} strokeWidth={2.4} />
      <Text style={[styles.actionLabel, { color: tokens.briefing.info.fg }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerCol: { flex: 1, gap: 2 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
    flex: 1,
  },
  tapHint: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  payoutCol: { alignItems: 'flex-end' },
  payoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  payoutValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3, marginTop: 1 },
  payoutBonus: { fontSize: 10, fontWeight: '700', marginTop: 1 },
  divider: { height: 1 },
  metaList: { gap: 12 },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTextCol: { flex: 1, gap: 1 },
  metaItemLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metaItemValue: { fontSize: 13, fontWeight: '700', letterSpacing: -0.1 },
  metaItemSub: { fontSize: 11, fontWeight: '500' },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    flex: 1,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
});
