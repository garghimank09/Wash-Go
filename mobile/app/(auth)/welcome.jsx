import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AppIcon from '../../components/customer/AppIcon';

const { height } = Dimensions.get('window');

export default function Welcome() {
  const { theme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, initializing } = useAuth();
  const s = styles(theme);

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      router.replace('/(customer)/dashboard');
    }
  }, [initializing, isAuthenticated, router]);

  const handlePartner = () => {
    Alert.alert(
      'Coming soon',
      'The WashGo partner app is on the way. Check back soon to start earning as a washer.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.top}>
          <Text style={s.logo}>
            Wash<Text style={s.logoAccent}>Go</Text>
          </Text>
          <Text style={s.tagline}>On-demand car washing,{'\n'}at your doorstep.</Text>
        </View>

        <View style={s.middle}>
          <View style={s.card}>
            <View style={s.iconCircle}>
              <AppIcon name="local-car-wash" size={24} color={theme.accent.primary} />
            </View>
            <Text style={s.cardTitle}>Book a Wash</Text>
            <Text style={s.cardSub}>
              Schedule a premium wash at your home, office, or anywhere you choose.
            </Text>
            <TouchableOpacity
              style={s.primaryBtn}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.88}
            >
              <Text style={s.primaryBtnText}>Continue as customer</Text>
              <AppIcon name="arrow-forward" size={18} color={theme.button.primary.text} />
            </TouchableOpacity>
          </View>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <View style={s.card}>
            <View style={[s.iconCircle, s.iconCircleAlt]}>
              <AppIcon name="engineering" size={24} color={theme.text.secondary} />
            </View>
            <Text style={s.cardTitle}>I'm a Partner</Text>
            <Text style={s.cardSub}>
              Join as a washer, accept jobs nearby, and earn on your schedule.
            </Text>
            <TouchableOpacity
              style={s.ghostBtn}
              onPress={handlePartner}
              activeOpacity={0.88}
            >
              <Text style={s.ghostBtnText}>Partner sign-in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.bottom}>
          <Text style={s.footerText}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.surface,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 16,
      justifyContent: 'space-between',
    },
    top: {
      alignItems: 'center',
      paddingTop: height * 0.04,
    },
    logo: {
      fontSize: 40,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -1,
      marginBottom: 10,
    },
    logoAccent: {
      color: theme.accent.primary,
    },
    tagline: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    middle: {
      gap: 12,
    },
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 20,
      ...theme.shadow.md,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    iconCircleAlt: {
      backgroundColor: c.surfaceContainerLow,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 4,
      letterSpacing: -0.2,
    },
    cardSub: {
      fontSize: 13,
      color: theme.text.secondary,
      lineHeight: 19,
      marginBottom: 16,
    },
    primaryBtn: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: theme.accent.primary,
      borderRadius: theme.radius.full,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
    ghostBtn: {
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderRadius: theme.radius.full,
      paddingVertical: 14,
      alignItems: 'center',
    },
    ghostBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 8,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.outlineVariant,
    },
    dividerText: {
      fontSize: 13,
      color: theme.text.muted,
    },
    bottom: {
      alignItems: 'center',
      paddingBottom: 8,
    },
    footerText: {
      fontSize: 11,
      color: theme.text.muted,
      textAlign: 'center',
      lineHeight: 16,
    },
  });
};
