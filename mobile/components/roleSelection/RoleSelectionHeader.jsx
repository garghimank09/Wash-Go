import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { ROLE_COLORS, ROLE_PALETTE, ROLE_LAYOUT } from '../../constants/roleSelectionTheme';
import { ROLE_MOTION } from '../../constants/roleSelectionMotion';

const LOGO = ROLE_LAYOUT.header.logoSize;
const GO_W = 88;
const GO_H = 54;

const textHalo = Platform.select({
  ios: {
    textShadowColor: 'rgba(255, 255, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  android: { elevation: 0 },
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

/**
 * Centered header — WASH navy + GO accent; subtitle readable on both halves.
 */
function RoleSelectionHeaderImpl({ topInset, reduceMotion = false }) {
  const delay = (ms = 0) => (reduceMotion ? 0 : ROLE_MOTION.delay.header + ms);

  return (
    <View pointerEvents="none" style={[styles.wrap, { paddingTop: topInset + 16 }]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.42)', 'rgba(255, 255, 255, 0.08)', 'transparent']}
        locations={[0, 0.55, 1]}
        style={styles.headerScrim}
        pointerEvents="none"
      />
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: delay(0) }}
      >
        <Text style={[styles.welcome, textHalo]}>Welcome to</Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: -14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 540, delay: delay(90) }}
        style={styles.logoRow}
      >
        <Text style={[styles.wash, textHalo]}>WASH</Text>
        <View style={styles.goWrap}>
          <GradientGo />
        </View>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 520, delay: delay(200) }}
        style={styles.subtitleBlock}
      >
        <Text style={[styles.subtitle, textHalo]}>Choose your experience</Text>
        <Text style={[styles.subtitle, textHalo]}>to get started</Text>
      </MotiView>
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
    zIndex: 20,
  },
  headerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  welcome: {
    fontSize: ROLE_LAYOUT.header.welcomeSize,
    fontWeight: '500',
    color: ROLE_PALETTE.brand.welcome,
    letterSpacing: 0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  wash: {
    fontSize: LOGO,
    fontWeight: '900',
    letterSpacing: 1,
    color: ROLE_COLORS.deepBlue,
    lineHeight: LOGO + 4,
  },
  goWrap: {
    width: GO_W,
    height: GO_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleBlock: {
    alignItems: 'center',
    gap: 2,
  },
  subtitle: {
    fontSize: ROLE_LAYOUT.header.subtitleSize,
    fontWeight: '400',
    color: ROLE_COLORS.textGray,
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
});

const RoleSelectionHeader = memo(RoleSelectionHeaderImpl);
export default RoleSelectionHeader;
