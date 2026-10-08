import { Button } from '@/components/ui/button'
import { useAuth } from '../context/auth-context'

export function BlockedAccountPage() {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-base font-semibold text-text">Your account is inactive</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Contact IT Administrator for assistance.
        </p>
        <Button className="mt-6 w-full" variant="outline" onClick={() => signOut()}>
          Back to Sign In
        </Button>
      </div>
    </div>
  )
}
