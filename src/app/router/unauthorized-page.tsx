import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-base font-semibold text-text">Access restricted</h1>
        <p className="mt-2 text-sm text-text-secondary">You don&apos;t have access to this area.</p>
        <Button className="mt-6 w-full" onClick={() => navigate('/app/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
