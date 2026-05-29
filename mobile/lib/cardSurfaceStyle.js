import { Platform, StyleSheet } from 'react-native';
import { getCustomerShadow } from '../constants/customerTheme';
import { getPartnerShadow } from '../constants/partnerTheme';

function getShadows(portal, isDark) {
  return portal === 'partner' ? getPartnerShadow(isDark) : getCustomerShadow(isDark);
}

/** Subtle border on Android when elevation is disabled. */
export function getAndroidHairline(theme) {
  return {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.customer.outlineVariant,
  };
}

/**
 * Platform-safe card chrome: clipped surface + iOS shadow or Android hairline.
 */
export function getCardSurfaceStyle(
  theme,
  {
    borderRadius = 22,
    backgroundColor,
    shadow = 'soft',
    portal = 'customer',
    isDark = false,
    withBorder = true,
  } = {},
) {
  const c = theme.customer;
  const shadows = getShadows(portal, isDark);
  const shadowStyle = shadow === 'none' ? {} : shadows[shadow] ?? shadows.soft;

  const base = {
    borderRadius,
    overflow: 'hidden',
    backgroundColor: backgroundColor ?? c.surfaceContainerLowest,
  };

  if (Platform.OS === 'android') {
    return {
      ...base,
      elevation: 0,
      ...(withBorder ? getAndroidHairline(theme) : {}),
    };
  }

  return {
    ...base,
    ...shadowStyle,
  };
}
