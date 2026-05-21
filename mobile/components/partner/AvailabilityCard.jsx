import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Zap, Hourglass, Coffee, Power } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerStatus } from '../../context/PartnerStatusContext';
import {
  PARTNER_STATUSES,
  getPartnerStatus,
  getPartnerShadow,
} from '../../constants/partnerTheme';
import { PARTNER_MOTION, partnerTiming } from '../../constants/partnerMotion';

const ICONS = { Zap, Hourglass, Coffee, Power };

const TABS = PARTNER_STATUSES;

export default function AvailabilityCard() {
  const { isDark } = useTheme();
  const { status, setStatus } = usePartnerStatus();
  const tokens = getPartnerStatus(status, isDark);
  const shadows = getPartnerShadow(isDark);

  const [baseStatus, setBaseStatus] = useState(status);
  const baseTokens = getPartnerStatus(baseStatus, isDark);
  const gradientFade = useSharedValue(1);

  const activeIndex = Math.max(0, TABS.indexOf(status));
  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useSharedValue(activeIndex);

  useEffect(() => {
    indicatorX.value = withTiming(
      activeIndex,
      partnerTiming(PARTNER_MOTION.duration.statusIndicator)
    );
  }, [activeIndex, indicatorX]);

  useEffect(() => {
    if (status === baseStatus) return;
    gradientFade.value = 0;
    gradientFade.value = withTiming(
      1,
      partnerTiming(PARTNER_MOTION.duration.statusGradient),
      (finished) => {
        if (finished) runOnJS(setBaseStatus)(status);
      }
    );
  }, [status, baseStatus, gradientFade]);

  const slotWidth = trackWidth > 0 ? trackWidth / TABS.length : 0;
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value * slotWidth }],
  }));

  const topGradientStyle = useAnimatedStyle(() => ({
    opacity: gradientFade.value,
  }));

  const Icon = ICONS[tokens.icon] || Zap;

  const handlePick = (id) => {
    if (id === status) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setStatus(id);
  };

  return (
    <View style={styles.outer}>
      <View style={[styles.card, shadows.soft]}>
        <LinearGradient
          colors={baseTokens.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[StyleSheet.absoluteFill, topGradientStyle]}>
          <LinearGradient
            colors={tokens.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <View style={styles.inner}>
          <View style={styles.headerRow}>
            <View style={styles.iconBubble}>
              <Icon size={20} color="#ffffff" strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{tokens.label}</Text>
              <Text style={styles.desc}>{tokens.description}</Text>
            </View>
          </View>

          <View
            style={styles.segWrap}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          >
            {slotWidth > 0 ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.segIndicator,
                  { width: slotWidth },
                  indicatorStyle,
                ]}
              />
            ) : null}
            <View style={styles.segRow}>
              {TABS.map((id) => {
                const isActive = id === status;
                const t = getPartnerStatus(id, isDark);
                return (
                  <Pressable
                    key={id}
                    onPress={() => handlePick(id)}
                    style={styles.segTab}
                    accessibilityLabel={`Set status to ${t.label}`}
                  >
                    <Text
                      style={[
                        styles.segText,
                        {
                          color: isActive
                            ? '#0f172a'
                            : 'rgba(255,255,255,0.78)',
                          fontWeight: isActive ? '800' : '600',
                        },
                      ]}
                    >
                      {t.shortLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 20,
    marginTop: 14,
  },
  card: {
    borderRadius: 26,
    overflow: 'hidden',
    minHeight: 156,
  },
  inner: {
    padding: 18,
    flex: 1,
    justifyContent: 'space-between',
    gap: 18,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  label: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  desc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    fontWeight: '500',
  },
  segWrap: {
    backgroundColor: 'rgba(15,23,42,0.18)',
    borderRadius: 18,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  segIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
  },
  segRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  segTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segText: { fontSize: 13, letterSpacing: -0.1 },
});
