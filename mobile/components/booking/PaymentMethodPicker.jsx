import { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, QrCode, Wallet } from 'lucide-react-native';
import SelectableCard from '../ui/SelectableCard';

const METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    subtitle: 'GPay, PhonePe, Paytm',
    Icon: QrCode,
    gradient: ['#0f766e', '#06b6d4'],
  },
  {
    id: 'card',
    label: 'Card',
    subtitle: 'Visa, Mastercard, RuPay',
    Icon: CreditCard,
    gradient: ['#4338ca', '#6366f1'],
  },
  {
    id: 'wallet',
    label: 'WashGo Wallet',
    subtitle: 'Demo balance — instant',
    Icon: Wallet,
    gradient: ['#b45309', '#f59e0b'],
  },
];

export const PAYMENT_METHOD_LABELS = {
  upi: 'UPI',
  card: 'Card',
  wallet: 'WashGo Wallet (demo)',
};

export default function PaymentMethodPicker({
  value,
  onChange,
  upiId,
  onUpiIdChange,
  theme,
  accentColor = '#06b6d4',
}) {
  const [upiFocused, setUpiFocused] = useState(false);
  const c = theme.customer;

  return (
    <View style={styles.wrap}>
      {METHODS.map((m) => {
        const selected = value === m.id;
        const Icon = m.Icon;
        return (
          <SelectableCard
            key={m.id}
            selected={selected}
            onPress={() => onChange(m.id)}
            borderRadius={18}
            contentStyle={styles.card}
            accessibilityLabel={`${m.label} payment method`}
          >
            <LinearGradient
              colors={selected ? m.gradient : ['#94a3b8', '#cbd5e1']}
              style={styles.iconWrap}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon size={22} color="#fff" strokeWidth={1.75} />
            </LinearGradient>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: theme.text.primary }]}>{m.label}</Text>
              <Text style={[styles.cardSub, { color: theme.text.muted }]}>{m.subtitle}</Text>
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: selected ? accentColor : c.outlineVariant,
                  backgroundColor: selected ? accentColor : 'transparent',
                },
              ]}
            />
          </SelectableCard>
        );
      })}

      {value === 'upi' ? (
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[styles.upiBox, { borderColor: c.outlineVariant, backgroundColor: c.surface }]}
        >
          <View style={styles.qrPlaceholder}>
            <QrCode size={48} color={accentColor} strokeWidth={1.25} />
            <Text style={[styles.qrHint, { color: theme.text.muted }]}>Scan to pay (demo)</Text>
          </View>
          <Text style={[styles.upiLabel, { color: theme.text.secondary }]}>Or enter UPI ID</Text>
          <TextInput
            value={upiId}
            onChangeText={onUpiIdChange}
            placeholder="name@upi"
            placeholderTextColor={theme.text.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setUpiFocused(true)}
            onBlur={() => setUpiFocused(false)}
            style={[
              styles.upiInput,
              {
                color: theme.text.primary,
                borderColor: upiFocused ? accentColor : c.outlineVariant,
                backgroundColor: c.surfaceContainerLowest,
              },
            ]}
          />
          <Text style={[styles.demoNote, { color: theme.text.muted }]}>
            Demo checkout — no real charge. Booking is confirmed via WashGo demo payment.
          </Text>
        </MotiView>
      ) : (
        <Text style={[styles.demoNote, { color: theme.text.muted, marginTop: 4 }]}>
          Demo only — no card or wallet is charged. Your booking is sent to partners after you pay.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  cardSub: { fontSize: 12, marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  upiBox: {
    marginTop: 4,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(6,182,212,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.15)',
    borderStyle: 'dashed',
  },
  qrHint: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  upiLabel: { fontSize: 13, fontWeight: '600' },
  upiInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  demoNote: { fontSize: 12, lineHeight: 17 },
});
