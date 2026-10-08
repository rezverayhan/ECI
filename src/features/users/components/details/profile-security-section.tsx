import { useState } from 'react'
import {
  ShieldAlert,
  KeyRound,
  Pencil,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useUpdateUser } from '../../hooks/users-mutations'
import { translateSupabaseError } from '@/lib/supabase/translate-error'
import type { UserDetail } from '../../api/users-api'

interface ProfileSecuritySectionProps {
  user: UserDetail
  isItAdmin: boolean
  onEdit: () => void
}

export function ProfileSecuritySection({
  user,
  isItAdmin,
  onEdit,
}: ProfileSecuritySectionProps) {
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateUser = useUpdateUser()

  const isSuspended = user.employment_status === 'inactive' || !user.is_active

  async function handleToggleSuspend() {
    setError(null)
    const newStatus = isSuspended ? 'active' : 'inactive'
    try {
      await updateUser.mutateAsync({
        id: user.id,
        input: {
          employment_status: newStatus,
          is_active: newStatus === 'active',
        },
        previous: user,
        auditAction: 'USER_STATUS_CHANGED',
      })
      setSuspendDialogOpen(false)
    } catch (e) {
      setError(translateSupabaseError(e as never))
    }
  }

  return (
    <SectionPanel id="sec-security" ariaLabelledby="heading-profile-security">
      <SectionHeader
        icon={ShieldAlert}
        title="Profile & Security Actions"
        description="Operational controls for user identity verification, credential recovery, and lifecycle access state."
        headingId="heading-profile-security"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="max-w-xl">
          <h3 className="text-sm font-semibold text-text">Identity and Credentials</h3>
          <p className="text-xs text-text-secondary mt-1">
            Manage profile details or trigger an administrative credential recovery directive. Passwords and sensitive authentication tokens remain securely isolated.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
            <Pencil className="size-3.5" aria-hidden />
            Edit Profile
          </Button>

          {isItAdmin && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setResetDialogOpen(true)}
                className="gap-1.5"
              >
                <KeyRound className="size-3.5" aria-hidden />
                Reset Credentials
              </Button>

              <Button
                size="sm"
                variant={isSuspended ? 'outline' : 'destructive'}
                onClick={() => setSuspendDialogOpen(true)}
              >
                {isSuspended ? 'Reactivate User' : 'Suspend Access'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" aria-hidden />
              {isSuspended ? 'Reactivate Account Access?' : 'Suspend Employee Account?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isSuspended
                ? `This will restore application login access for ${user.full_name}. Assigned physical equipment and network settings will remain active.`
                : `Temporarily revoking access for ${user.full_name} will suspend their login privileges immediately. All historical IT equipment records and support tickets are preserved.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && <p className="text-xs text-error">{error}</p>}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateUser.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleSuspend}
              disabled={updateUser.isPending}
              className={isSuspended ? '' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
            >
              {updateUser.isPending
                ? 'Updating…'
                : isSuspended
                ? 'Reactivate Account'
                : 'Confirm Suspension'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No server-side credential-reset flow exists yet; this must stay an honest no-op, never a false success claim. */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Credential Reset Not Yet Available</AlertDialogTitle>
            <AlertDialogDescription>
              No reset request has been sent. Administrative credential recovery for{' '}
              <span className="font-semibold text-text">{user.official_email}</span> requires a
              secure server-side flow that has not been implemented yet. No email, link, or token
              has been generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setResetDialogOpen(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionPanel>
  )
}
