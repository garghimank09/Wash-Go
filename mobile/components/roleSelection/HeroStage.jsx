import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { ROLE_GRADIENTS, ROLE_LAYOUT, ROLE_SHADOW } from '../../constants/roleSelectionTheme';
import { ROLE_MOTION } from '../../constants/roleSelectionMotion';

/**
 * Dominant hero composition: large vehicle/machine, wet-floor reflection,
 * cinematic scale driven by slide progress. Partner side uses width-aware
 * centering so the machine stays balanced in neutral 50/50 layout.
 */
function HeroStageImpl({
  side,
  hero,
  panelWidth = 0,
  slideProgress,
  inactiveProgress,
  parallax,
  entry,
  reduceMotion = false,
  entryDelay = 0,
}) {
  const isCustomer = side === 'customer';
  const widthRatio = isCustomer
    ? ROLE_LAYOUT.hero.widthRatio
    : ROLE_LAYOUT.hero.widthRatioPartner;

  const heroAnimStyle = useAnimatedStyle(() => {
    const active = slideProgress ? slideProgress.value : 0;
    const inactive = inactiveProgress ? inactiveProgress.value : 0;
    const scale =
      ROLE_MOTION.layout.heroScaleNeutral +
      active * (ROLE_MOTION.layout.heroScaleActive - ROLE_MOTION.layout.heroScaleNeutral) +
      inactive * (ROLE_MOTION.layout.heroScaleInactive - ROLE_MOTION.layout.heroScaleNeutral);
    const entryOpacity = entry ? entry.value : 1;
    const entryScale = 0.94 + (entry ? entry.value : 1) * 0.06;

    const centerFix = isCustomer
      ? panelWidth * ROLE_MOTION.layout.customerHeroCenterFix
      : panelWidth * ROLE_MOTION.layout.partnerHeroCenterFix;

    const parallaxX = parallax
      ? parallax.value * (isCustomer ? -10 : 10)
      : 0;

    return {
      opacity: entryOpacity,
      transform: [
        { scale: scale * entryScale },
        { translateX: centerFix + parallaxX },
        { translateY: active * -8 },
      ],
    };
  });

  const reflectionStyle = useAnimatedStyle(() => {
    const active = slideProgress ? slideProgress.value : 0;
    const centerFix = isCustomer
      ? 0
      : panelWidth * ROLE_MOTION.layout.partnerHeroCenterFix * 0.85;
    return {
      opacity:
        ROLE_LAYOUT.hero.reflectionOpacity *
        (0.65 + active * 0.55) *
        (entry ? entry.value : 1),
      transform: [{ translateX: centerFix }],
    };
  });

  const reflectionColors = isCustomer
    ? ROLE_GRADIENTS.heroReflectionCustomer
    : ROLE_GRADIENTS.heroReflectionPartner;

  return (
    <View style={styles.stage} pointerEvents="none">
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: ROLE_MOTION.duration.heroSettle,
          delay: reduceMotion ? 0 : entryDelay + ROLE_MOTION.delay.hero,
        }}
        style={[styles.heroContainer, { width: `${widthRatio * 100}%` }]}
      >
        <Animated.View
          style={[
            styles.heroWrap,
            heroAnimStyle,
            isCustomer ? ROLE_SHADOW.heroCustomer : styles.partnerHeroShadow,
          ]}
        >
          <Image
            source={hero}
            style={styles.heroImage}
            contentFit="contain"
            contentPosition="center"
            transition={600}
            priority="high"
          />
        </Animated.View>
      </MotiView>

      <Animated.View
        style={[
          styles.reflectionWrap,
          { width: `${widthRatio * 85}%` },
          reflectionStyle,
        ]}
      >
        <View style={styles.reflectionFlip}>
          <Image
            source={hero}
            style={styles.reflectionImage}
            contentFit="contain"
            contentPosition="center"
            transition={0}
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
  stage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '12%',
    paddingHorizontal: 4,
  },
  heroContainer: {
    height: `${ROLE_LAYOUT.hero.heightRatio * 100}%`,
    maxHeight: '66%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'center',
  },
  heroWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  partnerHeroShadow: {
    shadowColor: '#2B9CFF',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  reflectionWrap: {
    position: 'absolute',
    bottom: '7%',
    height: `${ROLE_LAYOUT.hero.reflectionHeightRatio * 100}%`,
    maxHeight: 68,
    alignItems: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  reflectionFlip: {
    width: '100%',
    height: '100%',
    transform: [{ scaleY: -1 }],
    opacity: 0.32,
  },
  reflectionImage: {
    width: '100%',
    height: '100%',
  },
});

const HeroStage = memo(HeroStageImpl);
export default HeroStage;
