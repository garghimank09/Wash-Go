import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '../../../context/ThemeContext';
import AppIcon from '../AppIcon';

export default function AchievementBadge({ achievement, index = 0 }) {
  const { theme } = useTheme();
  const c = theme.customer;
  const earned = achievement.earned;
  const progress = achievement.progress ?? (earned ? 1 : 0);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 320, delay: index * 60 }}
      style={[
        styles.card,
        {
          backgroundColor: c.surfaceContainerLowest,
          borderColor: earned ? 'rgba(6,182,212,0.35)' : c.outlineVariant,
        },
      ]}
    >
      {earned ? (
        <LinearGradient
          colors={['rgba(6,182,212,0.15)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: earned ? 'rgba(6,182,212,0.14)' : c.surfaceContainer,
          },
        ]}
      >
        <AppIcon
          name={achievement.icon}
          size={22}
          color={earned ? theme.accent.primary : theme.text.muted}
        />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{achievement.title}</Text>
        <Text style={[styles.sub, { color: theme.text.muted }]}>{achievement.subtitle}</Text>
        {!earned && progress > 0 ? (
          <View style={[styles.track, { backgroundColor: c.outlineVariant }]}>
            <View
              style={[
                styles.fill,
                { width: `${Math.round(progress * 100)}%`, backgroundColor: theme.accent.primary },
              ]}
            />
          </View>
        ) : earned ? (
          <Text style={[styles.earned, { color: theme.accent.dark }]}>Unlocked</Text>
        ) : null}
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: '800' },
  sub: { fontSize: 12, fontWeight: '500' },
  track: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
  earned: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
});
