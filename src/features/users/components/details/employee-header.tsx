import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LifeBuoy,
  Pencil,
  MoreHorizontal,
  Mail,
  Phone,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/shared/user-avatar'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useAuth } from '@/features/auth/context/auth-context'
import { useUpdateUser } from '../../hooks/users-mutations'
import { translateSupabaseError } from '@/lib/supabase/translate-error'
import type { UserDetail } from '../../api/users-api'
import type { UserRow } from '../../types'

interface EmployeeHeaderProps {
  user: UserDetail
  onEdit: () => void
  onCreateIssue: () => void
}

export function EmployeeHeader({ user, onEdit, onCreateIssue }: EmployeeHeaderProps) {
  const { accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  const [pendingStatus, setPendingStatus] = useState<UserRow['employment_status'] | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  const updateUser = useUpdateUser()

  async function handleConfirmStatusChange() {
    if (!pendingStatus) return
    setStatusError(null)
    try {
      await updateUser.mutateAsync({
        id: user.id,
        input: {
          employment_status: pendingStatus,
          is_active: pendingStatus === 'active',
        },
        previous: user,
        auditAction: 'USER_STATUS_CHANGED',
      })
      setPendingStatus(null)
    } catch (e) {
      setStatusError(translateSupabaseError(e as never))
    }
  }

  return (
    <header className="flex flex-col gap-4">
      {/* Breadcrumb strip */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-text-secondary">
        <Link to="/app/users" className="hover:text-text transition-colors">
          Users
        </Link>
        <ChevronRight className="size-3.5 text-text-muted" aria-hidden />
        <span className="font-medium text-text truncate max-w-[240px] sm:max-w-none">
          {user.full_name}
        </span>
      </nav>

      {/* Main Employee Card */}
      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          {/* Identity Left */}
          <div className="flex items-start gap-4 sm:gap-5">
            <UserAvatar fullName={user.full_name} size="lg" className="shrink-0" />

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-semibold text-text">
                  {user.full_name}
                </h1>
                <StatusBadge status={user.employment_status} />
                {user.access_level === 'it_administrator' && (
                  <span className="inline-flex items-center gap-1 rounded bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                    <ShieldCheck className="size-3" aria-hidden />
                    IT Administrator
                  </span>
                )}
              </div>

              <div className="text-sm font-medium text-text-secondary">
                {user.designation_name ?? 'Employee'}
                {user.department_name ? (
                  <>
                    <span className="mx-1.5 text-text-muted">·</span>
                    <span>{user.department_name}</span>
                  </>
                ) : null}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                <span>
                  <span className="text-text-muted">Employee ID:</span>{' '}
                  <span className="font-medium text-text">{user.employee_id}</span>
                </span>
                <span className="text-text-muted">·</span>
                <span>
                  <span className="text-text-muted">User ID:</span>{' '}
                  <span className="font-medium text-text">{user.user_id}</span>
                </span>
              </div>

              {/* Contact row */}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                <a
                  href={`mailto:${user.official_email}`}
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Mail className="size-3.5 text-text-muted" aria-hidden />
                  <span>{user.official_email}</span>
                </a>
                {user.phone && (
                  <>
                    <span className="text-text-muted">·</span>
                    <a
                      href={`tel:${user.phone}`}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <Phone className="size-3.5 text-text-muted" aria-hidden />
                      <span>{user.phone}</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contextual Actions Right */}
          <div className="flex items-center gap-2 pt-2 md:pt-0 self-start shrink-0">
            {isItAdmin && (
              <Button size="sm" onClick={onCreateIssue} className="gap-1.5">
                <LifeBuoy className="size-4" aria-hidden />
                Create IT Issue
              </Button>
            )}

            {(isItAdmin || accessLevel === 'admin') && (
              <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
                <Pencil className="size-3.5" aria-hidden />
                Edit
              </Button>
            )}

            {isItAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="sm" variant="outline" className="px-2" aria-label="More actions">
                      <MoreHorizontal className="size-4" aria-hidden />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setPendingStatus('active')}
                    disabled={user.employment_status === 'active'}
                  >
                    <CheckCircle2 className="size-4 mr-2 text-success" />
                    Mark as Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPendingStatus('inactive')}
                    disabled={user.employment_status === 'inactive'}
                  >
                    <AlertCircle className="size-4 mr-2 text-warning" />
                    Mark as Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPendingStatus('resigned')}
                    disabled={user.employment_status === 'resigned'}
                  >
                    <AlertCircle className="size-4 mr-2 text-text-muted" />
                    Mark as Resigned
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setResetSuccess(true)}>
                    <KeyRound className="size-4 mr-2 text-text-secondary" />
                    Send Password Reset
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation dialog for status change */}
      <AlertDialog
        open={Boolean(pendingStatus)}
        onOpenChange={(open) => !open && setPendingStatus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Employment Status?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === 'active' && 'This will reactivate access for this employee.'}
              {pendingStatus === 'inactive' && 'This will temporarily suspend account access while preserving all IT hardware and assignment history.'}
              {pendingStatus === 'resigned' && 'This will mark the employee as departed and suspend system access. All IT equipment history and records will remain archived for audit.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {statusError && <p className="text-xs text-error">{statusError}</p>}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateUser.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? 'Saving…' : `Confirm Status Change`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No server-side credential-reset flow exists yet; this must stay an honest no-op, never a false success claim. */}
      <AlertDialog open={resetSuccess} onOpenChange={setResetSuccess}>
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
            <AlertDialogAction onClick={() => setResetSuccess(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
