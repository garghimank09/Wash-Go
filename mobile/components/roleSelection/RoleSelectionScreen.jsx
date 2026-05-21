import { useCallback, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SplitPanel from './SplitPanel';
import RoleSelectionHeader from './RoleSelectionHeader';
import { useRoleSlideGateway } from './useRoleSlideGateway';
import { ROLE_MOTION } from '../../constants/roleSelectionMotion';
import { ROLE_PALETTE } from '../../constants/roleSelectionTheme';

const CAR_HERO = require('../../assets/leftSideCarRole.png');
const MACHINE_HERO = require('../../assets/role-selection/machineRoleSelection.png');

/**
 * Cinematic split-screen onboarding gateway.
 * Slide the frosted arrow on each side to expand that portal and enter.
 */
export default function RoleSelectionScreen({ onCustomer, onPartner }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= ROLE_MOTION.layout.tabletBreakpoint;
  const [reduceMotion, setReduceMotion] = useState(false);
  const [motionChecked, setMotionChecked] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [gatewayResetKey, setGatewayResetKey] = useState(0);

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

  const gateway = useRoleSlideGateway({ reduceMotion, isTablet });
  const {
    customerProgress,
    partnerProgress,
    entry,
    customerWidthRatio,
    customerIntensity,
    partnerIntensity,
    parallax,
    startEntry,
    resetToNeutral,
  } = gateway;

  useEffect(() => {
    if (!motionChecked) return;
    startEntry();
  }, [motionChecked, startEntry]);

  /** Always return to neutral 50/50 when user navigates back to welcome. */
  useFocusEffect(
    useCallback(() => {
      setIsCompleting(false);
      resetToNeutral({ replayEntry: false });
      setGatewayResetKey((k) => k + 1);
      return () => {
        resetToNeutral({ replayEntry: false });
      };
    }, [resetToNeutral]),
  );

  const customerPanelStyle = useAnimatedStyle(() => ({
    width: screenWidth * customerWidthRatio.value,
  }));

  const partnerPanelStyle = useAnimatedStyle(() => ({
    width: screenWidth * (1 - customerWidthRatio.value),
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    left: screenWidth * customerWidthRatio.value - 0.5,
    opacity: 0.1 + Math.abs(parallax.value) * 0.3,
  }));

  const finishCustomer = useCallback(() => {
    if (isCompleting) return;
    setIsCompleting(true);
    onCustomer?.();
  }, [isCompleting, onCustomer]);

  const finishPartner = useCallback(() => {
    if (isCompleting) return;
    setIsCompleting(true);
    onPartner?.();
  }, [isCompleting, onPartner]);

  const footerBottom = Math.max(insets.bottom, 12) + 8;
  const gatewayBottom = Math.max(insets.bottom, 16) + 36;

  if (!motionChecked) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <RoleSelectionHeader topInset={insets.top} reduceMotion={reduceMotion} />

      <View style={styles.split}>
        <SplitPanel
          side="customer"
          hero={CAR_HERO}
          title="BOOK A WASH"
          subtitle="I'm a customer"
          panelStyle={customerPanelStyle}
          slideProgress={customerProgress}
          oppositeProgress={partnerProgress}
          intensity={customerIntensity}
          parallax={parallax}
          entry={entry}
          bottomInset={gatewayBottom}
          reduceMotion={reduceMotion}
          entryDelay={ROLE_MOTION.delay.leftPanel}
          onComplete={finishCustomer}
          gatewayDisabled={isCompleting}
          gatewayResetKey={gatewayResetKey}
        />

        <Animated.View style={[styles.divider, dividerStyle]} pointerEvents="none" />

        <SplitPanel
          side="partner"
          hero={MACHINE_HERO}
          title="CONTINUE AS PARTNER"
          subtitle="I'm a washer partner"
          panelStyle={partnerPanelStyle}
          slideProgress={partnerProgress}
          oppositeProgress={customerProgress}
          intensity={partnerIntensity}
          parallax={parallax}
          entry={entry}
          bottomInset={gatewayBottom}
          reduceMotion={reduceMotion}
          entryDelay={ROLE_MOTION.delay.rightPanel}
          onComplete={finishPartner}
          gatewayDisabled={isCompleting}
          gatewayResetKey={gatewayResetKey}
        />
      </View>

      <View
        pointerEvents="none"
        style={[styles.footer, { paddingBottom: footerBottom }]}
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
  split: {
    flex: 1,
    flexDirection: 'row',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: 'rgba(43,156,255,0.28)',
    zIndex: 2,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 8,
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
