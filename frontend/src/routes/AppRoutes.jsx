import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AdminRoute } from '../components/AdminRoute';
import { CustomerShellRoute } from '../components/CustomerShellRoute';
import { ProtectedPartnerRoute } from '../components/ProtectedPartnerRoute';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { WasherLegacyRedirect } from '../components/WasherLegacyRedirect';
import { WasherRoute } from '../components/WasherRoute';
import { PartnerAuthProvider } from '../context/PartnerAuthContext';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { MarketingLayout } from '../layouts/MarketingLayout';
import { WasherLayout } from '../layouts/WasherLayout';
import { AdminBookingsPage } from '../pages/AdminBookingsPage';
import { AdminComplaintsPage } from '../pages/AdminComplaintsPage';
import { AdminOperationsPage } from '../pages/AdminOperationsPage';
import { AdminOverviewPage } from '../pages/AdminOverviewPage';
import { AdminRevenuePage } from '../pages/AdminRevenuePage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { AdminMembershipPlansPage } from '../pages/AdminMembershipPlansPage';
import { AdminWashTiersPage } from '../pages/AdminWashTiersPage';
import { BookingDetailPage } from '../pages/BookingDetailPage';
import { BookingPage } from '../pages/BookingPage';
import { BookingsPage } from '../pages/BookingsPage';
import { CarsPage } from '../pages/CarsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MembershipSubscribePage } from '../pages/MembershipSubscribePage';
import { ProfilePage } from '../pages/ProfilePage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { PartnerLoginPage } from '../pages/partner/PartnerLoginPage';
import { PartnerSignupPage } from '../pages/partner/PartnerSignupPage';
import { SignupPage } from '../pages/SignupPage';
import { WasherDashboardPage } from '../pages/washer/WasherDashboardPage';
import { WasherEarningsPage } from '../pages/washer/WasherEarningsPage';
import { WasherRewardsPage } from '../pages/washer/WasherRewardsPage';
import { WasherJobPage } from '../pages/washer/WasherJobPage';
import { WasherRequestsPage } from '../pages/washer/WasherRequestsPage';
import { WasherSchedulePage } from '../pages/washer/WasherSchedulePage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route path="/washer/*" element={<WasherLegacyRedirect />} />

        <Route path="/partner" element={<PartnerAuthProvider />}>
          <Route path="login" element={<PartnerLoginPage />} />
          <Route path="signup" element={<PartnerSignupPage />} />
          <Route element={<ProtectedPartnerRoute />}>
            <Route element={<WasherRoute />}>
              <Route element={<WasherLayout />}>
                <Route index element={<WasherDashboardPage />} />
                <Route path="requests" element={<WasherRequestsPage />} />
                <Route path="schedule" element={<WasherSchedulePage />} />
                <Route path="jobs/:id" element={<WasherJobPage />} />
                <Route path="earnings" element={<WasherEarningsPage />} />
                <Route path="rewards" element={<WasherRewardsPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<CustomerShellRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/membership/subscribe/:slug" element={<MembershipSubscribePage />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/bookings/:id" element={<BookingDetailPage />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/operations" element={<AdminOperationsPage />} />
              <Route path="/admin/bookings" element={<AdminBookingsPage />} />
              <Route path="/admin/wash-tiers" element={<AdminWashTiersPage />} />
              <Route path="/admin/membership-plans" element={<AdminMembershipPlansPage />} />
              <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/revenue" element={<AdminRevenuePage />} />
            </Route>
          </Route>

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
