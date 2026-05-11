import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Cars: undefined;
  Bookings: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Booking: undefined;
  BookingDetail: { bookingId: string };
  AiAssistant: undefined;
};

/** Tab screens that open stack routes on the parent navigator */
export type HomeTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<MainStackParamList>
>;

export type BookingsTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Bookings'>,
  NativeStackNavigationProp<MainStackParamList>
>;
