import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from '../../components/customer/AppIcon';
import AuthGate from '../../components/auth/AuthGate';

const TAB_CONFIG = [
  { name: 'dashboard', label: 'Home', icon: 'home', filledWhenActive: true },
  { name: 'bookings', label: 'Bookings', icon: 'calendar-month' },
  { name: 'garage', label: 'Garage', icon: 'directions-car' },
  { name: 'rewards', label: 'Rewards', icon: 'card-giftcard' },
  { name: 'profile', label: 'Profile', icon: 'person' },
];

function CustomerTabBar({ state, descriptors, navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.customer;

  return (
    <View
      style={[
        tabStyles.wrap,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopColor: c.outlineVariant + '80',
        },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={80}
          tint={theme.dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface }]} />
      )}
      <View style={tabStyles.row}>
        {TAB_CONFIG.map((config) => {
            const route = state.routes.find((r) => r.name === config.name);
            if (!route) return null;

            const isFocused = state.routes[state.index]?.name === config.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(config.name);
              }
            };

            return (
              <Pressable
                key={config.name}
                onPress={onPress}
                style={[
                  tabStyles.tab,
                  isFocused && {
                    backgroundColor: theme.nav.activePill,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                <AppIcon
                  name={config.icon}
                  size={24}
                  filled={isFocused && config.filledWhenActive}
                  color={isFocused ? theme.nav.active : theme.nav.inactive}
                  style={{ opacity: isFocused ? 1 : 0.7 }}
                />
                <Text
                  style={[
                    tabStyles.label,
                    {
                      color: isFocused ? theme.nav.active : theme.nav.inactive,
                      opacity: isFocused ? 1 : 0.7,
                    },
                  ]}
                >
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 2,
    minWidth: 56,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default function CustomerLayout() {
  return (
    <AuthGate>
      <Tabs
        tabBar={(props) => <CustomerTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
        <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
        <Tabs.Screen name="garage" options={{ title: 'Garage' }} />
        <Tabs.Screen name="rewards" options={{ title: 'Rewards' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </AuthGate>
  );
}
