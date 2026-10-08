import { ErrorState } from '@/components/shared/error-state'

export function RouteErrorBoundary() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4">
      <ErrorState
        title="Something went wrong"
        description="Please try again or return to the dashboard."
      />
    </div>
  )
}
