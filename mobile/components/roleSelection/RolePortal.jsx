import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import AnimatedBackground from './AnimatedBackground';
import AmbientDropletLayer from './AmbientDropletLayer';
import AmbientMistLayer from './AmbientMistLayer';
import HeroStage from './HeroStage';
import SlideArrowGateway from './SlideArrowGateway';
import PortalCompositionRegion from './PortalCompositionRegion';
import {
  DEBUG_ROLE_LAYOUT,
  getCompositionMetrics,
} from '../../constants/roleSelectionComposition';
import { ROLE_LAYOUT } from '../../constants/roleSelectionTheme';
import { ROLE_MOTION } from '../../constants/roleSelectionMotion';

/**
 * Full-screen portal (translateX motion) with half-region content composition.
 */
function RolePortalImpl({
  side,
  hero,
  title,
  subtitle,
  screenWidth,
  screenHeight,
  topInset,
  bottomInset,
  translateX,
  opacity,
  compositionOpacity,
  stackStyle,
  slideProgress,
  oppositeProgress,
  intensity,
  parallax,
  entry,
  reduceMotion = false,
  entryDelay = 0,
  onComplete,
  gatewayDisabled = false,
  gatewayResetKey = 0,
  isInteracting = false,
}) {
  const isCustomer = side === 'customer';
  const { regionWidth } = useMemo(
    () => getCompositionMetrics(screenWidth),
    [screenWidth],
  );

  const regionContentHeight = useMemo(() => {
    const reserved = topInset + bottomInset;
    return Math.max(200, screenHeight - reserved);
  }, [screenHeight, topInset, bottomInset]);

  const portalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[styles.portalMask, { width: screenWidth }, stackStyle]}
      pointerEvents={gatewayDisabled ? 'none' : 'box-none'}
    >
      <Animated.View style={[styles.portal, { width: screenWidth }, portalStyle]}>
        <AnimatedBackground
          side={side}
          intensity={intensity}
          entry={entry}
          reduceMotion={reduceMotion}
          isDragging={isInteracting}
        />

        <PortalCompositionRegion
          side={side}
          screenWidth={screenWidth}
          topInset={topInset}
          bottomInset={bottomInset}
          compositionOpacity={compositionOpacity}
        >
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.ambientLayer]}>
            {isCustomer ? (
              <AmbientDropletLayer
                parallax={parallax}
                intensity={intensity}
                reduceMotion={reduceMotion}
                width={regionWidth}
                height={regionContentHeight}
              />
            ) : (
              <AmbientMistLayer
                parallax={parallax}
                intensity={intensity}
                reduceMotion={reduceMotion}
                width={regionWidth}
                height={regionContentHeight}
              />
            )}
          </View>

          <HeroStage
            side={side}
            hero={hero}
            regionWidth={regionWidth}
            contentHeight={regionContentHeight}
            slideProgress={slideProgress}
            inactiveProgress={oppositeProgress}
            parallax={parallax}
            entry={entry}
            reduceMotion={reduceMotion}
            isDragging={isInteracting}
          />

          <View style={styles.ctaSlot} pointerEvents="box-none">
            <SlideArrowGateway
              side={side}
              title={title}
              subtitle={subtitle}
              slideProgress={slideProgress}
              oppositeProgress={oppositeProgress}
              compositionOpacity={compositionOpacity}
              regionWidth={regionWidth}
              reduceMotion={reduceMotion}
              entryDelay={entryDelay + ROLE_MOTION.delay.arrow}
              onComplete={onComplete}
              disabled={gatewayDisabled}
              resetKey={gatewayResetKey}
            />
          </View>
        </PortalCompositionRegion>
      </Animated.View>
      {DEBUG_ROLE_LAYOUT ? (
        <View
          pointerEvents="none"
          style={[
            styles.debugPortalBounds,
            { width: screenWidth },
            isCustomer ? styles.debugPortalCustomer : styles.debugPortalPartner,
          ]}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  portalMask: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  portal: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'visible',
  },
  ambientLayer: {
    zIndex: 2,
  },
  ctaSlot: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: ROLE_LAYOUT.composition.horizontalPad,
    paddingBottom: ROLE_LAYOUT.composition.heroBottomPadding * 0.25,
    zIndex: 20,
  },
  debugPortalBounds: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  debugPortalCustomer: {
    borderColor: 'rgba(80, 200, 255, 0.9)',
    backgroundColor: 'rgba(80, 200, 255, 0.04)',
  },
  debugPortalPartner: {
    borderColor: 'rgba(255, 200, 80, 0.9)',
    backgroundColor: 'rgba(255, 200, 80, 0.04)',
  },
});

const RolePortal = memo(RolePortalImpl);
export default RolePortal;
