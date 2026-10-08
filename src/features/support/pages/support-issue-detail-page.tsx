import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronRight, LifeBuoy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { InfoMatrix, InfoField } from '@/components/shared/info-matrix'
import { Button } from '@/components/ui/button'
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
import { useSupportIssueDetail } from '../hooks/support-queries'
import { useAcknowledgeIssue, useCloseIssue, useStartIssue } from '../hooks/support-mutations'
import { AssignIssueControl } from '../components/assign-issue-control'
import { AttachmentsPanel } from '../components/attachments-panel'
import { IssueTimeline } from '../components/issue-timeline'
import { HoldIssueDialog } from '../components/hold-issue-dialog'
import { ResolveIssueDialog } from '../components/resolve-issue-dialog'
import { AddInternalNoteForm } from '../components/add-internal-note-form'

const CATEGORY_LABELS: Record<string, string> = {
  laptop_computer: 'Laptop / Computer Hardware',
  network_lan: 'Network / LAN / Wi-Fi',
  internet: 'Internet',
  ip_address: 'IP Address / Configuration',
  ip_phone: 'IP Phone / Extension',
  software: 'Software / Application',
  access: 'Account / Access / Password',
  hardware: 'General Hardware',
  printer_peripheral: 'Printer / Peripheral',
  other: 'Other IT Inquiry',
}

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  if (!(ms > 0)) return '—'
  const hours = ms / (1000 * 60 * 60)
  if (hours < 24) return `${hours.toFixed(1)} hours`
  return `${(hours / 24).toFixed(1)} days`
}

export function SupportIssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>()
  const { accessLevel, appUser } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'
  const isGeneralManager = accessLevel === 'general_manager'

  const { data: issue, isPending, isError, refetch } = useSupportIssueDetail(issueId)

  const acknowledge = useAcknowledgeIssue()
  const start = useStartIssue()
  const close = useCloseIssue()

  const [holdOpen, setHoldOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'acknowledge' | 'start' | 'close' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  if (isPending) {
    return <LoadingState label="Loading support issue…" />
  }

  if (isError || !issue) {
    return (
      <ErrorState
        title="Issue couldn't be loaded"
        description="This issue may not exist, or you may not have authorization to view it."
        onRetry={() => refetch()}
      />
    )
  }

  const isOwnIssue = issue.user_id === appUser?.id
  const canSeeAssignment = isItAdmin || isGeneralManager
  const canMutate = isItAdmin

  async function runConfirmedAction() {
    setActionError(null)
    try {
      if (confirmAction === 'acknowledge') await acknowledge.mutateAsync(issue!.id)
      else if (confirmAction === 'start') await start.mutateAsync(issue!.id)
      else if (confirmAction === 'close') await close.mutateAsync(issue!.id)
      setConfirmAction(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update this issue. Please try again.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-text-secondary">
        <Link to="/app/support" className="hover:text-text transition-colors">
          IT Support
        </Link>
        <ChevronRight className="size-3.5 text-text-muted" aria-hidden />
        <span className="font-medium text-text">{issue.issue_number}</span>
      </nav>

      {/* Header */}
      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-semibold text-primary">{issue.issue_number}</span>
              <StatusBadge status={issue.priority} />
              <StatusBadge status={issue.status} />
            </div>
            <h1 className="text-xl font-semibold text-text mt-1.5">{issue.title}</h1>
            <p className="text-sm text-text-secondary mt-1">
              Submitted by <span className="font-medium text-text">{issue.requester?.full_name ?? '—'}</span> on{' '}
              {formatDateTime(issue.submitted_at)}
            </p>
          </div>

          {canMutate && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {issue.status === 'submitted' && (
                <Button size="sm" variant="outline" onClick={() => setConfirmAction('acknowledge')}>
                  Acknowledge
                </Button>
              )}
              {(issue.status === 'submitted' || issue.status === 'acknowledged' || issue.status === 'waiting_on_hold') && (
                <Button size="sm" variant="outline" onClick={() => setConfirmAction('start')}>
                  Start Work
                </Button>
              )}
              {(issue.status === 'acknowledged' || issue.status === 'in_progress') && (
                <Button size="sm" variant="outline" onClick={() => setHoldOpen(true)}>
                  Hold
                </Button>
              )}
              {issue.status !== 'resolved' && issue.status !== 'closed' && (
                <Button size="sm" onClick={() => setResolveOpen(true)}>
                  Resolve
                </Button>
              )}
              {issue.status === 'resolved' && (
                <Button size="sm" onClick={() => setConfirmAction('close')}>
                  Close
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* Request */}
          <SectionPanel>
            <SectionHeader icon={LifeBuoy} title="Request" description="What the requester submitted." />
            <InfoMatrix columns={2}>
              <InfoField label="Category" value={CATEGORY_LABELS[issue.category] ?? issue.category} />
              <InfoField label="Priority" value={<StatusBadge status={issue.priority} />} />
            </InfoMatrix>
            <div className="mt-4">
              <span className="text-xs font-medium text-text-secondary block mb-1">Description</span>
              <p className="text-sm text-text whitespace-pre-wrap">{issue.description || '—'}</p>
            </div>
            <div className="mt-4">
              <span className="text-xs font-medium text-text-secondary block mb-2">Attachments</span>
              <AttachmentsPanel issueId={issue.id} isItAdmin={isItAdmin} canUpload={isItAdmin || isOwnIssue} />
            </div>
          </SectionPanel>

          {/* Resolution */}
          {(issue.status === 'resolved' || issue.status === 'closed') && (
            <SectionPanel>
              <SectionHeader icon={LifeBuoy} title="Resolution" />
              <InfoMatrix columns={canMutate ? 3 : 2}>
                <InfoField label="Resolved" value={formatDateTime(issue.resolved_at)} />
                {issue.status === 'closed' && <InfoField label="Closed" value={formatDateTime(issue.closed_at)} />}
                {canMutate && issue.resolved_at && (
                  <InfoField label="Resolution Duration" value={formatDuration(issue.submitted_at, issue.resolved_at)} />
                )}
              </InfoMatrix>
              <div className="mt-4">
                <span className="text-xs font-medium text-text-secondary block mb-1">Resolution</span>
                <p className="text-sm text-text whitespace-pre-wrap">{issue.resolution || '—'}</p>
              </div>
            </SectionPanel>
          )}

          {/* Timeline */}
          <SectionPanel>
            <SectionHeader icon={LifeBuoy} title="Timeline" description="What is happening with this request." />
            <IssueTimeline issueId={issue.id} />
            {isItAdmin && (
              <div className="mt-4 pt-4 border-t border-border">
                <AddInternalNoteForm issueId={issue.id} />
              </div>
            )}
          </SectionPanel>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-5">
          {canSeeAssignment && (
            <SectionPanel className="p-4 sm:p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Assignment</h3>
              {isItAdmin ? (
                <AssignIssueControl issueId={issue.id} currentAssignedTo={issue.assigned_to} />
              ) : (
                <p className="text-sm text-text">{issue.assignee?.full_name ?? 'Unassigned'}</p>
              )}
            </SectionPanel>
          )}

          <SectionPanel className="p-4 sm:p-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Requester</h3>
            <p className="text-sm font-medium text-text">{issue.requester?.full_name ?? '—'}</p>
            {canSeeAssignment && (
              <p className="text-xs text-text-secondary">{issue.requester?.official_email ?? '—'}</p>
            )}
          </SectionPanel>
        </div>
      </div>

      {/* Quick confirmations for low-friction transitions */}
      <AlertDialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'acknowledge' && 'Acknowledge this issue?'}
              {confirmAction === 'start' && 'Start working on this issue?'}
              {confirmAction === 'close' && 'Close this issue?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'acknowledge' && 'The requester will be notified that IT has acknowledged their request.'}
              {confirmAction === 'start' && 'This moves the issue to In Progress and notifies the requester.'}
              {confirmAction === 'close' && 'This issue must already be resolved. The requester will be notified.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && <p className="text-xs text-error">{actionError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runConfirmedAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HoldIssueDialog open={holdOpen} onOpenChange={setHoldOpen} issueId={issue.id} />
      <ResolveIssueDialog open={resolveOpen} onOpenChange={setResolveOpen} issueId={issue.id} />
    </div>
  )
}
