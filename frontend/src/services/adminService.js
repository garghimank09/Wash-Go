import { api } from './api';

export const adminService = {
  listBookings: () => api.get('/bookings').then((r) => r.data),
  listDispatchWashers: () => api.get('/bookings/dispatch/washers').then((r) => r.data),
  listAdminFleet: () => api.get('/bookings/admin/fleet').then((r) => r.data),
  assignBooking: (bookingId, washerId) =>
    api.patch(`/bookings/${bookingId}/assign`, { washer_id: washerId }).then((r) => r.data),
  listReviews: () => api.get('/bookings/admin/reviews').then((r) => r.data),
};
