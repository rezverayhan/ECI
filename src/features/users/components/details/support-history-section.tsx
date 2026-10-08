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
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
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
                <TableRow key={issue.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary whitespace-nowrap">
                    {issue.issue_number}
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
      )}
    </SectionPanel>
  )
}
