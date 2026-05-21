import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { MotiView } from 'moti';
import AnimatedBackground from './AnimatedBackground';
import AmbientDropletLayer from './AmbientDropletLayer';
import AmbientMistLayer from './AmbientMistLayer';
import HeroStage from './HeroStage';
import SlideArrowGateway from './SlideArrowGateway';
import { ROLE_MOTION } from '../../constants/roleSelectionMotion';

/**
 * Cinematic half-panel: environment layers, dominant hero, slide-to-enter gateway.
 * No press-to-expand — progression is driven only by arrow drag.
 */
function SplitPanelImpl({
  side,
  hero,
  title,
  subtitle,
  panelStyle,
  slideProgress,
  oppositeProgress,
  intensity,
  parallax,
  entry,
  bottomInset,
  reduceMotion = false,
  entryDelay = 0,
  onComplete,
  gatewayDisabled = false,
  gatewayResetKey = 0,
}) {
  const isCustomer = side === 'customer';
  const [size, setSize] = useState({ width: 0, height: 0 });

  const entryFrom = isCustomer
    ? { opacity: 0, translateX: -48, scale: 0.96 }
    : { opacity: 0, translateX: 48, scale: 0.96 };

  return (
    <Animated.View
      style={[styles.panel, panelStyle]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== size.width || height !== size.height) {
          setSize({ width, height });
        }
      }}
    >
      <MotiView
        from={entryFrom}
        animate={{ opacity: 1, translateX: 0, scale: 1 }}
        transition={{
          type: 'timing',
          duration: ROLE_MOTION.duration.entry,
          delay: reduceMotion ? 0 : entryDelay,
        }}
        style={StyleSheet.absoluteFill}
      >
        <AnimatedBackground
          side={side}
          intensity={intensity}
          entry={entry}
          reduceMotion={reduceMotion}
        />

        {isCustomer ? (
          <AmbientDropletLayer
            parallax={parallax}
            intensity={intensity}
            reduceMotion={reduceMotion}
            width={size.width}
            height={size.height}
          />
        ) : (
          <AmbientMistLayer
            parallax={parallax}
            intensity={intensity}
            reduceMotion={reduceMotion}
            width={size.width}
            height={size.height}
          />
        )}

        <HeroStage
          side={side}
          hero={hero}
          panelWidth={size.width}
          slideProgress={slideProgress}
          inactiveProgress={oppositeProgress}
          parallax={parallax}
          entry={entry}
          reduceMotion={reduceMotion}
          entryDelay={entryDelay}
        />

        <View
          style={[styles.gateway, { paddingBottom: bottomInset }]}
          pointerEvents="box-none"
        >
          <SlideArrowGateway
            side={side}
            title={title}
            subtitle={subtitle}
            slideProgress={slideProgress}
            panelWidth={size.width}
            reduceMotion={reduceMotion}
            entryDelay={entryDelay + ROLE_MOTION.delay.arrow}
            onComplete={onComplete}
            disabled={gatewayDisabled}
            resetKey={gatewayResetKey}
          />
        </View>
      </MotiView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    height: '100%',
    overflow: 'hidden',
  },
  gateway: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 4,
  },
});

const SplitPanel = memo(SplitPanelImpl);
export default SplitPanel;
