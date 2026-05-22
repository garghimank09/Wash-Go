import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import RoleSelectionScreen from '../../components/roleSelection/RoleSelectionScreen';

export default function Welcome() {
  const router = useRouter();
  const { isAuthenticated, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      router.replace('/(customer)/dashboard');
    }
  }, [initializing, isAuthenticated, router]);

  const handleCustomer = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handlePartner = useCallback(() => {
    router.push('/(auth)/partner-login');
  }, [router]);

  return (
    <RoleSelectionScreen onCustomer={handleCustomer} onPartner={handlePartner} />
  );
}
