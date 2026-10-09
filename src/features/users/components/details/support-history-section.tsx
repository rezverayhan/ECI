import { useNavigate, useLocation } from 'react-router-dom'
import { LifeBuoy, Plus } from 'lucide-react'
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
import { formatDate } from './details-types'
import type { SupportCategoryEnum, UserSupportIssueData } from '../../api/user-details-api'

interface SupportHistorySectionProps {
  supportIssues: UserSupportIssueData[]
  onCreateIssue: () => void
  canCreateIssue: boolean
}

const CATEGORY_LABELS: Record<SupportCategoryEnum, string> = {
  laptop_computer: 'Laptop / PC',
  network_lan: 'Network LAN',
  internet: 'Internet',
  ip_address: 'IP Address',
  ip_phone: 'IP Phone',
  software: 'Software',
  access: 'Access / Auth',
  hardware: 'Hardware',
  printer_peripheral: 'Printer / Periph',
  other: 'General IT',
}

export function SupportHistorySection({
  supportIssues,
  onCreateIssue,
  canCreateIssue,
}: SupportHistorySectionProps) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleNavigate(issueId: string) {
    navigate(`/app/support/${issueId}`, {
      state: { from: location.pathname, fromLabel: 'Employee 360' },
    })
  }

  function handleRowClick(e: React.MouseEvent, issueId: string) {
    if ((e.target as HTMLElement).closest('button, a')) return
    handleNavigate(issueId)
  }

  function handleRowKeyDown(e: React.KeyboardEvent, issueId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      if ((e.target as HTMLElement).closest('button, a')) return
      e.preventDefault()
      handleNavigate(issueId)
    }
  }

  return (
    <SectionPanel id="sec-support" ariaLabelledby="heading-support-history">
      <SectionHeader
        icon={LifeBuoy}
        title="IT Support History"
        description="Support requests, incidents, and hardware tickets logged for this employee."
        headingId="heading-support-history"
        actions={
          canCreateIssue ? (
            <Button
              size="sm"
              onClick={onCreateIssue}
              className="gap-1.5 shrink-0"
            >
              <Plus className="size-3.5" aria-hidden />
              Create IT Issue
            </Button>
          ) : null
        }
      />

      {supportIssues.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No IT support issues"
          description="This employee has no logged IT support tickets or active service incidents."
          action={
            canCreateIssue ? (
              <Button
                size="sm"
                onClick={onCreateIssue}
                className="gap-1.5"
              >
                <Plus className="size-3.5" aria-hidden />
                Create IT Issue
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-surface">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Issue / Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Logged Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportIssues.map((issue) => (
                  <TableRow
                    key={issue.id}
                    tabIndex={0}
                    role="link"
                    aria-label={`View support issue ${issue.issue_number}: ${issue.title}`}
                    className="cursor-pointer focus-visible:outline-none focus-visible:bg-canvas/70 focus-visible:ring-2 focus-visible:ring-primary/60 hover:bg-canvas/50 transition-colors"
                    onClick={(e) => handleRowClick(e, issue.id)}
                    onKeyDown={(e) => handleRowKeyDown(e, issue.id)}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-primary whitespace-nowrap">
                      <span className="hover:underline">{issue.issue_number}</span>
                    </TableCell>

                    <TableCell className="max-w-[280px]">
                      <span className="font-medium text-text block truncate">
                        {issue.title}
                      </span>
                      {issue.description ? (
                        <span className="text-xs text-text-secondary truncate block">
                          {issue.description}
                        </span>
                      ) : null}
                    </TableCell>

                    <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                      {CATEGORY_LABELS[issue.category] || issue.category}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={issue.priority} />
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={issue.status} />
                    </TableCell>

                    <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                      {issue.assignee?.full_name ?? '—'}
                    </TableCell>

                    <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                      {formatDate(issue.submitted_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards view (matches SupportQueuePage pattern) */}
          <div className="flex flex-col gap-2 md:hidden">
            {supportIssues.map((issue) => (
              <div
                key={issue.id}
                role="link"
                tabIndex={0}
                aria-label={`View support issue ${issue.issue_number}: ${issue.title}`}
                onClick={(e) => handleRowClick(e, issue.id)}
                onKeyDown={(e) => handleRowKeyDown(e, issue.id)}
                className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-3 text-left outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/60 hover:bg-canvas/50 active:bg-canvas transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-primary">
                    {issue.issue_number}
                  </span>
                  <StatusBadge status={issue.status} />
                </div>
                <span className="text-sm font-medium text-text truncate">{issue.title}</span>
                {issue.description ? (
                  <span className="text-xs text-text-secondary line-clamp-2">
                    {issue.description}
                  </span>
                ) : null}
                <div className="flex items-center justify-between text-xs text-text-secondary mt-1">
                  <span>{CATEGORY_LABELS[issue.category] || issue.category}</span>
                  <StatusBadge status={issue.priority} />
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted mt-0.5">
                  <span>
                    {issue.assignee?.full_name ? `Assigned: ${issue.assignee.full_name}` : 'Unassigned'}
                  </span>
                  <span>{formatDate(issue.submitted_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </SectionPanel>
  )
}

