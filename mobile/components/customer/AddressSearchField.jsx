import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { searchAddresses } from '../../services/addressSearchService';
import { geocodeService } from '../../services/geocodeService';
import AppIcon from './AppIcon';

const SEARCH_DEBOUNCE_MS = 450;
const GEOCODE_DEBOUNCE_MS = 900;
const COORD_EPSILON = 0.00005;
const SUGGESTIONS_MAX_HEIGHT = 220;

function coordsRoughlyEqual(a, b) {
  if (!a || !b) return false;
  return (
    Math.abs(a.latitude - b.latitude) < COORD_EPSILON &&
    Math.abs(a.longitude - b.longitude) < COORD_EPSILON
  );
}

export default function AddressSearchField({
  value,
  onChangeText,
  onLocationResolved,
  onGeocodeStatusChange,
  onSkipGeocodeRef,
  coordinates,
  error,
}) {
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectionLocked, setSelectionLocked] = useState(false);
  const inputRef = useRef(null);
  const searchSeq = useRef(0);
  const geocodeSeq = useRef(0);
  const skipGeocodeRef = useRef(false);
  const suppressSuggestionsRef = useRef(false);
  const lastGeocodedAddressRef = useRef('');
  const lastPickedLabelRef = useRef('');
  const lastResolvedCoordsRef = useRef(null);
  const onLocationResolvedRef = useRef(onLocationResolved);
  const onGeocodeStatusChangeRef = useRef(onGeocodeStatusChange);
  const coordinatesRef = useRef(coordinates);
  const didRestoreSelectionRef = useRef(false);
  const s = styles(theme);

  const hasCoords =
    coordinates?.latitude != null && coordinates?.longitude != null;
  const showSelectedCard =
    selectionLocked && (value || '').trim().length >= 5 && hasCoords;

  useEffect(() => {
    if (didRestoreSelectionRef.current) return;
    didRestoreSelectionRef.current = true;
    const trimmed = (value || '').trim();
    if (
      trimmed.length >= 5 &&
      coordinates?.latitude != null &&
      coordinates?.longitude != null
    ) {
      lastPickedLabelRef.current = trimmed;
      lastGeocodedAddressRef.current = trimmed;
      lastResolvedCoordsRef.current = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
      setSelectionLocked(true);
      suppressSuggestionsRef.current = true;
    }
  }, []);

  useEffect(() => {
    onLocationResolvedRef.current = onLocationResolved;
    onGeocodeStatusChangeRef.current = onGeocodeStatusChange;
    coordinatesRef.current = coordinates;
  }, [onLocationResolved, onGeocodeStatusChange, coordinates]);

  useEffect(() => {
    if (!onSkipGeocodeRef) return undefined;
    onSkipGeocodeRef.current = () => {
      skipGeocodeRef.current = true;
      lastGeocodedAddressRef.current = (value || '').trim();
    };
    return () => {
      onSkipGeocodeRef.current = null;
    };
  }, [onSkipGeocodeRef, value]);

  const setStatus = useCallback((patch) => {
    if (patch.geocoding != null) setGeocoding(patch.geocoding);
    if (patch.geocodeError !== undefined) setGeocodeError(patch.geocodeError);
    onGeocodeStatusChangeRef.current?.(patch);
  }, []);

  useEffect(() => {
    const trimmed = (value || '').trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return undefined;
    }

    if (suppressSuggestionsRef.current) {
      suppressSuggestionsRef.current = false;
      return undefined;
    }

    if (selectionLocked && trimmed === lastPickedLabelRef.current) {
      return undefined;
    }

    const seq = ++searchSeq.current;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddresses(trimmed);
        if (seq !== searchSeq.current) return;
        setSuggestions(results);
        if (!selectionLocked) setShowSuggestions(true);
      } catch {
        if (seq === searchSeq.current) setSuggestions([]);
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, selectionLocked]);

  useEffect(() => {
    if (skipGeocodeRef.current) {
      skipGeocodeRef.current = false;
      return undefined;
    }

    const trimmed = (value || '').trim();
    if (trimmed.length < 5) {
      setStatus({ geocoding: false, geocodeError: null });
      lastGeocodedAddressRef.current = '';
      return undefined;
    }

    if (trimmed === lastGeocodedAddressRef.current) {
      return undefined;
    }

    if (selectionLocked && trimmed === lastPickedLabelRef.current) {
      return undefined;
    }

    const currentCoords = coordinatesRef.current;
    if (
      currentCoords?.latitude != null &&
      currentCoords?.longitude != null &&
      lastResolvedCoordsRef.current &&
      coordsRoughlyEqual(currentCoords, lastResolvedCoordsRef.current)
    ) {
      return undefined;
    }

    const seq = ++geocodeSeq.current;
    const timer = setTimeout(async () => {
      setStatus({ geocoding: true, geocodeError: null });
      try {
        const result = await geocodeService.resolve(trimmed);
        if (seq !== geocodeSeq.current) return;

        lastGeocodedAddressRef.current = trimmed;
        lastResolvedCoordsRef.current = {
          latitude: result.lat,
          longitude: result.lng,
        };
        onLocationResolvedRef.current?.({
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
  }, [value, selectionLocked, setStatus]);

  const handleSelectSuggestion = (item) => {
    suppressSuggestionsRef.current = true;
    skipGeocodeRef.current = true;
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();

    const label = item.label.trim();
    lastPickedLabelRef.current = label;
    lastGeocodedAddressRef.current = label;
    setSelectionLocked(true);

    onChangeText(item.label);

    const coords = { latitude: item.lat, longitude: item.lng };
    lastResolvedCoordsRef.current = coords;
    onLocationResolvedRef.current?.({
      ...coords,
      approximate: false,
    });
    setStatus({ geocoding: false, geocodeError: null });
  };

  const handleChangeAddress = () => {
    setSelectionLocked(false);
    lastPickedLabelRef.current = '';
    lastGeocodedAddressRef.current = '';
    suppressSuggestionsRef.current = false;
    setShowSuggestions(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleClear = () => {
    onChangeText('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectionLocked(false);
    lastGeocodedAddressRef.current = '';
    lastPickedLabelRef.current = '';
    lastResolvedCoordsRef.current = null;
    suppressSuggestionsRef.current = false;
  };

  const handleChangeText = (t) => {
    if (t.trim() !== lastPickedLabelRef.current) {
      setSelectionLocked(false);
      lastPickedLabelRef.current = '';
      suppressSuggestionsRef.current = false;
    }
    lastGeocodedAddressRef.current = '';
    onChangeText(t);
    if (t.trim().length >= 3) setShowSuggestions(true);
  };

  const statusLine = () => {
    if (error) return <Text style={s.errorText}>{error}</Text>;
    if (showSuggestions && suggestions.length > 0) return null;
    if (geocoding) {
      return (
        <View style={s.statusRow}>
          <ActivityIndicator size="small" color={theme.accent.primary} />
          <Text style={s.statusInfo}>Locating address on map…</Text>
        </View>
      );
    }
    if (geocodeError) return <Text style={s.statusWarn}>{geocodeError}</Text>;
    if (hasCoords && !geocoding && (value || '').trim().length >= 5) {
      return (
        <Text style={s.statusOk}>
          Location found — pan the map to refine your exact spot.
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={s.wrap}>
      <Text style={s.fieldLabel}>Service address</Text>

      {showSelectedCard ? (
        <View style={[s.selectedCard, error && s.selectedCardError]}>
          <View style={[s.selectedIcon, { backgroundColor: theme.customer.primaryBg }]}>
            <AppIcon name="place" size={20} color={theme.accent.primary} />
          </View>
          <View style={s.selectedBody}>
            <Text style={s.selectedTitle}>Selected location</Text>
            <Text style={s.selectedAddress} numberOfLines={3}>
              {value}
            </Text>
          </View>
          <Pressable onPress={handleChangeAddress} hitSlop={8} style={s.changeBtn}>
            <Text style={[s.changeBtnText, { color: theme.accent.primary }]}>Change</Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            s.inputWrap,
            focused && s.inputWrapFocused,
            error && s.inputError,
          ]}
        >
          <AppIcon name="search" size={20} color={theme.text.muted} />
          <TextInput
            ref={inputRef}
            style={s.input}
            placeholder="Search sector, street, landmark…"
            placeholderTextColor={theme.text.muted}
            value={value}
            onChangeText={handleChangeText}
            onFocus={() => {
              setFocused(true);
              if (suggestions.length && !selectionLocked) setShowSuggestions(true);
            }}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="words"
          />
          {value?.length > 0 ? (
            <Pressable onPress={handleClear} hitSlop={8}>
              <AppIcon name="close" size={18} color={theme.text.muted} />
            </Pressable>
          ) : null}
          {searching ? (
            <ActivityIndicator size="small" color={theme.accent.primary} />
          ) : null}
        </View>
      )}

      {showSuggestions && suggestions.length > 0 && !showSelectedCard ? (
        <View style={s.dropdown}>
          <Text style={s.dropdownTitle}>Suggestions</Text>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ maxHeight: SUGGESTIONS_MAX_HEIGHT }}
          >
            {suggestions.map((item, index) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  s.suggestionRow,
                  index === suggestions.length - 1 && s.suggestionRowLast,
                  pressed && s.suggestionPressed,
                ]}
                onPress={() => handleSelectSuggestion(item)}
              >
                <AppIcon name="place" size={18} color={theme.accent.primary} />
                <Text style={s.suggestionText} numberOfLines={2}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
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
    fieldLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 8,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.outlineVariant,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 4,
      minHeight: 52,
      ...theme.shadow.sm,
    },
    inputWrapFocused: {
      borderColor: theme.accent.primary,
      shadowColor: theme.accent.primary,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },
    inputError: { borderColor: c.error },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.text.primary,
      paddingVertical: 12,
    },
    selectedCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1.5,
      borderColor: theme.accent.primary + '40',
      borderRadius: 14,
      padding: 14,
      ...theme.shadow.sm,
    },
    selectedCardError: { borderColor: c.error },
    selectedIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedBody: { flex: 1 },
    selectedTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    selectedAddress: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      lineHeight: 20,
    },
    changeBtn: {
      paddingVertical: 4,
      paddingHorizontal: 2,
    },
    changeBtnText: {
      fontSize: 13,
      fontWeight: '700',
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
    dropdownTitle: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 4,
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
    suggestionRowLast: { borderBottomWidth: 0 },
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
