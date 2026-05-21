import { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '../../../context/ThemeContext';
import { getJobTokens } from '../../../constants/jobTheme';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import LiveEtaChip from './LiveEtaChip';

const MAP_HEIGHT = 220;
const FALLBACK_COORD = { latitude: 12.9116, longitude: 77.6473 };

/**
 * Live route map for the active job. Shows the polyline between washer and
 * customer with two markers; the washer marker is moved by parent-supplied
 * `washerCoord` (driven by the realtime stream) so we never animate via
 * setState here \u2014 only via the data flow.
 *
 * The card layers premium chrome on top of the map: a soft top fade, the
 * floating ETA chip, and a subtle pulse ring around the washer pin.
 */
export default function RouteMapCard({
  washerCoord,
  customerCoord,
  route,
  etaMinutes,
  distanceKm,
  phase,
  trafficLevel = 'light',
}) {
  const { isDark } = useTheme();
  const tokens = getJobTokens(isDark);
  const shadows = getPartnerShadow(isDark);
  const mapRef = useRef(null);

  // Build the polyline from the live tracking route; fall back to the
  // straight-line washer→customer pair if the route hasn't streamed yet.
  const polyline = useMemo(() => {
    if (Array.isArray(route) && route.length >= 2) return route;
    if (washerCoord && customerCoord) return [washerCoord, customerCoord];
    return [];
  }, [route, washerCoord, customerCoord]);

  const region = useMemo(() => {
    const points = polyline.length
      ? polyline
      : [washerCoord, customerCoord].filter(Boolean);
    if (points.length === 0) {
      return {
        latitude: FALLBACK_COORD.latitude,
        longitude: FALLBACK_COORD.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    const lats = points.map((c) => c.latitude);
    const lngs = points.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.9 || 0.02,
      longitudeDelta: (maxLng - minLng) * 1.9 || 0.02,
    };
  }, [polyline, washerCoord, customerCoord]);

  useEffect(() => {
    if (!mapRef.current || polyline.length < 2) return undefined;
    const fit = () => {
      try {
        mapRef.current?.fitToCoordinates(polyline, {
          edgePadding: { top: 60, right: 50, bottom: 100, left: 50 },
          animated: false,
        });
      } catch {
        /* ignore */
      }
    };
    if (Platform.OS === 'android') {
      const timer = setTimeout(fit, 400);
      return () => clearTimeout(timer);
    }
    fit();
    return undefined;
  }, [polyline]);

  const showWasher = phase === 'heading' || phase === 'accepted' || phase === 'on_the_way';

  return (
    <View style={[styles.outer, shadows.soft]}>
      <View style={[styles.mapWrap, { backgroundColor: tokens.map.mapBg }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          pitchEnabled={false}
          rotateEnabled={false}
          showsCompass={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          loadingEnabled
          loadingBackgroundColor={tokens.map.mapBg}
          loadingIndicatorColor={tokens.map.polyline}
        >
          {polyline.length >= 2 ? (
            <>
              <Polyline
                coordinates={polyline}
                strokeColor={tokens.map.polylineBg}
                strokeWidth={9}
                lineCap="round"
                lineJoin="round"
              />
              <Polyline
                coordinates={polyline}
                strokeColor={tokens.map.polyline}
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            </>
          ) : null}

          {customerCoord ? (
          <Marker
            coordinate={customerCoord}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.markerWrap}>
              <View
                style={[
                  styles.markerOuter,
                  { backgroundColor: tokens.map.customerPinRing },
                ]}
              />
              <View
                style={[styles.markerDot, { backgroundColor: tokens.map.customerPin }]}
              />
            </View>
          </Marker>
          ) : null}

          {showWasher && washerCoord ? (
            <Marker
              coordinate={washerCoord}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges
            >
              <View style={styles.markerWrap}>
                <View
                  style={[
                    styles.markerPulse,
                    { backgroundColor: tokens.map.washerPinRing },
                  ]}
                />
                <View
                  style={[
                    styles.markerOuter,
                    { backgroundColor: tokens.map.washerPinRing },
                  ]}
                />
                <View
                  style={[styles.markerDot, { backgroundColor: tokens.map.washerPin }]}
                />
              </View>
            </Marker>
          ) : null}
        </MapView>

        <LinearGradient
          pointerEvents="none"
          colors={[tokens.map.overlayTop, tokens.map.overlayBottom]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <MotiView
          from={{ opacity: 0, translateY: 4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 260 }}
          style={styles.chipWrap}
          pointerEvents="box-none"
        >
          <LiveEtaChip
            etaMinutes={etaMinutes}
            distanceKm={distanceKm}
            trafficLevel={trafficLevel}
          />
        </MotiView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden',
  },
  mapWrap: {
    height: MAP_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  map: { ...StyleSheet.absoluteFillObject },
  markerWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    opacity: 0.5,
  },
  markerOuter: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.4,
    borderColor: '#ffffff',
  },
  chipWrap: {
    position: 'absolute',
    bottom: 14,
    left: 14,
  },
});
