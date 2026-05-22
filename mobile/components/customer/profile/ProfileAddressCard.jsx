import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import AppIcon from '../AppIcon';

export default function ProfileAddressCard({ address, onPress }) {
  const { theme } = useTheme();
  const c = theme.customer;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.surfaceContainerLow,
          borderColor: address.primary ? theme.accent.primary : c.outlineVariant,
        },
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: c.primaryBg }]}>
        <AppIcon name={address.icon || 'place'} size={18} color={theme.accent.primary} />
      </View>
      <View style={styles.body}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.text.primary }]}>{address.label}</Text>
          {address.primary ? (
            <View style={[styles.primaryPill, { backgroundColor: 'rgba(6,182,212,0.12)' }]}>
              <Text style={[styles.primaryText, { color: theme.accent.dark }]}>Primary</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.addr, { color: theme.text.secondary }]} numberOfLines={2}>
          {address.address}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 14, fontWeight: '700' },
  primaryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  primaryText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  addr: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
});
