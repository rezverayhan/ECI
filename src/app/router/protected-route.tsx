import { Navigate, Outlet } from 'react-router-dom'
import { ErrorState } from '@/components/shared/error-state'
import { BlockedAccountPage } from '@/features/auth/pages/blocked-account-page'
import { useAuth } from '@/features/auth/context/auth-context'

/**
 * Central route guard. Protected routes are only ever rendered once both the
 * Supabase session and the matching application profile have resolved —
 * this is what prevents a flash of protected content before authorization
 * is known (Task 02 §2).
 */
export function ProtectedRoute() {
  const { status, retryAppUser } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-canvas">
        <p className="text-sm text-text-secondary">Loading…</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  if (status === 'blocked') {
    return <BlockedAccountPage />
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-canvas px-4">
        <ErrorState
          title="Something went wrong"
          description="We couldn't load your account. Please try again."
          onRetry={retryAppUser}
        />
      </div>
    )
  }

  return <Outlet />
}
