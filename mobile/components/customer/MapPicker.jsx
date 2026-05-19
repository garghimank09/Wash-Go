import { useEffect, useRef, useState } from 'react';
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

export default function MapPicker({
  latitude,
  longitude,
  onChange,
  onResolveAddress,
  height = 200,
}) {
  const { theme } = useTheme();
  const mapRef = useRef(null);
  const [locating, setLocating] = useState(false);
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
        420
      );
    }
  }, [latitude, longitude, hasPin]);

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lng } = pos.coords;
      onChange?.({ latitude: lat, longitude: lng });

      try {
        const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (places && places.length > 0) {
          const p = places[0];
          const text = [p.name, p.street, p.city, p.region]
            .filter(Boolean)
            .filter((value, idx, arr) => arr.indexOf(value) === idx)
            .join(', ');
          if (text) onResolveAddress?.(text);
        }
      } catch {
        // silent: address optional
      }
    } catch {
      // silent: user denied or no GPS
    } finally {
      setLocating(false);
    }
  };

  const handleMapPress = (e) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    onChange?.({ latitude: lat, longitude: lng });
  };

  const handleDrag = (e) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    onChange?.({ latitude: lat, longitude: lng });
  };

  return (
    <View style={[styles.wrap, { height, borderColor: c.outlineVariant }]}>
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
            onDragEnd={handleDrag}
            pinColor={theme.accent.primary}
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
          <AppIcon name="my-location" size={18} color={theme.accent.primary} />
        )}
      </Pressable>

      {!hasPin ? (
        <View style={[styles.hint, { backgroundColor: 'rgba(15,23,42,0.72)' }]}>
          <AppIcon name="touch-app" size={14} color="#fff" />
          <Text style={styles.hintText}>Tap the map to drop your pin</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  locateBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  hint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
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
