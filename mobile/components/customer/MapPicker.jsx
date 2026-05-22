import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from './AppIcon';

const DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

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
  const autoLocatedRef = useRef(false);
  const c = theme.customer;

  const hasPin = latitude != null && longitude != null;
  const region = hasPin
    ? {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : DEFAULT_REGION;

  useEffect(() => {
    if (hasPin && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        420,
      );
    }
  }, [latitude, longitude, hasPin]);

  const applyCoords = useCallback(
    async (lat, lng, resolveAddress = true) => {
      onChange?.({ latitude: lat, longitude: lng });
      if (resolveAddress && onResolveAddress) {
        const text = await reverseGeocode(lat, lng);
        if (text) onResolveAddress(text);
      }
    },
    [onChange, onResolveAddress],
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
      await applyCoords(lat, lng, true);
      mapRef.current?.animateToRegion(
        { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        480,
      );
    } catch {
      // denied or unavailable
    } finally {
      setLocating(false);
    }
  }, [applyCoords]);

  useEffect(() => {
    if (!autoLocateOnMount || autoLocatedRef.current) return;
    autoLocatedRef.current = true;
    if (!hasPin) {
      handleUseMyLocation();
    }
  }, [autoLocateOnMount, hasPin, handleUseMyLocation]);

  const handleMapPress = async (e) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    await applyCoords(lat, lng, true);
  };

  const handleDragEnd = async (e) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    await applyCoords(lat, lng, true);
  };

  return (
    <View style={[styles.wrap, { height, borderColor: c.outlineVariant }, theme.shadow.md]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
      >
        {hasPin ? (
          <Marker
            coordinate={{ latitude, longitude }}
            draggable
            onDragEnd={handleDragEnd}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.markerWrap}>
              <View style={[styles.markerDot, { backgroundColor: theme.accent.primary }]} />
              <View style={[styles.markerStem, { backgroundColor: theme.accent.primary }]} />
            </View>
          </Marker>
        ) : null}
      </MapView>

      <Pressable
        onPress={handleUseMyLocation}
        style={[
          styles.locateBtn,
          {
            backgroundColor: theme.customer.surfaceContainerLowest,
            borderColor: theme.customer.outlineVariant,
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
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>
        </View>
      ) : (
        <View style={[styles.hint, { backgroundColor: 'rgba(15,23,42,0.72)' }]}>
          <AppIcon name="touch-app" size={14} color="#fff" />
          <Text style={styles.hintText}>Tap the map or search above</Text>
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
  },
  locateText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  coordChip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  coordText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  hint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: '15%',
    right: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  hintText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  markerWrap: { alignItems: 'center' },
  markerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerStem: { width: 2, height: 10 },
});
