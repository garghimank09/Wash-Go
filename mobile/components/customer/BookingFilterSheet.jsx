import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { BOOKING_FILTERS, getBookingFilterStyle } from '../../constants/bookingFilters';
import AppIcon from './AppIcon';

const MENU_WIDTH = 220;
const MENU_GAP = 6;
const ANIM_MS = 180;

const dropdownEnter = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateY: -4 }, { scale: 0.98 }],
  },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
}).duration(ANIM_MS);

function DropdownMenu({ anchor, selected, counts, onSelect, onClose, isDark, theme }) {
  const { width: screenWidth } = useWindowDimensions();
  const c = theme.customer;

  const menuLeft = Math.min(
    Math.max(12, anchor.x + anchor.width - MENU_WIDTH),
    screenWidth - MENU_WIDTH - 12
  );
  const menuTop = anchor.y + anchor.height + MENU_GAP;

  return (
    <Animated.View
      entering={dropdownEnter}
      exiting={FadeOut.duration(140)}
      style={[
        menuStyles.menu,
        {
          top: menuTop,
          left: menuLeft,
          width: MENU_WIDTH,
          backgroundColor: c.surfaceContainerLowest,
          borderColor: c.outlineVariant,
        },
        theme.shadow.md,
      ]}
    >
      {BOOKING_FILTERS.map((f, index) => {
        const isSelected = selected === f.id;
        const style = getBookingFilterStyle(f.id, isDark);
        const count = counts[f.id] ?? 0;

        return (
          <Pressable
            key={f.id}
            onPress={() => {
              onSelect(f.id);
              onClose();
            }}
            style={({ pressed }) => [
              menuStyles.row,
              index < BOOKING_FILTERS.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: c.outlineVariant,
              },
              isSelected && { backgroundColor: style.bg },
              pressed && { opacity: 0.75 },
            ]}
          >
            <View style={[menuStyles.dot, { backgroundColor: style.dot }]} />
            <Text
              style={[
                menuStyles.label,
                { color: isSelected ? style.fg : theme.text.primary },
                isSelected && menuStyles.labelSelected,
              ]}
            >
              {f.label}
            </Text>
            <Text style={[menuStyles.count, { color: theme.text.muted }]}>
              {count}
            </Text>
            {isSelected ? (
              <AppIcon name="check" size={16} color={style.fg} />
            ) : (
              <View style={menuStyles.checkSpacer} />
            )}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

/**
 * Compact filter control: pill trigger + anchored dropdown (no bottom sheet).
 */
export default function BookingFilterMenu({ selected, counts = {}, onSelect }) {
  const { theme, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const triggerRef = useRef(null);
  const chevronRotation = useSharedValue(0);

  const style = getBookingFilterStyle(selected, isDark);
  const selectedCount = counts[selected];

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const openMenu = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
      chevronRotation.value = withTiming(180, {
        duration: ANIM_MS,
        easing: Easing.out(Easing.cubic),
      });
    });
  }, [chevronRotation]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    chevronRotation.value = withTiming(0, {
      duration: ANIM_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [chevronRotation]);

  const toggle = useCallback(() => {
    if (open) closeMenu();
    else openMenu();
  }, [open, openMenu, closeMenu]);

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            triggerStyles.pill,
            {
              backgroundColor: theme.customer.surfaceContainerLowest,
              borderColor: open ? style.border : theme.customer.outlineVariant,
            },
            open && { backgroundColor: style.bg },
            pressed && { opacity: 0.88 },
          ]}
        >
          <View style={[triggerStyles.dot, { backgroundColor: style.dot }]} />
          <Text style={[triggerStyles.label, { color: theme.text.primary }]}>
            {selected}
          </Text>
          {selectedCount != null && selectedCount > 0 ? (
            <Text style={[triggerStyles.countInline, { color: theme.text.muted }]}>
              {selectedCount}
            </Text>
          ) : null}
          <Animated.View style={chevronStyle}>
            <AppIcon name="keyboard-arrow-down" size={18} color={theme.text.muted} />
          </Animated.View>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        <Pressable style={menuStyles.backdrop} onPress={closeMenu}>
          <Animated.View
            entering={FadeIn.duration(ANIM_MS)}
            exiting={FadeOut.duration(120)}
            style={menuStyles.backdropFill}
          />
        </Pressable>

        {anchor ? (
          <DropdownMenu
            anchor={anchor}
            selected={selected}
            counts={counts}
            onSelect={onSelect}
            onClose={closeMenu}
            isDark={isDark}
            theme={theme}
          />
        ) : null}
      </Modal>
    </>
  );
}

/** @deprecated Use BookingFilterMenu — kept for import compatibility */
export function BookingFilterTrigger(props) {
  return <BookingFilterMenu {...props} />;
}

/** @deprecated Bottom sheet removed — use BookingFilterMenu */
export function BookingFilterSheet() {
  return null;
}

const triggerStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 40,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { fontSize: 14, fontWeight: '600' },
  countInline: { fontSize: 13, fontWeight: '500' },
});

const menuStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  menu: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { flex: 1, fontSize: 15, fontWeight: '500' },
  labelSelected: { fontWeight: '600' },
  count: { fontSize: 14, fontWeight: '500', minWidth: 20, textAlign: 'right' },
  checkSpacer: { width: 16 },
});
