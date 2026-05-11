import { api } from './api';
import type { Booking, BookingDetail, BookingListResponse } from '../types/api';

export interface BookingCreatePayload {
  car_id: string;
  washer_id?: string | null;
  scheduled_at: string;
  service_address: string;
  latitude?: string | null;
  longitude?: string | null;
  price_cents: number;
  currency?: string;
  notes?: string | null;
}

export const bookingsApi = {
  list: () => api.get<BookingListResponse>('/bookings'),
  get: (id: string) => api.get<BookingDetail>(`/bookings/${id}`),
  create: (body: BookingCreatePayload) => api.post<Booking>('/bookings', body),
};
