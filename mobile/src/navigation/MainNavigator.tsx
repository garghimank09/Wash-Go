import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { AiAssistantScreen } from '../screens/AiAssistantScreen';
import { BookingDetailScreen } from '../screens/BookingDetailScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { BookingsListScreen } from '../screens/BookingsListScreen';
import { CarsScreen } from '../screens/CarsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { MainStackParamList, MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colors.bgElevated },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          paddingTop: spacing.xs,
          height: 62,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, 'home' | 'car-sport' | 'calendar'> = {
            Home: 'home',
            Cars: 'car-sport',
            Bookings: 'calendar',
          };
          const icon = map[route.name] ?? 'home';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'WashGo' }} />
      <Tab.Screen name="Cars" component={CarsScreen} options={{ title: 'My cars' }} />
      <Tab.Screen name="Bookings" component={BookingsListScreen} options={{ title: 'Bookings' }} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgElevated },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: 'Book a wash', presentation: 'modal' }}
      />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking details' }} />
      <Stack.Screen name="AiAssistant" component={AiAssistantScreen} options={{ title: 'WashGo AI' }} />
    </Stack.Navigator>
  );
}
