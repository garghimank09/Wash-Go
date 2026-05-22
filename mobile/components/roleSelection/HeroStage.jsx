import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  DEBUG_ROLE_LAYOUT,
  getHeroFrameOffset,
} from '../../constants/roleSelectionComposition';
import { ROLE_GRADIENTS, ROLE_LAYOUT } from '../../constants/roleSelectionTheme';
import { ROLE_MOTION } from '../../constants/roleSelectionMotion';

/**
 * Hero framed inside the composition region (half-screen), not global center.
 * Customer: large front-half peek from the left; slides reveal the full car.
 */
function HeroStageImpl({
  side,
  hero,
  regionWidth,
  contentHeight = 400,
  slideProgress,
  inactiveProgress,
  parallax,
  entry,
  reduceMotion = false,
  isDragging = false,
}) {
  const isCustomer = side === 'customer';
  const layout = ROLE_LAYOUT.hero;
  const widthRatio = isCustomer
    ? layout.widthRatioCustomer
    : layout.widthRatioPartner;
  const heroBoxWidth = regionWidth * widthRatio;
  const heroBoxHeight = Math.max(
    regionWidth * 1.05,
    contentHeight * layout.heightRatioOfContent,
  );
  const heroSlotMaxHeight = contentHeight * ROLE_LAYOUT.composition.heroMaxHeightRatio;

  const heroAnimStyle = useAnimatedStyle(() => {
    const active = slideProgress ? slideProgress.value : 0;
    const inactive = inactiveProgress ? inactiveProgress.value : 0;
    const entryOpacity = entry ? entry.value : 1;
    const entryScale = 0.98 + (entry ? entry.value : 1) * 0.02;
    const parallaxX = parallax
      ? parallax.value * (isCustomer ? -4 : 4)
      : 0;
    const slideX = getHeroFrameOffset(side, active, regionWidth);

    if (isCustomer) {
      const motionScale =
        ROLE_MOTION.layout.customerHeroScaleNeutral +
        active *
          (ROLE_MOTION.layout.customerHeroScaleActive -
            ROLE_MOTION.layout.customerHeroScaleNeutral) +
        inactive *
          (ROLE_MOTION.layout.heroScaleInactive -
            ROLE_MOTION.layout.customerHeroScaleNeutral);
      const framingScale = interpolate(
        active,
        [0, 1],
        [layout.customerFramingScaleNeutral, layout.customerFramingScaleActive],
      );

      return {
        opacity: entryOpacity,
        transform: [
          { translateX: slideX + parallaxX },
          { scale: motionScale * framingScale * entryScale },
        ],
      };
    }

    const scale =
      ROLE_MOTION.layout.heroScaleNeutral +
      active * (ROLE_MOTION.layout.heroScaleActive - ROLE_MOTION.layout.heroScaleNeutral) +
      inactive * (ROLE_MOTION.layout.heroScaleInactive - ROLE_MOTION.layout.heroScaleNeutral);

    return {
      opacity: entryOpacity,
      transform: [
        { translateX: slideX + parallaxX },
        { scale: scale * entryScale },
      ],
    };
  });

  const reflectionStyle = useAnimatedStyle(() => {
    const active = slideProgress ? slideProgress.value : 0;
    const reflectX = getHeroFrameOffset(side, active, regionWidth) * 0.85;

    return {
      opacity:
        layout.reflectionOpacity * (0.6 + active * 0.45) * (entry ? entry.value : 1),
      transform: [{ translateX: reflectX }],
    };
  });

  const reflectionColors = isCustomer
    ? ROLE_GRADIENTS.heroReflectionCustomer
    : ROLE_GRADIENTS.heroReflectionPartner;

  const recyclingKey = isCustomer ? 'hero-car' : 'hero-machine';

  return (
    <View
      style={[
        styles.heroSlot,
        { maxHeight: heroSlotMaxHeight },
        DEBUG_ROLE_LAYOUT && styles.debugHeroSlot,
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.heroFrame,
          { width: heroBoxWidth, height: heroBoxHeight },
          heroAnimStyle,
          DEBUG_ROLE_LAYOUT && styles.debugHeroFrame,
        ]}
      >
        <Image
          source={hero}
          style={styles.heroImage}
          contentFit="contain"
          contentPosition={isCustomer ? 'left center' : 'center'}
          transition={isDragging ? 0 : 400}
          cachePolicy="memory-disk"
          recyclingKey={recyclingKey}
          priority="high"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.reflectionWrap,
          { width: heroBoxWidth * 0.88 },
          reflectionStyle,
        ]}
      >
        <View style={styles.reflectionFlip}>
          <Image
            source={hero}
            style={styles.reflectionImage}
            contentFit="contain"
            contentPosition={isCustomer ? 'left center' : 'center'}
            transition={0}
            cachePolicy="memory-disk"
            recyclingKey={`${recyclingKey}-refl`}
          />
        </View>
        <LinearGradient
          colors={reflectionColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSlot: {
    flexGrow: 0,
    flexShrink: 0,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: ROLE_LAYOUT.composition.heroBottomPadding,
    overflow: 'visible',
    zIndex: 12,
  },
  heroFrame: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  debugHeroSlot: {
    borderWidth: 1,
    borderColor: 'rgba(120, 255, 120, 0.8)',
    backgroundColor: 'rgba(120, 255, 120, 0.06)',
  },
  debugHeroFrame: {
    borderWidth: 1,
    borderColor: 'rgba(200, 120, 255, 0.9)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  reflectionWrap: {
    position: 'absolute',
    bottom: 4,
    height: 64,
    alignItems: 'center',
    overflow: 'hidden',
  },
  reflectionFlip: {
    width: '100%',
    height: '100%',
    transform: [{ scaleY: -1 }],
    opacity: 0.24,
  },
  reflectionImage: {
    width: '100%',
    height: '100%',
  },
});

const HeroStage = memo(HeroStageImpl);
export default HeroStage;
