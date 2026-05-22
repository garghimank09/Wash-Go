import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { ROLE_COLORS, ROLE_PALETTE, ROLE_LAYOUT } from '../../constants/roleSelectionTheme';
import { ROLE_EASE, ROLE_MOTION } from '../../constants/roleSelectionMotion';

const LOGO = ROLE_LAYOUT.header.logoSize;
const GO_W = 88;
const GO_H = 54;

const textHalo = Platform.select({
  ios: {
    textShadowColor: 'rgba(255, 255, 255, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  android: {},
  default: {},
});

function GradientGo() {
  return (
    <Svg width={GO_W} height={GO_H}>
      <Defs>
        <SvgLinearGradient id="roleGoFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={ROLE_PALETTE.brand.goStart} />
          <Stop offset="1" stopColor={ROLE_PALETTE.brand.goEnd} />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        x={GO_W / 2}
        y={LOGO - 2}
        textAnchor="middle"
        fontSize={LOGO}
        fontWeight="900"
        letterSpacing={1}
        fill="url(#roleGoFill)"
      >
        GO
      </SvgText>
    </Svg>
  );
}

function RoleSelectionHeaderImpl({ topInset, reduceMotion = false }) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : -16);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const d = ROLE_MOTION.delay.header;
    opacity.value = withDelay(d, withTiming(1, { duration: 520, easing: ROLE_EASE }));
    translateY.value = withDelay(d, withTiming(0, { duration: 540, easing: ROLE_EASE }));
  }, [opacity, translateY, reduceMotion]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View pointerEvents="none" style={[styles.wrap, { paddingTop: topInset + 14 }]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.38)', 'rgba(255, 255, 255, 0.06)', 'transparent']}
        locations={[0, 0.5, 1]}
        style={styles.headerScrim}
        pointerEvents="none"
      />
      <Animated.View style={[styles.content, animStyle]}>
        <Text style={[styles.welcome, textHalo]}>Welcome to</Text>
        <View style={styles.logoRow}>
          <Text style={[styles.wash, textHalo]}>WASH</Text>
          <View style={styles.goWrap}>
            <GradientGo />
          </View>
        </View>
        <View style={styles.subtitleBlock}>
          <Text style={[styles.subtitle, textHalo]}>Choose your experience</Text>
          <Text style={[styles.subtitle, textHalo]}>to get started</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 30,
  },
  headerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ROLE_MOTION.layout.headerZoneHeight + 40,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  welcome: {
    fontSize: ROLE_LAYOUT.header.welcomeSize,
    fontWeight: '500',
    color: ROLE_PALETTE.brand.welcome,
    letterSpacing: 0.35,
    marginBottom: 8,
    textAlign: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 12,
  },
  wash: {
    fontSize: LOGO,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: ROLE_COLORS.deepBlue,
    lineHeight: LOGO + 2,
    paddingBottom: 2,
  },
  goWrap: {
    width: GO_W,
    height: GO_H,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 2,
  },
  subtitleBlock: {
    alignItems: 'center',
    gap: 3,
  },
  subtitle: {
    fontSize: ROLE_LAYOUT.header.subtitleSize,
    fontWeight: '400',
    color: ROLE_COLORS.textGray,
    textAlign: 'center',
    letterSpacing: 0.25,
    lineHeight: 21,
  },
});

const RoleSelectionHeader = memo(RoleSelectionHeaderImpl);
export default RoleSelectionHeader;
