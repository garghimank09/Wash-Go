import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Pressable,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCustomerScrollEndPadding } from '../../hooks/useCustomerContentPadding';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import { customerProfileService } from '../../services/customerProfileService';
import { garageService } from '../../services/garageService';
import { bookingService } from '../../services/bookingService';
import { mediaUrl } from '../../lib/mediaUrl';
import {
  deriveSavedAddresses,
  profileCompletionScore,
} from '../../lib/profileHelpers';
import {
  loadProfilePreferences,
  saveProfilePreferences,
} from '../../lib/profilePreferencesStore';
import ProfileHeader from '../../components/customer/profile/ProfileHeader';
import ProfileSectionCard from '../../components/customer/profile/ProfileSectionCard';
import ProfileMenuRow from '../../components/customer/profile/ProfileMenuRow';
import ProfileAddressCard from '../../components/customer/profile/ProfileAddressCard';
import ProfileVehicleRow from '../../components/customer/profile/ProfileVehicleRow';
import ProfileEditSheet from '../../components/customer/profile/ProfileEditSheet';
import BookingCard from '../../components/customer/BookingCard';
import CustomerSkeleton from '../../components/customer/ui/CustomerSkeleton';

function Stagger({ index, children }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 340, delay: index * 55 }}
    >
      {children}
    </MotiView>
  );
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const scrollEndPadding = useCustomerScrollEndPadding();
  const c = theme.customer;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(mediaUrl(user?.avatar_url));

  const [vehicles, setVehicles] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [prefs, setPrefs] = useState({
    pushNotifications: true,
    bookingReminders: true,
    marketingEmails: false,
    language: 'English',
    darkMode: 'system',
  });

  const loadAll = useCallback(async () => {
    try {
      const [profile, cars, bookings, preferences] = await Promise.all([
        customerProfileService.get().catch(() => null),
        garageService.getVehicles().catch(() => []),
        bookingService.getBookings().catch(() => []),
        loadProfilePreferences(),
      ]);

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setEmail(profile.email || '');
        setAvatarUrl(mediaUrl(profile.avatar_url));
      } else if (user) {
        setFullName(user.full_name || '');
        setPhone(user.phone || '');
        setEmail(user.email || '');
        setAvatarUrl(mediaUrl(user.avatar_url));
      }

      setVehicles(Array.isArray(cars) ? cars : []);
      const list = Array.isArray(bookings) ? bookings : bookings?.items ?? [];
      const sorted = [...list].sort(
        (a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at),
      );
      setRecentBookings(sorted.slice(0, 3));
      setAddresses(deriveSavedAddresses(sorted));
      setPrefs(preferences);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const completion = profileCompletionScore({
    fullName,
    email,
    phone,
    avatarUrl,
  });

  const handleSaveProfile = async (body) => {
    setSaving(true);
    try {
      const data = await customerProfileService.update(body);
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setAvatarUrl(mediaUrl(data.avatar_url));
      await refreshUser();
      setEditVisible(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Could not save', err.message || 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert('Permission needed', 'Allow photo access to update your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const data = await customerProfileService.uploadAvatar({
        uri: asset.uri,
        fileName: asset.fileName || 'avatar.jpg',
        mimeType: asset.mimeType || 'image/jpeg',
      });
      setAvatarUrl(mediaUrl(data.avatar_url));
      await refreshUser();
    } catch (err) {
      Alert.alert('Upload failed', err.message || 'Try again.');
    } finally {
      setUploading(false);
    }
  };

  const togglePref = async (key, value) => {
    const next = await saveProfilePreferences({ [key]: value });
    setPrefs(next);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/(auth)/welcome');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.safe, { backgroundColor: c.surface }]}>
        <View style={styles.skeletonPad}>
          <CustomerSkeleton />
          <CustomerSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: c.surface }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: scrollEndPadding + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent.primary} />
        }
      >
        <Text style={[styles.screenTitle, { color: theme.text.primary }]}>Profile</Text>
        <Text style={[styles.screenSub, { color: theme.text.muted }]}>
          Your account, vehicles, and preferences
        </Text>

        <Stagger index={0}>
          <ProfileHeader
            fullName={fullName}
            email={email}
            avatarUrl={avatarUrl}
            completionPercent={completion}
            onEditPhoto={handlePickAvatar}
            uploading={uploading}
          />
        </Stagger>

        <Stagger index={1}>
          <ProfileSectionCard
            title="Personal information"
            subtitle="Name, phone, and email"
            actionLabel="Edit"
            onAction={() => setEditVisible(true)}
          >
            <ProfileMenuRow
              icon="person"
              label="Full name"
              value={fullName || '—'}
              showChevron={false}
              last={false}
            />
            <ProfileMenuRow
              icon="phone"
              label="Phone"
              value={phone || 'Add phone number'}
              onPress={() => setEditVisible(true)}
            />
            <ProfileMenuRow
              icon="email"
              label="Email"
              value={email || '—'}
              showChevron={false}
              last
            />
          </ProfileSectionCard>
        </Stagger>

        <Stagger index={2}>
          <ProfileSectionCard
            title="Saved addresses"
            subtitle="From recent bookings · full address book coming soon"
          >
            {addresses.map((addr) => (
              <ProfileAddressCard
                key={addr.id}
                address={addr}
                onPress={() =>
                  Alert.alert(addr.label, addr.address, [{ text: 'OK' }])
                }
              />
            ))}
          </ProfileSectionCard>
        </Stagger>

        <Stagger index={3}>
          <ProfileSectionCard
            title="My vehicles"
            subtitle={`${vehicles.length} registered`}
            actionLabel={vehicles.length ? 'Garage' : 'Add'}
            onAction={() => router.push('/(customer)/garage')}
          >
            {vehicles.length === 0 ? (
              <Pressable
                onPress={() => router.push('/add-vehicle/intro')}
                style={[styles.emptyCta, { borderColor: theme.accent.primary }]}
              >
                <Text style={[styles.emptyCtaText, { color: theme.accent.primary }]}>
                  Add your first vehicle
                </Text>
              </Pressable>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {vehicles.map((v) => (
                  <ProfileVehicleRow
                    key={v.id}
                    vehicle={v}
                    onPress={() => router.push(`/vehicle/${v.id}`)}
                  />
                ))}
              </ScrollView>
            )}
          </ProfileSectionCard>
        </Stagger>

        <Stagger index={4}>
          <ProfileSectionCard
            title="Recent bookings"
            actionLabel="See all"
            onAction={() => router.push('/(customer)/bookings')}
          >
            {recentBookings.length === 0 ? (
              <Text style={[styles.emptyHint, { color: theme.text.muted }]}>
                No bookings yet. Book your first wash from Home.
              </Text>
            ) : (
              recentBookings.map((b, i) => (
                <View key={b.id} style={i > 0 ? { marginTop: 10 } : null}>
                  <BookingCard
                    booking={b}
                    onPress={() => router.push(`/booking/${b.id}`)}
                  />
                </View>
              ))
            )}
          </ProfileSectionCard>
        </Stagger>

        <Stagger index={5}>
          <ProfileSectionCard
            title="Payment & billing"
            subtitle="Secure payments powered by WashGo"
          >
            <View style={[styles.paymentCard, { backgroundColor: c.surfaceContainerLow }]}>
              <View style={[styles.paymentChip, { backgroundColor: 'rgba(6,182,212,0.2)' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.paymentTitle, { color: theme.text.primary }]}>
                  WashGo Wallet
                </Text>
                <Text style={[styles.paymentSub, { color: theme.text.muted }]}>
                  Cards & UPI — coming soon
                </Text>
              </View>
              <View style={[styles.soonPill, { backgroundColor: c.surfaceContainer }]}>
                <Text style={[styles.soonText, { color: theme.text.muted }]}>Soon</Text>
              </View>
            </View>
          </ProfileSectionCard>
        </Stagger>

        <Stagger index={6}>
          <ProfileSectionCard title="App preferences">
            <ProfileMenuRow
              icon="notifications"
              label="Push notifications"
              toggle
              toggleValue={prefs.pushNotifications}
              onToggleChange={(v) => togglePref('pushNotifications', v)}
            />
            <ProfileMenuRow
              icon="event"
              label="Booking reminders"
              toggle
              toggleValue={prefs.bookingReminders}
              onToggleChange={(v) => togglePref('bookingReminders', v)}
            />
            <ProfileMenuRow
              icon="mail"
              label="Marketing emails"
              toggle
              toggleValue={prefs.marketingEmails}
              onToggleChange={(v) => togglePref('marketingEmails', v)}
            />
            <ProfileMenuRow
              icon="language"
              label="Language"
              value={prefs.language}
              onPress={() =>
                Alert.alert('Language', 'More languages will be available in a future update.')
              }
            />
            <ProfileMenuRow
              icon="brightness-6"
              label="Appearance"
              value={`${prefs.darkMode} (follows device)`}
              onPress={() =>
                Alert.alert('Appearance', 'Theme follows your device settings for now.')
              }
              last
            />
          </ProfileSectionCard>
        </Stagger>

        <Stagger index={7}>
          <ProfileSectionCard title="Support">
            <ProfileMenuRow
              icon="help"
              label="Help center"
              onPress={() => Alert.alert('Help', 'Contact support@washgo.local for assistance.')}
            />
            <ProfileMenuRow
              icon="description"
              label="Terms & privacy"
              onPress={() => Alert.alert('Legal', 'Terms and privacy policy — coming soon.')}
              last
            />
          </ProfileSectionCard>
        </Stagger>

        <Stagger index={8}>
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [
              styles.logoutBtn,
              { borderColor: 'rgba(239,68,68,0.35)', backgroundColor: 'rgba(239,68,68,0.06)' },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Text style={styles.logoutText}>
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </Text>
          </Pressable>
        </Stagger>
      </ScrollView>

      <ProfileEditSheet
        visible={editVisible}
        fullName={fullName}
        phone={phone}
        email={email}
        saving={saving}
        onClose={() => setEditVisible(false)}
        onSave={handleSaveProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: CUSTOMER_LAYOUT.screenPadding,
    paddingTop: 12,
    gap: CUSTOMER_LAYOUT.sectionGap,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  screenSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 8,
  },
  skeletonPad: {
    padding: CUSTOMER_LAYOUT.screenPadding,
    gap: 16,
  },
  emptyCta: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyCtaText: { fontSize: 14, fontWeight: '700' },
  emptyHint: { fontSize: 13, fontWeight: '500', lineHeight: 19 },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
  },
  paymentChip: {
    width: 44,
    height: 32,
    borderRadius: 8,
  },
  paymentTitle: { fontSize: 15, fontWeight: '800' },
  paymentSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  soonPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  soonText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
});
