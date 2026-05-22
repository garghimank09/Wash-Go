import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
  DEBUG_ROLE_LAYOUT,
  getCompositionMetrics,
} from '../../constants/roleSelectionComposition';
import { ROLE_LAYOUT } from '../../constants/roleSelectionTheme';

/**
 * Static half-region layout guide for hero + CTA stack.
 */
function PortalCompositionRegionImpl({
  side,
  screenWidth,
  topInset,
  bottomInset,
  compositionOpacity,
  children,
}) {
  const isCustomer = side === 'customer';
  const { regionWidth, regionLeft } = getCompositionMetrics(screenWidth);
  const regionLeftPx = regionLeft[isCustomer ? 'customer' : 'partner'];

  const columnOpacityStyle = useAnimatedStyle(() => ({
    opacity: compositionOpacity ? compositionOpacity.value : 1,
  }));

  return (
    <View
      pointerEvents="auto"
      style={[
        styles.region,
        {
          width: regionWidth,
          left: regionLeftPx,
          top: topInset,
          bottom: bottomInset,
        },
        DEBUG_ROLE_LAYOUT && styles.debugRegion,
      ]}
    >
      <Animated.View
        style={[styles.contentColumn, columnOpacityStyle]}
        pointerEvents="box-none"
      >
        <View style={styles.compositionStack} pointerEvents="box-none">
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  region: {
    position: 'absolute',
    overflow: 'visible',
    zIndex: 10,
  },
  contentColumn: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: ROLE_LAYOUT.composition.contentTopPadding,
    paddingBottom: ROLE_LAYOUT.composition.contentBottomPadding,
  },
  compositionStack: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  debugRegion: {
    borderWidth: 2,
    borderColor: 'rgba(255, 80, 80, 0.85)',
    backgroundColor: 'rgba(255, 80, 80, 0.08)',
  },
});

/** @alias */
export const CustomerCompositionRegion = (props) => (
  <PortalCompositionRegionImpl side="customer" {...props} />
);

/** @alias */
export const PartnerCompositionRegion = (props) => (
  <PortalCompositionRegionImpl side="partner" {...props} />
);

const PortalCompositionRegion = memo(PortalCompositionRegionImpl);
export default PortalCompositionRegion;
