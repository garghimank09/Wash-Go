import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { MAP_PROVIDER } from '../../lib/mapProvider';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MapPin, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPartnerSurge } from '../../constants/partnerTheme';
import CardSurface from '../ui/CardSurface';

/**
 * Live-offer summary card. The number of nearby requests is driven by the
 * `/bookings/offers` feed (passed in as `nearbyRequests`); surge data is a
 * future feature — the current backend does not expose it, so we only
 * render the multiplier badge when {@link surgeMultiplier} is provided.
 */
export default function LiveZoneCard({
  onPress,
  nearbyRequests = 0,
  surgeMultiplier = null,
  serviceArea = null,
  center = { latitude: 12.9116, longitude: 77.6473 },
}) {
  const { theme, isDark } = useTheme();
  const surge = getPartnerSurge(isDark);
  const c = theme.customer;

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.out(Easing.cubic) }),
      -1,
      false
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.28 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.35 }],
  }));

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress?.();
  };

  return (
    <CardSurface
      onPress={handlePress}
      borderRadius={24}
      backgroundColor={c.surfaceContainerLowest}
      shadow="soft"
      portal="partner"
      style={styles.outer}
      accessibilityLabel="View open offers in your zone"
    >
      <View style={styles.mapWrap}>
        <MapView
          provider={MAP_PROVIDER}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: center.latitude,
            longitude: center.longitude,
            latitudeDelta: 0.018,
            longitudeDelta: 0.018,
          }}
          pointerEvents="none"
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
        >
          <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.markerWrap}>
              <Animated.View
                style={[
                  styles.markerPulse,
                  { backgroundColor: surge.pulseRing },
                  pulseStyle,
                ]}
              />
              <View style={[styles.markerDot, { backgroundColor: surge.accent }]} />
            </View>
          </Marker>
        </MapView>
        <LinearGradient
          colors={[
            isDark ? 'rgba(15,23,42,0.0)' : 'rgba(255,255,255,0.0)',
            isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.92)',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      <View style={[styles.body, { backgroundColor: c.surfaceContainerLowest }]}>
        <View style={styles.headerRow}>
          {surgeMultiplier ? (
            <View style={[styles.surgeBadge, { backgroundColor: surge.badgeBg }]}>
              <TrendingUp size={12} color={surge.badgeFg} strokeWidth={2.4} />
              <Text style={[styles.surgeBadgeText, { color: surge.badgeFg }]}>
                {surgeMultiplier}× surge
              </Text>
            </View>
          ) : (
            <View />
          )}
          <ChevronRight size={18} color={theme.text.muted} strokeWidth={2} />
        </View>

        <View style={styles.titleRow}>
          <MapPin size={16} color={theme.accent.primary} strokeWidth={2.4} />
          <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
            {serviceArea || 'Your live zone'}
          </Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: theme.text.primary }]}>
              {nearbyRequests}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>
              Open offers
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: theme.text.primary }]}>
              Tap to view
            </Text>
            <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>
              Accept new jobs
            </Text>
          </View>
        </View>
      </View>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 20,
    marginTop: 14,
  },
  mapWrap: {
    height: 110,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#dbeafe',
  },
  markerWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  body: {
    padding: 16,
    paddingTop: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  surgeBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, flex: 1 },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  metric: { flex: 1, gap: 2 },
  metricValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  metricLabel: { fontSize: 11, fontWeight: '500' },
  divider: { width: 1, height: 28 },
});
