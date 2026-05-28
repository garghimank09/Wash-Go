import { api } from './api';

export const adminService = {
  listBookings: () => api.get('/bookings', { params: { scope: 'admin' } }).then((r) => r.data),
  getBooking: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  listBookingPhotos: (bookingId) =>
    api.get(`/bookings/${bookingId}/photos`).then((r) => r.data.items ?? r.data),
  listDispatchWashers: () => api.get('/bookings/dispatch/washers').then((r) => r.data),
  listAdminFleet: () => api.get('/bookings/admin/fleet').then((r) => r.data),
  assignBooking: (bookingId, washerId) =>
    api.patch(`/bookings/${bookingId}/assign`, { washer_id: washerId }).then((r) => r.data),
  listWashTiers: () => api.get('/wash-tiers/all').then((r) => r.data),
  createWashTier: (body) => api.post('/wash-tiers', body).then((r) => r.data),
  updateWashTier: (slug, body) => api.patch(`/wash-tiers/${slug}`, body).then((r) => r.data),
  deactivateWashTier: (slug) => api.delete(`/wash-tiers/${slug}`).then((r) => r.data),
  listMembershipPlans: () => api.get('/membership-plans/all').then((r) => r.data),
  createMembershipPlan: (body) => api.post('/membership-plans', body).then((r) => r.data),
  updateMembershipPlan: (slug, body) =>
    api.patch(`/membership-plans/${slug}`, body).then((r) => r.data),
  deactivateMembershipPlan: (slug) =>
    api.delete(`/membership-plans/${slug}`).then((r) => r.data),
  listReviews: () => api.get('/bookings/admin/reviews').then((r) => r.data),
  getEarningsOverview: () => api.get('/bookings/admin/earnings').then((r) => r.data),
};
