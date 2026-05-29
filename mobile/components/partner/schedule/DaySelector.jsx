import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getScheduleTokens } from '../../../constants/scheduleTheme';
import { usePartnerSchedule } from '../../../context/PartnerScheduleContext';

const PILL_WIDTH = 54;
const PILL_GAP = 6;

export default function DaySelector({ selectedKey, onSelect }) {
  const { theme, isDark } = useTheme();
  const tokens = getScheduleTokens(isDark);
  const shadows = getPartnerShadow(isDark);
  const { days, countBookingsForDate } = usePartnerSchedule();
  const scrollRef = useRef(null);

  useEffect(() => {
    const i = days.findIndex((d) => d.key === selectedKey);
    if (i < 0 || !scrollRef.current) return;
    const x = Math.max(0, i * (PILL_WIDTH + PILL_GAP) - PILL_WIDTH * 1.5);
    const id = setTimeout(() => {
      scrollRef.current?.scrollTo({ x, animated: false });
    }, 0);
    return () => clearTimeout(id);
  }, [selectedKey, days]);

  const handlePick = (key) => {
    if (key === selectedKey) return;
    Haptics.selectionAsync().catch(() => {});
    onSelect(key);
  };

  return (
    <View style={styles.outer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {days.map((d) => {
          const isActive = d.key === selectedKey;
          const bookingsCount = countBookingsForDate(d.key);
          const hasBookings = bookingsCount > 0;

          return (
            <Pressable
              key={d.key}
              onPress={() => handlePick(d.key)}
              accessibilityLabel={`${d.weekday} ${d.day}`}
              style={({ pressed }) => [
                styles.pill,
                {
                  width: PILL_WIDTH,
                  backgroundColor: tokens.daySelector.pillBg,
                  borderColor: d.isToday && !isActive
                    ? tokens.daySelector.todayRing
                    : tokens.daySelector.pillBorder,
                },
                isActive && Platform.OS === 'ios' && shadows.rim,
                pressed && !isActive && { opacity: 0.94 },
              ]}
            >
              {isActive ? (
                <LinearGradient
                  colors={tokens.daySelector.activeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Text
                style={[
                  styles.weekday,
                  {
                    color: isActive
                      ? tokens.daySelector.activeFg
                      : tokens.daySelector.pillMuted,
                  },
                ]}
              >
                {d.weekday.toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.day,
                  {
                    color: isActive
                      ? tokens.daySelector.activeFg
                      : tokens.daySelector.pillFg,
                  },
                ]}
              >
                {d.day}
              </Text>
              <View style={styles.dotRow}>
                {hasBookings ? (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isActive
                          ? '#ffffff'
                          : tokens.daySelector.dot,
                      },
                    ]}
                  />
                ) : (
                  <View style={styles.dotPlaceholder} />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingVertical: 8,
    paddingBottom: 10,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: PILL_GAP,
    alignItems: 'center',
  },
  pill: {
    height: 68,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  weekday: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  day: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  dotRow: {
    marginTop: 4,
    height: 5,
    width: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
  },
});
