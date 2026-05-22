import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { useTheme } from '../../../context/ThemeContext';
import { getCustomerGradients, getCustomerShadow } from '../../../constants/customerTheme';
import AppIcon from '../AppIcon';
import { initialOf } from '../../../lib/profileHelpers';

export default function ProfileHeader({
  fullName,
  email,
  avatarUrl,
  completionPercent = 0,
  memberLabel = 'WashGo Member',
  onEditPhoto,
  uploading = false,
}) {
  const { theme, isDark } = useTheme();
  const gradients = getCustomerGradients(isDark);
  const shadows = getCustomerShadow(isDark);
  const c = theme.customer;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 320 }}
      style={[styles.wrap, shadows.soft]}
    >
      <LinearGradient
        colors={[...gradients.hero, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <BlurView intensity={isDark ? 24 : 40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <Pressable
          onPress={onEditPhoto}
          disabled={!onEditPhoto || uploading}
          style={({ pressed }) => [styles.avatarRing, pressed && { opacity: 0.92 }]}
          accessibilityLabel="Change profile photo"
        >
          <LinearGradient colors={gradients.hero} style={styles.avatarGradient}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <Text style={styles.avatarInitial}>{initialOf(fullName)}</Text>
            )}
          </LinearGradient>
          {uploading ? (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          ) : (
            <View style={[styles.cameraBadge, { backgroundColor: c.surfaceContainerLowest }]}>
              <AppIcon name="photo-camera" size={14} color={theme.accent.primary} />
            </View>
          )}
        </Pressable>

        <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={2}>
          {fullName || 'Your profile'}
        </Text>
        {email ? (
          <Text style={[styles.email, { color: theme.text.secondary }]} numberOfLines={1}>
            {email}
          </Text>
        ) : null}

        <View style={styles.badgeRow}>
          <View style={[styles.memberPill, { backgroundColor: 'rgba(6,182,212,0.14)' }]}>
              <AppIcon name="verified-user" size={14} color={theme.accent.primary} />
            <Text style={[styles.memberText, { color: theme.accent.dark }]}>{memberLabel}</Text>
          </View>
        </View>

        <View style={styles.completionWrap}>
          <View style={styles.completionLabels}>
            <Text style={[styles.completionLabel, { color: theme.text.muted }]}>
              Profile strength
            </Text>
            <Text style={[styles.completionPct, { color: theme.accent.primary }]}>
              {completionPercent}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: c.outlineVariant }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completionPercent}%`,
                  backgroundColor: theme.accent.primary,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 220,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
  },
  avatarRing: {
    marginBottom: 14,
  },
  avatarGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  email: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  memberText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  completionWrap: {
    width: '100%',
    marginTop: 18,
  },
  completionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completionLabel: { fontSize: 11, fontWeight: '600' },
  completionPct: { fontSize: 11, fontWeight: '800' },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
