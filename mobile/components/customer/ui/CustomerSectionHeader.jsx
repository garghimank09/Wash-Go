import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../../constants/customerTheme';

export default function CustomerSectionHeader({ title, meta, right }) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
        {meta ? (
          <Text style={[styles.meta, { color: theme.text.secondary }]}>{meta}</Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: CUSTOMER_LAYOUT.screenPadding,
    marginBottom: 12,
    gap: 12,
  },
  left: { flex: 1 },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  meta: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  right: { flexShrink: 0 },
});
