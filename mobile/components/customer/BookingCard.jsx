import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from './AppIcon';
import PhasePill from './PhasePill';
import { decodeBookingMeta, formatPriceCents } from '../../services/bookingService';
import { deriveCustomerPhase, isPhaseActive } from '../../lib/customerBookingPhase';
import { getPackage } from '../../services/pricingService';

function formatScheduled(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${date} • ${time}`;
}

export default function BookingCard({ booking, onPress }) {
  const { theme } = useTheme();
  const c = theme.customer;
  const s = styles(theme);

  const phase = deriveCustomerPhase(booking);
  const { packageId } = decodeBookingMeta(booking.notes);
  const pkg = getPackage(packageId);
  const active = isPhaseActive(phase);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.card,
        active && s.cardActive,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={s.topRow}>
        <PhasePill phase={phase} />
        <Text style={s.price}>{formatPriceCents(booking.price_cents, booking.currency)}</Text>
      </View>

      <Text style={s.title} numberOfLines={1}>
        {pkg?.label || 'Wash'}
      </Text>

      <View style={s.metaRow}>
        <AppIcon name="place" size={14} color={theme.text.muted} />
        <Text style={s.metaText} numberOfLines={1}>
          {booking.service_address || 'Address pending'}
        </Text>
      </View>

      <View style={s.metaRow}>
        <AppIcon name="schedule" size={14} color={theme.text.muted} />
        <Text style={s.metaText} numberOfLines={1}>
          {formatScheduled(booking.scheduled_at)}
        </Text>
      </View>

      <View style={s.footerRow}>
        <Text style={s.cta}>
          {active ? 'Track booking' : 'View details'}
        </Text>
        <AppIcon name="arrow-forward" size={16} color={theme.accent.primary} />
      </View>
    </Pressable>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant + '80',
      padding: 16,
      marginBottom: 12,
      ...theme.shadow.sm,
    },
    cardActive: {
      borderColor: theme.accent.primary + '60',
      ...theme.shadow.md,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    price: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.3,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    metaText: {
      flex: 1,
      fontSize: 12,
      color: theme.text.secondary,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
    },
    cta: { fontSize: 12, fontWeight: '700', color: theme.accent.primary, letterSpacing: 0.3 },
  });
};
