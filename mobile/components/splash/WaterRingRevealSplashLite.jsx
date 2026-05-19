import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useSplashProgress } from '../../hooks/useSplashProgress';
import SplashBackground from './SplashBackground';
import StaticDropletField from './StaticDropletField';
import WaterRingLite from './WaterRingLite';
import CarReveal from './CarReveal';
import WashGoLogo from './WashGoLogo';

SplashScreen.preventAutoHideAsync().catch(() => {});

const { height: SCREEN_H } = Dimensions.get('window');

export default function WaterRingRevealSplashLite({ onComplete }) {
  const insets = useSafeAreaInsets();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [motionChecked, setMotionChecked] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => setReduceMotion(enabled))
      .finally(() => setMotionChecked(true));
  }, []);

  const progress = useSplashProgress(onComplete, motionChecked && !reduceMotion);

  useEffect(() => {
    if (motionChecked && reduceMotion) {
      requestAnimationFrame(() => onComplete?.());
    }
  }, [motionChecked, reduceMotion, onComplete]);

  if (!motionChecked || reduceMotion) {
    return <View style={[styles.root, { backgroundColor: '#FFFFFF' }]} />;
  }

  const centerY = SCREEN_H * 0.38 + insets.top * 0.25;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <SplashBackground progress={progress} centerY={centerY} />
      <StaticDropletField />
      <WaterRingLite progress={progress} />
      <View style={[styles.stage, { top: centerY - 75 }]}>
        <CarReveal progress={progress} />
        <WashGoLogo progress={progress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  stage: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
