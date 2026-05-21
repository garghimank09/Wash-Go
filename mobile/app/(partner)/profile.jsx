import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import {
  ChevronRight,
  CircleHelp,
  LogOut,
  MapPin,
  Moon,
  Phone,
  Shield,
  Sun,
  UserRound,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { usePartnerStatus } from '../../context/PartnerStatusContext';
import { usePartnerScrollEndPadding } from '../../hooks/usePartnerContentPadding';
import {
  getPartnerStatus,
  getPartnerShadow,
} from '../../constants/partnerTheme';

function initialOf(name) {
  if (!name) return 'P';
  const trimmed = String(name).trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'P';
}

function StatusLabel({ status }) {
  if (status === 'online_accepting') return 'Online · accepting jobs';
  if (status === 'online_busy') return 'On a job';
  return 'Offline';
}

export default function PartnerProfile() {
  const router = useRouter();
  const { theme, isDark, setThemePreference } = useTheme();
  const toggleTheme = useCallback(() => {
    setThemePreference(isDark ? 'light' : 'dark');
  }, [isDark, setThemePreference]);
  const { user, refreshPartner, logoutPartner } = usePartnerAuth();
  const { status, serviceArea } = usePartnerStatus();
  const scrollEndPadding = usePartnerScrollEndPadding();

  const statusTokens = getPartnerStatus(status, isDark);
  const shadows = getPartnerShadow(isDark);

  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshPartner();
    } finally {
      setRefreshing(false);
    }
  }, [refreshPartner]);

  const handleLogout = useCallback(() => {
    Alert.alert('Sign out?', 'You will need to sign in again to receive jobs.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await logoutPartner();
            router.replace('/(auth)/welcome');
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  }, [logoutPartner, router]);

  const displayName = user?.full_name || 'Partner';
  const email = user?.email || '—';
  const phone = user?.phone || null;
  const role = user?.role === 'washer' ? 'Washer Partner' : (user?.role || '—');
  const serviceAreaLabel = serviceArea || 'Not set';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.customer.surface }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: scrollEndPadding + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent.primary}
          />
        }
      >
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 260 }}
        >
          <View style={[styles.heroCard, shadows.soft]}>
            <LinearGradient
              colors={statusTokens.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroInner}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initialOf(displayName)}</Text>
              </View>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.role}>{role}</Text>
              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: statusTokens.dot }]} />
                <Text style={styles.statusText}>
                  <StatusLabel status={status} />
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        <Section title="Account">
          <Row
            icon={UserRound}
            label="Email"
            value={email}
            theme={theme}
            isDark={isDark}
          />
          {phone ? (
            <Row
              icon={Phone}
              label="Phone"
              value={phone}
              theme={theme}
              isDark={isDark}
            />
          ) : null}
          <Row
            icon={MapPin}
            label="Service area"
            value={serviceAreaLabel}
            theme={theme}
            isDark={isDark}
          />
        </Section>

        <Section title="Preferences">
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: theme.customer.surfaceContainerLowest,
                borderColor: theme.customer.outlineVariant,
              },
              shadows.rim,
              pressed && { opacity: 0.94 },
            ]}
          >
            <View style={[styles.rowIcon, { backgroundColor: theme.customer.primaryBg }]}>
              {isDark ? (
                <Sun size={18} color={theme.accent.primary} strokeWidth={2.2} />
              ) : (
                <Moon size={18} color={theme.accent.primary} strokeWidth={2.2} />
              )}
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: theme.text.secondary }]}>Appearance</Text>
              <Text style={[styles.rowValue, { color: theme.text.primary }]}>
                {isDark ? 'Dark' : 'Light'} mode
              </Text>
            </View>
            <ChevronRight size={18} color={theme.text.muted} />
          </Pressable>
        </Section>

        <Section title="Support">
          <ActionRow
            icon={Shield}
            label="Privacy & safety"
            theme={theme}
            isDark={isDark}
            shadows={shadows}
          />
          <ActionRow
            icon={CircleHelp}
            label="Help center"
            theme={theme}
            isDark={isDark}
            shadows={shadows}
          />
        </Section>

        <Pressable
          onPress={handleLogout}
          disabled={signingOut}
          style={({ pressed }) => [
            styles.logout,
            {
              backgroundColor: theme.customer.surfaceContainerLowest,
              borderColor: theme.customer.outlineVariant,
            },
            shadows.rim,
            pressed && { opacity: 0.94 },
            signingOut && { opacity: 0.6 },
          ]}
        >
          <LogOut size={18} color={theme.customer.error} strokeWidth={2.2} />
          <Text style={[styles.logoutText, { color: theme.customer.error }]}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ icon: Icon, label, value, theme, isDark }) {
  const shadows = getPartnerShadow(isDark);
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.customer.surfaceContainerLowest,
          borderColor: theme.customer.outlineVariant,
        },
        shadows.rim,
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: theme.customer.primaryBg }]}>
        <Icon size={18} color={theme.accent.primary} strokeWidth={2.2} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: theme.text.secondary }]}>
          {label}
        </Text>
        <Text style={[styles.rowValue, { color: theme.text.primary }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ActionRow({ icon: Icon, label, theme, isDark, shadows }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.customer.surfaceContainerLowest,
          borderColor: theme.customer.outlineVariant,
        },
        shadows.rim,
        pressed && { opacity: 0.94 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: theme.customer.primaryBg }]}>
        <Icon size={18} color={theme.accent.primary} strokeWidth={2.2} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowValue, { color: theme.text.primary }]}>
          {label}
        </Text>
      </View>
      <ChevronRight size={18} color={theme.text.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 12 },
  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 22,
  },
  heroInner: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  role: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionBody: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  rowValue: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 6,
  },
  logoutText: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
});
