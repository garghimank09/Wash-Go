import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import MapView from 'react-native-maps';
import { MAP_PROVIDER } from '../../lib/mapProvider';
import { shouldShowMapsSetupBanner, mapsSetupMessage } from '../../lib/mapsRuntime';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from './AppIcon';

const DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const ZOOM_DELTA = 0.01;
const COORD_EPSILON = 0.00005;

function coordsEqual(a, b) {
  if (!a || !b) return false;
  return (
    Math.abs(a.latitude - b.latitude) < COORD_EPSILON &&
    Math.abs(a.longitude - b.longitude) < COORD_EPSILON
  );
}

function regionFromCoords(lat, lng, delta = ZOOM_DELTA) {
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

async function reverseGeocode(lat, lng) {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (!places?.length) return null;
    const p = places[0];
    return [p.name, p.street, p.district, p.city, p.region]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(', ');
  } catch {
    return null;
  }
}

export default function MapPicker({
  latitude,
  longitude,
  onChange,
  onResolveAddress,
  height = 240,
  autoLocateOnMount = false,
}) {
  const { theme } = useTheme();
  const mapRef = useRef(null);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const autoLocatedRef = useRef(false);
  const isUserPanningRef = useRef(false);
  const isProgrammaticMoveRef = useRef(false);
  const lastEmittedCoordsRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onResolveAddressRef = useRef(onResolveAddress);
  const c = theme.customer;
  const showSetupBanner = shouldShowMapsSetupBanner();

  const hasPin = latitude != null && longitude != null;

  const [region, setRegion] = useState(() =>
    hasPin ? regionFromCoords(latitude, longitude) : DEFAULT_REGION,
  );

  useEffect(() => {
    onChangeRef.current = onChange;
    onResolveAddressRef.current = onResolveAddress;
  }, [onChange, onResolveAddress]);

  const emitCoords = useCallback(async (lat, lng, resolveAddress = true) => {
    const next = { latitude: lat, longitude: lng };
    if (coordsEqual(lastEmittedCoordsRef.current, next)) return;
    lastEmittedCoordsRef.current = next;
    onChangeRef.current?.(next);
    if (resolveAddress && onResolveAddressRef.current) {
      const text = await reverseGeocode(lat, lng);
      if (text) onResolveAddressRef.current(text);
    }
  }, []);

  /** Sync map when parent sets coords (search / geocode), not while user pans. */
  useEffect(() => {
    if (!hasPin || isUserPanningRef.current) return;
    const next = { latitude, longitude };
    if (coordsEqual(lastEmittedCoordsRef.current, next)) return;

    const nextRegion = regionFromCoords(latitude, longitude);
    setRegion(nextRegion);
    lastEmittedCoordsRef.current = next;

    if (mapReady && mapRef.current) {
      isProgrammaticMoveRef.current = true;
      mapRef.current.animateToRegion(nextRegion, 320);
    }
  }, [latitude, longitude, hasPin, mapReady]);

  const handleRegionChange = useCallback(() => {
    isUserPanningRef.current = true;
  }, []);

  const handleRegionChangeComplete = useCallback(
    async (nextRegion) => {
      isUserPanningRef.current = false;
      setRegion(nextRegion);
      if (isProgrammaticMoveRef.current) {
        isProgrammaticMoveRef.current = false;
        return;
      }
      const { latitude: lat, longitude: lng } = nextRegion;
      await emitCoords(lat, lng, true);
    },
    [emitCoords],
  );

  const handleUseMyLocation = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lng } = pos.coords;
      const nextRegion = regionFromCoords(lat, lng);
      setRegion(nextRegion);
      lastEmittedCoordsRef.current = { latitude: lat, longitude: lng };
      onChangeRef.current?.({ latitude: lat, longitude: lng });
      isProgrammaticMoveRef.current = true;
      mapRef.current?.animateToRegion(nextRegion, 480);
      if (onResolveAddressRef.current) {
        const text = await reverseGeocode(lat, lng);
        if (text) onResolveAddressRef.current(text);
      }
    } catch {
      // denied or unavailable
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    if (!autoLocateOnMount || autoLocatedRef.current) return;
    autoLocatedRef.current = true;
    if (!hasPin) {
      handleUseMyLocation();
    }
  }, [autoLocateOnMount, hasPin, handleUseMyLocation]);

  const displayLat = hasPin ? latitude : region.latitude;
  const displayLng = hasPin ? longitude : region.longitude;

  return (
    <View style={[styles.wrap, { height, borderColor: c.outlineVariant }, theme.shadow.md]}>
      <MapView
        ref={mapRef}
        provider={MAP_PROVIDER}
        style={StyleSheet.absoluteFill}
        region={region}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMapReady={() => setMapReady(true)}
        showsUserLocation
        showsMyLocationButton={false}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
      />

      {/* Fixed center pin — reliable on Android vs custom Marker children */}
      <View style={styles.centerPinLayer} pointerEvents="none">
        <View style={styles.pinShadow} />
        <View style={[styles.pinHead, { backgroundColor: theme.accent.primary }]} />
        <View style={[styles.pinStem, { backgroundColor: theme.accent.primary }]} />
      </View>

      {showSetupBanner ? (
        <View style={[styles.setupBanner, { backgroundColor: 'rgba(15,23,42,0.88)' }]}>
          <AppIcon name="map" size={20} color="#fff" />
          <Text style={styles.setupBannerText}>{mapsSetupMessage()}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={handleUseMyLocation}
        style={[
          styles.locateBtn,
          showSetupBanner && styles.locateBtnBelowBanner,
          {
            backgroundColor: c.surfaceContainerLowest,
            borderColor: c.outlineVariant,
          },
        ]}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator size="small" color={theme.accent.primary} />
        ) : (
          <>
            <AppIcon name="my-location" size={16} color={theme.accent.primary} />
            <Text style={[styles.locateText, { color: theme.accent.dark }]}>Use my location</Text>
          </>
        )}
      </Pressable>

      {hasPin ? (
        <View style={[styles.coordChip, { backgroundColor: 'rgba(15,23,42,0.78)' }]}>
          <Text style={styles.coordText}>
            {displayLat.toFixed(5)}, {displayLng.toFixed(5)}
          </Text>
        </View>
      ) : (
        <View style={[styles.hint, { backgroundColor: 'rgba(15,23,42,0.72)' }]}>
          <AppIcon name="touch-app" size={14} color="#fff" />
          <Text style={styles.hintText}>Pan the map to set your spot</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  centerPinLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  pinShadow: {
    position: 'absolute',
    bottom: '46%',
    width: 14,
    height: 6,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  pinHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: -1,
  },
  pinStem: {
    width: 3,
    height: 12,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  setupBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    zIndex: 5,
  },
  setupBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 16,
  },
  locateBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 4,
  },
  locateBtnBelowBanner: {
    top: 88,
  },
  locateText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  coordChip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 4,
  },
  coordText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  hint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: '12%',
    right: '12%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    zIndex: 4,
  },
  hintText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
});
