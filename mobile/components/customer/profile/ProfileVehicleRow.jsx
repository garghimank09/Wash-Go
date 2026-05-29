import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import VehicleArt, { resolveBodyColor } from '../VehicleArt';

export default function ProfileVehicleRow({ vehicle, onPress }) {
  const { theme } = useTheme();
  const c = theme.customer;
  const bodyColor = resolveBodyColor(vehicle?.color, '#a5d4e6');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.surfaceContainerLowest,
          borderColor: c.outlineVariant,
        },
        pressed && { opacity: 0.9 },
      ]}
    >
      <VehicleArt width={72} height={40} bodyColor={bodyColor} accentColor={theme.accent.primary} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
          {vehicle.make} {vehicle.model}
        </Text>
        <Text style={[styles.plate, { color: theme.text.muted }]}>{vehicle.license_plate}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    padding: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 10,
    overflow: 'hidden',
  },
  body: { marginTop: 8, gap: 2 },
  title: { fontSize: 13, fontWeight: '700' },
  plate: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
});
