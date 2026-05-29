import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import WaterRingRevealSplash from '../components/splash/WaterRingRevealSplash';
import { useAuth } from '../context/AuthContext';
import { usePartnerAuth } from '../context/PartnerAuthContext';
import { getLastActiveRole } from '../lib/partnerSessionStore';
 
/**
* Splash + role-aware routing.
*
* Both customer and partner bootstraps run in parallel via their respective
* contexts. Once both finish (and the splash animation completes), we route:
*
*   1. Last active role wins ties (so a user with both sessions lands where
*      they last were).
*   2. Otherwise prefer the authenticated role.
*   3. Otherwise welcome screen.
*/
export default function Index() {
  const router = useRouter();
  const didNavigate = useRef(false);
  const splashDone = useRef(false);
 
  const { initializing: customerInit, isAuthenticated: isCustomer } = useAuth();
  const { initializing: partnerInit, isPartnerAuthenticated: isPartner } =
    usePartnerAuth();
 
  const navigate = useCallback(async () => {
    if (didNavigate.current) return;
    if (customerInit || partnerInit) return;
    if (!splashDone.current) return;
 
    didNavigate.current = true;
 
    const lastRole = await getLastActiveRole();
 
    const target = (() => {
      if (isPartner && isCustomer) {
        return lastRole === 'customer'
          ? '/(customer)/dashboard'
          : '/(partner)/home';
      }
      if (isPartner) return '/(partner)/home';
      if (isCustomer) return '/(customer)/dashboard';
      return '/(auth)/welcome';
    })();
 
    requestAnimationFrame(() => {
      router.replace(target);
    });
  }, [customerInit, partnerInit, isCustomer, isPartner, router]);
 
  const handleSplashComplete = useCallback(() => {
    splashDone.current = true;
    navigate();
  }, [navigate]);
 
  useEffect(() => {
    navigate();
  }, [navigate]);
 
  return <WaterRingRevealSplash onComplete={handleSplashComplete} />;
}