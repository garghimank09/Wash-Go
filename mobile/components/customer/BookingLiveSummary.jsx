import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatCents } from '../../lib/formatCurrency';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';

export default function BookingLiveSummary({
  stepIndex = 1,
  totalSteps = 4,
  vehicleLabel = '—',
  packageLabel = '—',
  priceCents,
  currency = 'INR',
  pricingLoading = false,
}) {
  const { theme } = useTheme();
  const c = theme.customer;
  const s = styles(theme);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View>
          <Text style={s.kicker}>Live summary</Text>
          <Text style={s.step}>
            Step {stepIndex + 1} of {totalSteps}
          </Text>
        </View>
        <View style={s.estPill}>
          <Text style={s.estPillText}>Est.</Text>
        </View>
      </View>

      <View style={s.row}>
        <Text style={s.rowLabel}>Vehicle</Text>
        <Text style={s.rowValue} numberOfLines={2}>
          {vehicleLabel}
        </Text>
      </View>
      <View style={s.divider} />
      <View style={s.row}>
        <Text style={s.rowLabel}>Package</Text>
        <Text style={s.rowValue}>{packageLabel}</Text>
      </View>
      <View style={s.divider} />
      <View style={[s.row, s.rowLast]}>
        <Text style={s.rowLabel}>Estimate</Text>
        {pricingLoading ? (
          <ActivityIndicator size="small" color={theme.accent.primary} />
        ) : (
          <Text style={s.estimate}>{formatCents(priceCents, currency)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: CUSTOMER_LAYOUT.card.radius,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 16,
      ...theme.shadow.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    kicker: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    step: { fontSize: 12, color: theme.text.secondary, marginTop: 2 },
    estPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      backgroundColor: c.primaryBg,
      borderWidth: 1,
      borderColor: 'rgba(6,182,212,0.2)',
    },
    estPillText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.accent.dark,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 8,
    },
    rowLast: { alignItems: 'center' },
    rowLabel: { fontSize: 12, color: theme.text.muted, fontWeight: '500' },
    rowValue: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.primary,
      textAlign: 'right',
      flex: 1,
      maxWidth: '58%',
    },
    estimate: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.accent.primary,
      letterSpacing: -0.5,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.outlineVariant,
    },
  });
};
