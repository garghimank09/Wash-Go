import { useEffect } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import AppIcon from './AppIcon';

const FEATURE_ROW_HEIGHT = 22;
const FEATURE_GAP = 6;

export default function PackageCard({
  pkg,
  selected,
  expanded,
  priceLabel,
  onPress,
  onToggleExpand,
}) {
  const { theme } = useTheme();
  const progress = useSharedValue(expanded ? 1 : 0);
  const selectRing = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [expanded, progress]);

  useEffect(() => {
    selectRing.value = withTiming(selected ? 1 : 0, { duration: 220 });
  }, [selected, selectRing]);

  const featuresBlockStyle = useAnimatedStyle(() => {
    const count = pkg.features?.length || 0;
    const targetHeight = count * FEATURE_ROW_HEIGHT + (count > 0 ? FEATURE_GAP : 0);
    return {
      maxHeight: progress.value * targetHeight,
      opacity: progress.value,
      marginTop: progress.value * 10,
    };
  });

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: selected
      ? theme.accent.primary
      : theme.customer.outlineVariant,
  }));

  const c = theme.customer;
  const s = styles(theme);
  const isPopular = pkg.badge === 'Popular';
  const isBestValue = pkg.badge === 'Best value';

  return (
    <Animated.View style={[s.card, borderStyle]}>
      {selected ? (
        <LinearGradient
          colors={['rgba(6,182,212,0.08)', 'rgba(6,182,212,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [s.pressBody, pressed && { opacity: 0.96 }]}
      >
        <View style={s.headerRow}>
          <View style={[s.iconWrap, selected && s.iconWrapActive]}>
            <AppIcon
              name={pkg.icon || 'local-car-wash'}
              size={22}
              color={selected ? theme.button.primary.text : theme.accent.primary}
            />
          </View>

          {pkg.badge ? (
            <View
              style={[
                s.badgePill,
                isPopular && s.badgePopular,
                isBestValue && s.badgeBest,
              ]}
            >
              <Text
                style={[
                  s.badgeText,
                  isPopular && s.badgeTextPopular,
                  isBestValue && s.badgeTextBest,
                ]}
              >
                {pkg.badge}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <Pressable
            onPress={onToggleExpand}
            hitSlop={12}
            style={s.chevronBtn}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse features' : 'Expand features'}
          >
            <Animated.View style={chevronStyle}>
              <AppIcon name="expand-more" size={22} color={theme.text.muted} />
            </Animated.View>
          </Pressable>
        </View>

        <Text style={s.title}>{pkg.label}</Text>
        <Text style={s.desc}>{pkg.desc}</Text>

        <Animated.View style={[s.featuresWrap, featuresBlockStyle]}>
          {pkg.features?.map((f) => (
            <View key={f} style={s.featureRow}>
              <View style={s.dot} />
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Estimate</Text>
          <Text style={[s.price, selected && { color: theme.accent.primary }]}>
            {priceLabel}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: CUSTOMER_LAYOUT.card.radius,
      borderWidth: 1.5,
      overflow: 'hidden',
    },
    pressBody: { padding: 18 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapActive: { backgroundColor: theme.accent.primary },
    badgePill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      backgroundColor: c.surface,
    },
    badgePopular: { backgroundColor: 'rgba(6,182,212,0.12)' },
    badgeBest: { backgroundColor: 'rgba(245,158,11,0.12)' },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: theme.text.muted,
    },
    badgeTextPopular: { color: theme.accent.dark },
    badgeTextBest: { color: '#B45309' },
    chevronBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.2,
    },
    desc: {
      fontSize: 13,
      color: theme.text.secondary,
      marginTop: 4,
    },
    featuresWrap: { overflow: 'hidden' },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.accent.primary,
    },
    featureText: { fontSize: 12, color: theme.text.secondary, flex: 1 },
    priceRow: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceLabel: {
      fontSize: 11,
      color: theme.text.muted,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    price: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
    },
  });
};
