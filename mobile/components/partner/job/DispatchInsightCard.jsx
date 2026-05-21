import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { TrendingUp, Radio, Flame, Activity, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../context/ThemeContext';
import { getInsightBannerTokens } from '../../../constants/jobTheme';
import { getPartnerShadow } from '../../../constants/partnerTheme';

const ICONS = {
  surge: TrendingUp,
  dispatch: Radio,
  streak: Flame,
  peak: Activity,
};

/**
 * Horizontal list of operational insight banners (surge, dispatch ping,
 * streak, peak demand). Tap dismisses the card (passed via parent).
 */
export default function DispatchInsightCard({ alerts, onDismiss }) {
  const { isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);

  const items = useMemo(() => alerts || [], [alerts]);

  if (items.length === 0) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 4 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260 }}
      style={styles.outer}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
      >
        {items.map((alert) => {
          const tokens = getInsightBannerTokens(alert.key, isDark);
          const Icon = ICONS[alert.key] || Radio;
          return (
            <View
              key={alert.id}
              style={[styles.card, shadows.soft]}
            >
              <LinearGradient
                colors={tokens.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.inner}>
                <View style={styles.iconWrap}>
                  <Icon size={16} color="#ffffff" strokeWidth={2.4} />
                </View>
                <View style={styles.textCol}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {alert.title}
                    </Text>
                    {alert.badge ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{alert.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.body} numberOfLines={2}>
                    {alert.body}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    onDismiss?.(alert.id);
                  }}
                  hitSlop={8}
                  style={styles.dismiss}
                  accessibilityLabel="Dismiss"
                >
                  <X size={14} color="rgba(255,255,255,0.85)" strokeWidth={2.4} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginTop: 14,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    width: 280,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  body: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  dismiss: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
});
