import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '../../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../../constants/customerTheme';
import AppIcon from '../AppIcon';

export default function ReferralCard({ copy, onShare }) {
  const { theme } = useTheme();
  const c = theme.customer;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: 280 }}
      style={[
        styles.wrap,
        { backgroundColor: c.surfaceContainerLowest, borderColor: c.outlineVariant },
      ]}
    >
      <LinearGradient
        colors={['rgba(79,70,229,0.08)', 'rgba(6,182,212,0.06)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.iconCol}>
        <LinearGradient colors={['#4f46e5', '#06b6d4']} style={styles.iconCircle}>
          <AppIcon name="group-add" size={28} color="#fff" />
        </LinearGradient>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{copy.title}</Text>
        <Text style={[styles.sub, { color: theme.text.muted }]}>{copy.subtitle}</Text>
        <View style={[styles.codeBox, { backgroundColor: c.surfaceContainerLow }]}>
          <Text style={[styles.code, { color: theme.accent.primary }]}>{copy.code}</Text>
        </View>
        <Pressable
          onPress={onShare}
          style={({ pressed }) => [
            styles.cta,
            pressed && { opacity: 0.9 },
          ]}
        >
          <LinearGradient
            colors={['#4f46e5', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>{copy.cta}</Text>
            <AppIcon name="share" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: CUSTOMER_LAYOUT.card.radius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    overflow: 'hidden',
    gap: 14,
  },
  iconCol: { justifyContent: 'center' },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 8 },
  title: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  sub: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
  codeBox: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  code: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  cta: { marginTop: 6, borderRadius: 14, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  ctaText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
