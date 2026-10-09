import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/login-page'
import { ResetPasswordPage } from '@/features/auth/pages/reset-password-page'
import { MeetingRoomsPage } from '@/features/bookings/pages/meeting-rooms-page'
import { CarsPage } from '@/features/bookings/pages/cars-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { RenewalsPage } from '@/features/renewals/pages/renewals-page'
import { IpPhoneDirectoryPage } from '@/features/ip-phone-directory/pages/ip-phone-directory-page'
import { SupportQueuePage } from '@/features/support/pages/support-queue-page'
import { SupportIssueDetailPage } from '@/features/support/pages/support-issue-detail-page'
import { NotificationsPage } from '@/features/notifications/pages/notifications-page'
import { ProfilePage } from '@/features/settings/pages/profile-page'
import { PasswordPage } from '@/features/settings/pages/password-page'
import { NotificationPreferencesPage } from '@/features/settings/pages/notification-preferences-page'
import { SystemConfigurationPage } from '@/features/settings/pages/system-configuration-page'
import { UserCreatePage } from '@/features/users/pages/user-create-page'
import { UserDetailsPage } from '@/features/users/pages/user-details-page'
import { UsersListPage } from '@/features/users/pages/users-list-page'
import { AppShell } from '@/app/layouts/app-shell'
import { ProtectedRoute } from './protected-route'
import { RequireAccessLevel } from './require-access-level'
import { RouteErrorBoundary } from './route-error-boundary'
import { UnauthorizedPage } from './unauthorized-page'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: '/app',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          {
            path: 'dashboard',
            element: <DashboardPage />,
            handle: { title: 'Dashboard' },
          },
          {
            // The user directory and creation are IT Administrator operational tools.
            element: <RequireAccessLevel allow={['it_administrator']} />,
            children: [
              {
                path: 'users',
                element: <UsersListPage />,
                handle: { title: 'Users' },
              },
              {
                path: 'users/new',
                element: <UserCreatePage />,
                handle: { title: 'Add User' },
              },
            ],
          },
          {
            // Employee 360 User Details: RLS enforces whether a caller can read this record
            // (General Users can only read their own record; IT Admins have full access).
            path: 'users/:userId',
            element: <UserDetailsPage />,
            handle: { title: 'User Details' },
          },
          {
            path: 'bookings/meeting-rooms',
            element: <MeetingRoomsPage />,
            handle: { title: 'Meeting Rooms' },
          },
          {
            path: 'bookings/cars',
            element: <CarsPage />,
            handle: { title: 'Cars' },
          },
          {
            path: 'ip-phone-directory',
            element: <IpPhoneDirectoryPage />,
            handle: { title: 'IP Phone Directory' },
          },
          {
            // Org-wide queue is IT Admin / General Manager operational tooling.
            element: <RequireAccessLevel allow={['it_administrator', 'general_manager']} />,
            children: [
              {
                path: 'support',
                element: <SupportQueuePage />,
                handle: { title: 'IT Support' },
              },
            ],
          },
          {
            // Issue detail: RLS enforces whether a caller can read this record
            // (General Users can only read their own issue; IT Admin/GM have broader access).
            path: 'support/:issueId',
            element: <SupportIssueDetailPage />,
            handle: { title: 'Support Issue' },
          },
          {
            // user_licenses RLS only grants org-wide SELECT to IT Administrator
            // (everyone else only sees their own row) — gating the route matches
            // that boundary instead of showing General Manager/Admin/General User
            // a page that would render as empty or misleadingly incomplete.
            element: <RequireAccessLevel allow={['it_administrator']} />,
            children: [
              {
                path: 'renewals',
                element: <RenewalsPage />,
                handle: { title: 'Renewals' },
              },
            ],
          },
          {
            path: 'notifications',
            element: <NotificationsPage />,
            handle: { title: 'Notifications' },
          },
          {
            path: 'settings/profile',
            element: <ProfilePage />,
            handle: { title: 'My Profile' },
          },
          {
            path: 'settings/password',
            element: <PasswordPage />,
            handle: { title: 'Password' },
          },
          {
            path: 'settings/notifications',
            element: <NotificationPreferencesPage />,
            handle: { title: 'Notification Preferences' },
          },
          {
            element: <RequireAccessLevel allow={['it_administrator']} />,
            children: [
              {
                path: 'settings/system',
                element: <SystemConfigurationPage />,
                handle: { title: 'System Configuration' },
              },
            ],
          },
          {
            path: '*',
            element: <Navigate to="/app/dashboard" replace />,
          },
        ],
      },
    ],
  },
])
