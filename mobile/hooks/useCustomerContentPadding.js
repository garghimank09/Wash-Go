import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getCustomerTabBarOccupiedHeight,
  getCustomerScrollEndPadding,
  getCustomerContentPadding,
} from '../constants/customerTheme';

/** Height reserved at screen bottom for tab bar chrome (use on customer layout). */
export function useCustomerTabBarInset() {
  const insets = useSafeAreaInsets();
  return getCustomerTabBarOccupiedHeight(insets.bottom);
}

/** Padding for the last item inside a ScrollView (layout already reserves tab chrome). */
export function useCustomerScrollEndPadding() {
  return getCustomerScrollEndPadding();
}

/**
 * Full bottom padding for scroll content when layout inset is not applied.
 * @deprecated Prefer useCustomerTabBarInset on layout + useCustomerScrollEndPadding on scroll.
 */
export function useCustomerContentPadding() {
  const insets = useSafeAreaInsets();
  return getCustomerContentPadding(insets.bottom);
}
