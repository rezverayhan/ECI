import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PlaceholderPage } from '@/components/shared/placeholder-page'
import { LoginPage } from '@/features/auth/pages/login-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { IpPhoneDirectoryPage } from '@/features/ip-phone-directory/pages/ip-phone-directory-page'
import { SupportQueuePage } from '@/features/support/pages/support-queue-page'
import { SupportIssueDetailPage } from '@/features/support/pages/support-issue-detail-page'
import { ProfilePage } from '@/features/settings/pages/profile-page'
import { PasswordPage } from '@/features/settings/pages/password-page'
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
            element: <PlaceholderPage title="Meeting Rooms" description="Book and manage meeting room reservations." />,
            handle: { title: 'Meeting Rooms' },
          },
          {
            path: 'bookings/cars',
            element: <PlaceholderPage title="Cars" description="Book and manage company car reservations." />,
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
            path: 'renewals',
            element: <PlaceholderPage title="Renewals" description="Upcoming, due and expired account license renewals." />,
            handle: { title: 'Renewals' },
          },
          {
            path: 'notifications',
            element: <PlaceholderPage title="Notifications" />,
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
            element: <PlaceholderPage title="Notification Preferences" />,
            handle: { title: 'Notification Preferences' },
          },
          {
            element: <RequireAccessLevel allow={['it_administrator']} />,
            children: [
              {
                path: 'settings/system',
                element: <PlaceholderPage title="System Configuration" description="Approved operational settings." />,
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
