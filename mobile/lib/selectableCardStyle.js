import { Platform } from 'react-native';

/** Solid fill for selected cards — avoids transparent primaryBg gaps on Android. */
export function getSelectionFill(theme) {
  return theme.customer.selectionFill;
}

export function getSelectionBorder(theme) {
  return theme.customer.selectionBorder ?? theme.accent.primary;
}

/**
 * Android-safe styles for tappable selection cards/rows.
 * No scale transforms; selected state uses opaque fill + border.
 */
export function getSelectableCardStyle(
  theme,
  { selected = false, pressed = false, error = false, borderRadius = 18 } = {},
) {
  const c = theme.customer;
  const borderColor = error
    ? c.error
    : selected
      ? getSelectionBorder(theme)
      : c.outlineVariant;

  const container = {
    overflow: 'hidden',
    borderRadius,
    borderWidth: selected ? 2 : 1.5,
    borderColor,
    backgroundColor: selected ? getSelectionFill(theme) : c.surfaceContainerLowest,
    opacity: pressed ? 0.94 : 1,
  };

  if (selected && Platform.OS === 'ios') {
    Object.assign(container, theme.shadow.sm);
  }

  if (Platform.OS === 'android') {
    container.elevation = 0;
  }

  const androidRipple = {
    color: `${theme.accent.primary}22`,
    borderless: false,
  };

  return { container, androidRipple, borderRadius };
}

/** Compact chip/row variant (picker rows, checklist items). */
export function getSelectableRowStyle(
  theme,
  { selected = false, pressed = false, borderRadius = 12 } = {},
) {
  const c = theme.customer;

  return {
    overflow: 'hidden',
    borderRadius,
    borderWidth: selected ? 1.5 : 0,
    borderColor: selected ? getSelectionBorder(theme) : 'transparent',
    backgroundColor: selected ? getSelectionFill(theme) : 'transparent',
    opacity: pressed ? 0.92 : 1,
  };
}
