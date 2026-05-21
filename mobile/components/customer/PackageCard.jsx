import { useEffect, useRef } from 'react';
import { Pressable, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import AppIcon from './AppIcon';

export default function PackageCard({
  pkg,
  selected,
  priceLabel,
  onPress,
  recommended,
}) {
  const { theme } = useTheme();
  const ring = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(ring, {
      toValue: selected ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [selected, ring]);

  const c = theme.customer;
  const s = styles(theme);

  return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          s.card,
          selected && s.cardSelected,
          pressed && { opacity: 0.94 },
        ]}
      >
        {selected ? (
          <LinearGradient
            colors={[
              'rgba(6,182,212,0.06)',
              'rgba(6,182,212,0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        <View style={s.headerRow}>
          <View style={[s.iconWrap, selected && s.iconWrapActive]}>
            <AppIcon
              name="local-car-wash"
              size={22}
              color={selected ? theme.button.primary.text : theme.accent.primary}
            />
          </View>
          {recommended ? (
            <View style={s.recommendedPill}>
              <Text style={s.recommendedText}>Recommended</Text>
            </View>
          ) : null}
          <Animated.View
            style={[
              s.check,
              {
                opacity: ring,
                transform: [
                  {
                    scale: ring.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <AppIcon name="check" size={14} color={theme.button.primary.text} />
          </Animated.View>
        </View>

        <Text style={s.title}>{pkg.label}</Text>
        <Text style={s.desc}>{pkg.desc}</Text>

        {pkg.features?.length ? (
          <View style={s.features}>
            {pkg.features.map((f) => (
              <View key={f} style={s.featureRow}>
                <View style={s.dot} />
                <Text style={s.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={s.priceRow}>
          <Text style={s.priceLabel}>From</Text>
          <Text style={[s.price, selected && { color: theme.accent.primary }]}>
            {priceLabel}
          </Text>
        </View>
      </Pressable>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: CUSTOMER_LAYOUT.card.radius,
      borderWidth: 1.5,
      borderColor: c.outlineVariant,
      padding: 18,
      overflow: 'hidden',
    },
    cardSelected: {
      borderColor: theme.accent.primary,
      ...theme.shadow.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
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
    recommendedPill: {
      flex: 1,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      backgroundColor: c.primaryBg,
      alignItems: 'flex-start',
    },
    recommendedText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.accent.dark,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    check: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.accent.primary,
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
    features: { marginTop: 12, gap: 6 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.accent.primary,
    },
    featureText: { fontSize: 12, color: theme.text.secondary },
    priceRow: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceLabel: { fontSize: 11, color: theme.text.muted, fontWeight: '600', letterSpacing: 0.4 },
    price: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
    },
  });
};
