import { useState } from 'react'
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { formatDate } from './details-types'
import { AssignAppDialog } from './dialogs/assign-app-dialog'
import { EditAppAssignmentDialog } from './dialogs/edit-app-assignment-dialog'
import { useRemoveApplication } from '../../hooks/user-details-mutations'
import type { UserApplicationData } from '../../api/user-details-api'
import type { UserDetail } from '../../api/users-api'

interface ApplicationsSectionProps {
  user: UserDetail
  applications: UserApplicationData[]
  isItAdmin: boolean
}

export function ApplicationsSection({
  user,
  applications,
  isItAdmin,
}: ApplicationsSectionProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<UserApplicationData | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<UserApplicationData | null>(null)
  const removeApp = useRemoveApplication(user.id)

  async function handleConfirmRemove() {
    if (!pendingRemove) return
    await removeApp.mutateAsync(pendingRemove)
    setPendingRemove(null)
  }

  return (
    <SectionPanel id="sec-applications" ariaLabelledby="heading-applications">
      <SectionHeader
        icon={Layers}
        title="Applications & Software"
        description="Enterprise software seats, managed desktop clients, and system access rights."
        headingId="heading-applications"
        actions={
          isItAdmin ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAssignDialogOpen(true)}
              className="gap-1.5 shrink-0"
            >
              <Plus className="size-3.5" aria-hidden />
              Assign Application
            </Button>
          ) : null
        }
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No applications assigned"
          description="This employee has no active software or system seat allocations."
          action={
            isItAdmin ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAssignDialogOpen(true)}
                className="gap-1.5"
              >
                <Plus className="size-3.5" aria-hidden />
                Assign First Application
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Application</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Access Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Renewal Target</TableHead>
                {isItAdmin && <TableHead className="w-10 text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded bg-primary-soft text-primary font-bold text-xs shrink-0">
                        {item.application.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-text block truncate">
                          {item.application.name}
                        </span>
                        {item.application.vendor ? (
                          <span className="text-xs text-text-secondary truncate block">
                            {item.application.vendor}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-text">
                    {item.version || '—'}
                  </TableCell>

                  <TableCell className="text-xs text-text-secondary">
                    {item.license_type || '—'}
                  </TableCell>

                  <TableCell>
                    {item.license_status ? <StatusBadge status={item.license_status} /> : '—'}
                  </TableCell>

                  <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                    {formatDate(item.assigned_date)}
                  </TableCell>

                  <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                    {item.renewal_date ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-text-muted" aria-hidden />
                        <span>{formatDate(item.renewal_date)}</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>

                  {isItAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAssignment(item)}
                          className="size-7 text-text-muted hover:text-text hover:bg-canvas"
                          title="Edit Assignment"
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingRemove(item)}
                          disabled={removeApp.isPending}
                          className="size-7 text-text-muted hover:text-error hover:bg-canvas"
                          title="Revoke License"
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AssignAppDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        userId={user.id}
        employeeName={user.full_name}
      />

      {editingAssignment && (
        <EditAppAssignmentDialog
          open={Boolean(editingAssignment)}
          onOpenChange={(next) => !next && setEditingAssignment(null)}
          userId={user.id}
          assignment={editingAssignment}
        />
      )}

      <AlertDialog
        open={Boolean(pendingRemove)}
        onOpenChange={(open) => !open && setPendingRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Application License?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the employee's access to this application and release the assigned
              license seat. This action cannot be undone from this screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeApp.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              disabled={removeApp.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeApp.isPending ? 'Revoking…' : 'Revoke Access'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionPanel>
  )
}
