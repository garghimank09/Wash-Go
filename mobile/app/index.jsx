import { useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import WaterRingRevealSplash from '../components/splash/WaterRingRevealSplash';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const router = useRouter();
  const didNavigate = useRef(false);
  const splashDone = useRef(false);
  const { user, initializing, isAuthenticated } = useAuth();

  const navigateFromAuth = useCallback(() => {
    if (didNavigate.current) return;
    if (initializing) return;

    didNavigate.current = true;
    requestAnimationFrame(() => {
      if (isAuthenticated) {
        router.replace('/(customer)/dashboard');
      } else {
        router.replace('/(auth)/welcome');
      }
    });
  }, [initializing, isAuthenticated, router]);

  const handleSplashComplete = useCallback(() => {
    splashDone.current = true;
    navigateFromAuth();
  }, [navigateFromAuth]);

  // If bootstrap finishes before splash animation ends, wait for splash
  useEffect(() => {
    if (!initializing && splashDone.current) {
      navigateFromAuth();
    }
  }, [initializing, navigateFromAuth, user]);

  return <WaterRingRevealSplash onComplete={handleSplashComplete} />;
}
