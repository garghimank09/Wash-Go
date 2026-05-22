import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { searchAddresses } from '../../services/addressSearchService';
import { geocodeService } from '../../services/geocodeService';
import AppIcon from './AppIcon';

const SEARCH_DEBOUNCE_MS = 450;
const GEOCODE_DEBOUNCE_MS = 800;

export default function AddressSearchField({
  value,
  onChangeText,
  onLocationResolved,
  onGeocodeStatusChange,
  error,
}) {
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchSeq = useRef(0);
  const geocodeSeq = useRef(0);
  const skipGeocodeRef = useRef(false);
  const s = styles(theme);

  const setStatus = useCallback(
    (patch) => {
      if (patch.geocoding != null) setGeocoding(patch.geocoding);
      if (patch.geocodeError !== undefined) setGeocodeError(patch.geocodeError);
      onGeocodeStatusChange?.(patch);
    },
    [onGeocodeStatusChange],
  );

  useEffect(() => {
    const trimmed = (value || '').trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return undefined;
    }

    const seq = ++searchSeq.current;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddresses(trimmed);
        if (seq !== searchSeq.current) return;
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        if (seq === searchSeq.current) setSuggestions([]);
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    if (skipGeocodeRef.current) {
      skipGeocodeRef.current = false;
      return undefined;
    }

    const trimmed = (value || '').trim();
    if (trimmed.length < 5) {
      setStatus({ geocoding: false, geocodeError: null });
      return undefined;
    }

    const seq = ++geocodeSeq.current;
    const timer = setTimeout(async () => {
      setStatus({ geocoding: true, geocodeError: null });
      try {
        const result = await geocodeService.resolve(trimmed);
        if (seq !== geocodeSeq.current) return;
        onLocationResolved?.({
          latitude: result.lat,
          longitude: result.lng,
          approximate: result.approximate,
        });
        setStatus({
          geocoding: false,
          geocodeError: result.approximate
            ? 'Approximate location — drag the pin to refine.'
            : null,
        });
      } catch (err) {
        if (seq !== geocodeSeq.current) return;
        setStatus({
          geocoding: false,
          geocodeError: err.message || 'Could not locate address on map',
        });
      }
    }, GEOCODE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, onLocationResolved, setStatus]);

  const handleSelectSuggestion = async (item) => {
    skipGeocodeRef.current = true;
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
    onChangeText(item.label);
    onLocationResolved?.({
      latitude: item.lat,
      longitude: item.lng,
      approximate: false,
    });
    setStatus({ geocoding: false, geocodeError: null });

    try {
      const confirmed = await geocodeService.resolve(item.label);
      onLocationResolved?.({
        latitude: confirmed.lat,
        longitude: confirmed.lng,
        approximate: confirmed.approximate,
      });
      if (confirmed.approximate) {
        setStatus({
          geocodeError: 'Approximate location — drag the pin to refine.',
        });
      }
    } catch {
      // keep OSM coords
    }
  };

  const statusLine = () => {
    if (error) return <Text style={s.errorText}>{error}</Text>;
    if (geocoding) {
      return (
        <View style={s.statusRow}>
          <ActivityIndicator size="small" color={theme.accent.primary} />
          <Text style={s.statusInfo}>Locating address on map…</Text>
        </View>
      );
    }
    if (geocodeError) return <Text style={s.statusWarn}>{geocodeError}</Text>;
    if ((value || '').trim().length >= 5 && !geocoding) {
      return (
        <Text style={s.statusOk}>
          Location found — drag the pin to refine your exact spot.
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={s.wrap}>
      <View style={[s.inputWrap, error && s.inputError]}>
        <AppIcon name="search" size={20} color={theme.text.muted} />
        <TextInput
          style={s.input}
          placeholder="Search address (sector, street, city…)"
          placeholderTextColor={theme.text.muted}
          value={value}
          onChangeText={(t) => {
            onChangeText(t);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (suggestions.length) setShowSuggestions(true);
          }}
          multiline
          numberOfLines={2}
        />
        {value?.length > 0 ? (
          <Pressable
            onPress={() => {
              onChangeText('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            hitSlop={8}
          >
            <AppIcon name="close" size={18} color={theme.text.muted} />
          </Pressable>
        ) : null}
        {searching ? (
          <ActivityIndicator size="small" color={theme.accent.primary} />
        ) : null}
      </View>

      {showSuggestions && suggestions.length > 0 ? (
        <View style={s.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ maxHeight: 200 }}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [s.suggestionRow, pressed && s.suggestionPressed]}
                onPress={() => handleSelectSuggestion(item)}
              >
                <AppIcon name="place" size={18} color={theme.accent.primary} />
                <Text style={s.suggestionText} numberOfLines={2}>
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </View>
      ) : null}

      <View style={s.statusWrap}>{statusLine()}</View>
    </View>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    wrap: { zIndex: 20 },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      ...theme.shadow.sm,
    },
    inputError: { borderColor: c.error },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.text.primary,
      minHeight: 44,
      textAlignVertical: 'top',
      paddingTop: 2,
    },
    dropdown: {
      marginTop: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLowest,
      overflow: 'hidden',
      ...theme.shadow.md,
    },
    suggestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.outlineVariant,
    },
    suggestionPressed: { backgroundColor: c.primaryBg },
    suggestionText: {
      flex: 1,
      fontSize: 13,
      color: theme.text.primary,
      lineHeight: 18,
    },
    statusWrap: { marginTop: 8, minHeight: 18 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusInfo: { fontSize: 12, fontWeight: '600', color: theme.accent.dark },
    statusWarn: { fontSize: 12, fontWeight: '600', color: '#B45309' },
    statusOk: { fontSize: 12, fontWeight: '600', color: '#047857' },
    errorText: { fontSize: 12, fontWeight: '600', color: c.error },
  });
};
