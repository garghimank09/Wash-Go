import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { MAP_PROVIDER } from '../../../lib/mapProvider';
import { shouldShowMapsSetupBanner, mapsSetupMessage } from '../../../lib/mapsRuntime';
import { useTheme } from '../../../context/ThemeContext';
import { getScheduleTokens } from '../../../constants/scheduleTheme';

const MAP_HEIGHT = 160;
const FALLBACK_REGION = {
  latitude: 28.4595,
  longitude: 77.0266,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function stopColor(tokens, status) {
  if (status === 'completed') return tokens.route.stopDone;
  if (status === 'in_progress' || status === 'en_route') return tokens.route.stopActive;
  return tokens.route.stopUpcoming;
}

function toCoordinate(stop) {
  if (stop?.lat == null || stop?.lng == null) return null;
  return { latitude: stop.lat, longitude: stop.lng };
}

export default function ScheduleRouteMap({ stops = [] }) {
  const { theme, isDark } = useTheme();
  const tokens = getScheduleTokens(isDark);
  const mapRef = useRef(null);
  const [userCoord, setUserCoord] = useState(null);
  const [layoutReady, setLayoutReady] = useState(false);

  const geoStops = useMemo(
    () => stops.filter((s) => s.lat != null && s.lng != null),
    [stops],
  );

  const coordinates = useMemo(
    () => geoStops.map((stop) => toCoordinate(stop)).filter(Boolean),
    [geoStops],
  );

  const polyline = coordinates;

  const initialRegion = useMemo(() => {
    const points = userCoord ? [...coordinates, userCoord] : coordinates;
    if (points.length === 0) return FALLBACK_REGION;
    const lats = points.map((p) => p.latitude);
    const lngs = points.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.02),
      longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.02),
    };
  }, [coordinates, userCoord]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setUserCoord({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!layoutReady || !mapRef.current || coordinates.length === 0) return undefined;
    const fitPoints = userCoord ? [...coordinates, userCoord] : coordinates;
    const fit = () => {
      try {
        mapRef.current?.fitToCoordinates(fitPoints, {
          edgePadding: { top: 36, right: 36, bottom: 36, left: 36 },
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
  }, [layoutReady, coordinates, userCoord]);

  if (shouldShowMapsSetupBanner()) {
    return (
      <View
        style={[
          styles.setupBanner,
          {
            backgroundColor: theme.customer.surfaceContainerLow,
            borderColor: theme.customer.outlineVariant,
          },
        ]}
      >
        <Text style={[styles.setupTitle, { color: theme.text.primary }]}>
          Map preview unavailable
        </Text>
        <Text style={[styles.setupBody, { color: theme.text.secondary }]}>
          {mapsSetupMessage()}
        </Text>
      </View>
    );
  }

  if (coordinates.length === 0) {
    return (
      <View
        style={[
          styles.fallback,
          {
            backgroundColor: theme.customer.surfaceContainerLow,
            borderColor: theme.customer.outlineVariant,
          },
        ]}
      >
        <Text style={[styles.fallbackTitle, { color: theme.text.primary }]}>
          Location unavailable
        </Text>
        <Text style={[styles.fallbackBody, { color: theme.text.secondary }]} numberOfLines={2}>
          {stops.map((s) => s.label).filter(Boolean).join(' · ') || 'No stops with map coordinates'}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.wrap, { backgroundColor: theme.customer.surfaceContainerLow }]}
      onLayout={() => setLayoutReady(true)}
    >
      <MapView
        ref={mapRef}
        provider={MAP_PROVIDER}
        style={styles.map}
        initialRegion={initialRegion}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={Boolean(userCoord)}
        pointerEvents="none"
        loadingEnabled
        loadingBackgroundColor={theme.customer.surfaceContainerLow}
        loadingIndicatorColor={tokens.route.stroke}
      >
        {polyline.length >= 2 ? (
          <>
            <Polyline
              coordinates={polyline}
              strokeColor={tokens.route.strokeGlow}
              strokeWidth={7}
              lineCap="round"
              lineJoin="round"
            />
            <Polyline
              coordinates={polyline}
              strokeColor={tokens.route.stroke}
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
            />
          </>
        ) : null}

        {geoStops.map((stop, index) => {
          const coordinate = toCoordinate(stop);
          if (!coordinate) return null;
          const fill = stopColor(tokens, stop.status);
          return (
            <Marker
              key={stop.id}
              coordinate={coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View style={[styles.marker, { backgroundColor: fill, borderColor: theme.customer.surfaceContainerLowest }]}>
                <Text style={styles.markerText}>{index + 1}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: MAP_HEIGHT,
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  setupBanner: {
    height: MAP_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 4,
  },
  setupTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  setupBody: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  fallback: {
    height: MAP_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 4,
  },
  fallbackTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  fallbackBody: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
});
