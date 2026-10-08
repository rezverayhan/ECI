import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth-context'
import type { AccessLevel } from '@/features/auth/types'

/**
 * Secondary, in-shell guard for routes restricted to specific access levels
 * (e.g. System Configuration). This is a UX convenience only — RLS is the
 * actual security boundary; this guard exists so a disallowed user sees a
 * clean "access restricted" page instead of a broken/empty screen.
 */
export function RequireAccessLevel({ allow }: { allow: AccessLevel[] }) {
  const { accessLevel } = useAuth()

  if (!accessLevel || !allow.includes(accessLevel)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
