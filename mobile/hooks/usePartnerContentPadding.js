import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getPartnerTabBarOccupiedHeight,
  getPartnerScrollEndPadding,
  getPartnerContentPadding,
} from '../constants/partnerTheme';

/** Height reserved at screen bottom for tab bar chrome (use on partner layout). */
export function usePartnerTabBarInset() {
  const insets = useSafeAreaInsets();
  return getPartnerTabBarOccupiedHeight(insets.bottom);
}

/** Padding for the last item inside a ScrollView (layout already reserves tab chrome). */
export function usePartnerScrollEndPadding() {
  return getPartnerScrollEndPadding();
}

/**
 * Full bottom padding for scroll content when layout inset is not applied.
 * @deprecated Prefer usePartnerTabBarInset on layout + usePartnerScrollEndPadding on scroll.
 */
export function usePartnerContentPadding() {
  const insets = useSafeAreaInsets();
  return getPartnerContentPadding(insets.bottom);
}
