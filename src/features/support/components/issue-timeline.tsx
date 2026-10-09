import { Lock } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { useAuth } from '@/features/auth/context/auth-context'
import { useSupportIssueTimeline } from '../hooks/support-queries'

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  waiting_on_hold: 'Waiting / On Hold',
  resolved: 'Resolved',
  closed: 'Closed',
}

const UPDATE_TYPE_LABELS: Record<string, string> = {
  status_change: 'Status changed',
  assignment: 'Issue assigned',
  note: 'Internal note added',
}

function formatDateTime(value: string): string {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface IssueTimelineProps {
  issueId: string
}

export function IssueTimeline({ issueId }: IssueTimelineProps) {
  const { accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'
  const { data: timeline = [], isPending } = useSupportIssueTimeline(issueId)

  const visibleTimeline = timeline.filter((entry) => !entry.is_internal || isItAdmin)

  if (isPending) {
    return <p className="text-xs text-text-secondary">Loading timeline…</p>
  }

  if (visibleTimeline.length === 0) {
    return <EmptyState title="No timeline updates yet." />
  }

  return (
    <ol className="space-y-3">
      {visibleTimeline.map((entry) => (
        <li key={entry.id} className="flex gap-3 text-xs">
          <div className="flex flex-col items-center shrink-0 pt-0.5">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          </div>
          <div className="flex-1 min-w-0 pb-3 border-b border-border/60 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-text">
                {entry.update_type === 'status_change' && entry.new_status
                  ? `Moved to ${STATUS_LABELS[entry.new_status] ?? entry.new_status}`
                  : UPDATE_TYPE_LABELS[entry.update_type] ?? entry.update_type}
              </span>
              {entry.is_internal && (
                <span className="inline-flex items-center gap-1 rounded bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                  <Lock className="size-2.5" aria-hidden />
                  Internal
                </span>
              )}
            </div>
            {entry.comment && <p className="text-text-secondary mt-1">{entry.comment}</p>}
            <div className="text-text-muted mt-1">
              {entry.actor?.full_name ?? 'System'} · {formatDateTime(entry.created_at)}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
