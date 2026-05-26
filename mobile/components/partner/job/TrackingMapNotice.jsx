import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';

/** Soft banner when live map tracking fails — job detail still works (web parity). */
export default function TrackingMapNotice({ message }) {
  const { theme } = useTheme();
  if (!message) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: 'rgba(245,158,11,0.12)',
          borderColor: 'rgba(245,158,11,0.35)',
        },
      ]}
    >
      <MapPin size={14} color="#b45309" strokeWidth={2.3} />
      <Text style={[styles.text, { color: theme.text.secondary }]}>
        Map unavailable: {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  text: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600' },
});
