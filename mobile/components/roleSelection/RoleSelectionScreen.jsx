import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RolePortal from './RolePortal';
import RoleSelectionHeader from './RoleSelectionHeader';
import { useRoleCinematicGateway } from './useRoleCinematicGateway';
import { DEBUG_ROLE_LAYOUT } from '../../constants/roleSelectionComposition';
import { ROLE_MOTION } from '../../constants/roleSelectionMotion';
import { ROLE_LAYOUT, ROLE_PALETTE } from '../../constants/roleSelectionTheme';

const CAR_HERO = require('../../assets/leftSideCarRole.png');
const MACHINE_HERO = require('../../assets/role-selection/machineRoleSelection.png');

/**
 * Cinematic split-screen — translateX portals + half-region composition grids.
 */
export default function RoleSelectionScreen({ onCustomer, onPartner }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [motionChecked, setMotionChecked] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [gatewayResetKey, setGatewayResetKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const layoutInsets = useMemo(() => {
    const headerZone = ROLE_MOTION.layout.headerZoneHeight + insets.top;
    const footerReserve =
      ROLE_LAYOUT.composition.footerReserve + Math.max(insets.bottom, 12);
    const ctaReserve = ROLE_LAYOUT.composition.ctaBlockHeight;
    const compositionBottom = footerReserve + ctaReserve;
    return { headerZone, compositionBottom, footerReserve };
  }, [insets.top, insets.bottom]);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (alive) setReduceMotion(enabled);
      })
      .finally(() => {
        if (alive) setMotionChecked(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const gateway = useRoleCinematicGateway({ reduceMotion, screenWidth });
  const {
    customerProgress,
    partnerProgress,
    entry,
    customerTranslateX,
    partnerTranslateX,
    customerOpacity,
    partnerOpacity,
    splitLineX,
    customerIntensity,
    partnerIntensity,
    parallax,
    customerContentOpacity,
    partnerContentOpacity,
    startEntry,
    resetToNeutral,
    lockInteraction,
  } = gateway;

  useEffect(() => {
    if (!motionChecked) return;
    startEntry();
  }, [motionChecked, startEntry]);

  useFocusEffect(
    useCallback(() => {
      setIsCompleting(false);
      setIsDragging(false);
      resetToNeutral({ replayEntry: false });
      setGatewayResetKey((k) => k + 1);
      return () => {
        resetToNeutral({ replayEntry: false });
      };
    }, [resetToNeutral]),
  );

  const seamStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: splitLineX.value - 0.5 }],
    opacity: DEBUG_ROLE_LAYOUT
      ? 0
      : 0.1 + Math.abs(customerProgress.value - partnerProgress.value) * 0.18,
  }));

  const partnerStackStyle = useAnimatedStyle(() => ({
    zIndex: partnerProgress.value > customerProgress.value ? 11 : 9,
  }));

  const customerStackStyle = useAnimatedStyle(() => ({
    zIndex: customerProgress.value >= partnerProgress.value ? 11 : 9,
  }));

  const finishCustomer = useCallback(() => {
    if (isCompleting) return;
    setIsCompleting(true);
    lockInteraction();
    onCustomer?.();
  }, [isCompleting, lockInteraction, onCustomer]);

  const finishPartner = useCallback(() => {
    if (isCompleting) return;
    setIsCompleting(true);
    lockInteraction();
    onPartner?.();
  }, [isCompleting, lockInteraction, onPartner]);

  if (!motionChecked) {
    return <View style={styles.root} />;
  }

  const { headerZone, compositionBottom, footerReserve } = layoutInsets;

  return (
    <View style={styles.root}>
      <View style={styles.stage} pointerEvents="box-none">
        <RolePortal
          side="partner"
          hero={MACHINE_HERO}
          title="CONTINUE AS PARTNER"
          subtitle="I'm a washer partner"
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          topInset={headerZone}
          bottomInset={compositionBottom}
          translateX={partnerTranslateX}
          opacity={partnerOpacity}
          compositionOpacity={partnerContentOpacity}
          stackStyle={partnerStackStyle}
          slideProgress={partnerProgress}
          oppositeProgress={customerProgress}
          intensity={partnerIntensity}
          parallax={parallax}
          entry={entry}
          reduceMotion={reduceMotion}
          entryDelay={ROLE_MOTION.delay.rightPanel}
          onComplete={finishPartner}
          gatewayDisabled={isCompleting}
          gatewayResetKey={gatewayResetKey}
          isInteracting={isDragging}
        />

        <RolePortal
          side="customer"
          hero={CAR_HERO}
          title="BOOK A WASH"
          subtitle="I'm a customer"
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          topInset={headerZone}
          bottomInset={compositionBottom}
          translateX={customerTranslateX}
          opacity={customerOpacity}
          compositionOpacity={customerContentOpacity}
          stackStyle={customerStackStyle}
          slideProgress={customerProgress}
          oppositeProgress={partnerProgress}
          intensity={customerIntensity}
          parallax={parallax}
          entry={entry}
          reduceMotion={reduceMotion}
          entryDelay={ROLE_MOTION.delay.leftPanel}
          onComplete={finishCustomer}
          gatewayDisabled={isCompleting}
          gatewayResetKey={gatewayResetKey}
          isInteracting={isDragging}
        />

        <Animated.View
          pointerEvents="none"
          style={[styles.seam, { top: headerZone }, seamStyle]}
        />
      </View>

      <RoleSelectionHeader topInset={insets.top} reduceMotion={reduceMotion} />

      {reduceMotion ? (
        <View style={[styles.tapZones, { top: headerZone }]} pointerEvents="box-none">
          <Pressable
            style={styles.tapHalf}
            onPress={finishCustomer}
            accessibilityRole="button"
            accessibilityLabel="Customer sign in"
          />
          <Pressable
            style={styles.tapHalf}
            onPress={finishPartner}
            accessibilityRole="button"
            accessibilityLabel="Partner sign in"
          />
        </View>
      ) : null}

      <View
        pointerEvents="none"
        style={[styles.footer, { paddingBottom: footerReserve }]}
      >
        <Text style={styles.footerText} numberOfLines={3}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#040E1F',
  },
  stage: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  seam: {
    position: 'absolute',
    bottom: 0,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: 'rgba(43, 156, 255, 0.32)',
    zIndex: 6,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 25,
  },
  tapHalf: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 50,
  },
  footerText: {
    fontSize: 10,
    color: ROLE_PALETTE.brand.footer,
    textAlign: 'center',
    letterSpacing: 0.25,
    lineHeight: 14,
    opacity: 0.92,
  },
});
