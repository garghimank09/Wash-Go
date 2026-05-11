export type UserRole = 'customer' | 'washer' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Car {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number | null;
  license_plate: string;
  color: string | null;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  customer_id: string;
  car_id: string;
  washer_id: string | null;
  status: BookingStatus;
  scheduled_at: string;
  service_address: string;
  latitude: string | number | null;
  longitude: string | number | null;
  price_cents: number;
  currency: string;
  notes: string | null;
}

export interface BookingListResponse {
  items: Booking[];
}

export interface WasherPublic {
  id: string;
  full_name: string;
  rating_avg: number;
  service_area: string | null;
}

export interface BookingTimelineStep {
  key: string;
  label: string;
  done: boolean;
  at: string | null;
}

export interface BookingDetail {
  id: string;
  customer_id: string;
  car_id: string;
  washer_id: string | null;
  status: BookingStatus;
  scheduled_at: string;
  service_address: string;
  latitude: string | number | null;
  longitude: string | number | null;
  price_cents: number;
  currency: string;
  notes: string | null;
  created_at: string;
  car_label: string | null;
  washer: WasherPublic | null;
  eta_minutes: number | null;
  timeline: BookingTimelineStep[];
}

export interface PricingResponse {
  estimated_price_cents: number;
  currency: string;
  package_id: string;
  vehicle_size: string;
  notes: string | null;
}
