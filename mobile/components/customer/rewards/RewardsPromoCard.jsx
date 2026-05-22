import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import AppIcon from '../AppIcon';

export default function RewardsPromoCard({ promo, onPress }) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.92 }]}
    >
      <LinearGradient
        colors={promo.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{promo.badge}</Text>
        </View>
        <Text style={styles.title}>{promo.title}</Text>
        <Text style={styles.sub}>{promo.subtitle}</Text>
        <View style={styles.ctaRow}>
          <Text style={styles.cta}>View offer</Text>
          <AppIcon name="arrow-forward" size={16} color="#fff" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 200,
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
    marginTop: 4,
    lineHeight: 15,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  cta: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
