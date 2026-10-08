import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LifeBuoy, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/features/auth/context/auth-context'
import { ManagerCombobox } from '@/features/users/components/manager-combobox'
import { useSupportQueue } from '../hooks/support-queries'
import { CreateIssueQueueDialog } from '../components/create-issue-queue-dialog'
import type { SupportCategoryEnum, SupportPriorityEnum, SupportStatusEnum } from '../api/support-api'

const STATUS_OPTIONS: { value: SupportStatusEnum; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_on_hold', label: 'Waiting / On Hold' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const PRIORITY_OPTIONS: { value: SupportPriorityEnum; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const CATEGORY_OPTIONS: { value: SupportCategoryEnum; label: string }[] = [
  { value: 'laptop_computer', label: 'Laptop / PC' },
  { value: 'network_lan', label: 'Network LAN' },
  { value: 'internet', label: 'Internet' },
  { value: 'ip_address', label: 'IP Address' },
  { value: 'ip_phone', label: 'IP Phone' },
  { value: 'software', label: 'Software' },
  { value: 'access', label: 'Access / Auth' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'printer_peripheral', label: 'Printer / Periph' },
  { value: 'other', label: 'General IT' },
]

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function SupportQueuePage() {
  const navigate = useNavigate()
  const { accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SupportStatusEnum | 'all'>('all')
  const [priority, setPriority] = useState<SupportPriorityEnum | 'all'>('all')
  const [category, setCategory] = useState<SupportCategoryEnum | 'all'>('all')
  const [requesterId, setRequesterId] = useState<string | undefined>(undefined)
  const [createOpen, setCreateOpen] = useState(false)

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      priority: priority === 'all' ? undefined : priority,
      category: category === 'all' ? undefined : category,
      userId: requesterId,
    }),
    [search, status, priority, category, requesterId],
  )

  const { data: issues = [], isPending, isError, refetch } = useSupportQueue(filters)

  const summary = useMemo(() => {
    const counts = { open: 0, in_progress: 0, waiting: 0, resolved: 0 }
    for (const issue of issues) {
      if (issue.status === 'submitted' || issue.status === 'acknowledged') counts.open++
      else if (issue.status === 'in_progress') counts.in_progress++
      else if (issue.status === 'waiting_on_hold') counts.waiting++
      else if (issue.status === 'resolved') counts.resolved++
    }
    return counts
  }, [issues])

  const hasActiveFilters = Boolean(search || status !== 'all' || priority !== 'all' || category !== 'all' || requesterId)

  if (isPending) {
    return <LoadingState label="Loading IT support queue…" />
  }

  if (isError) {
    return (
      <ErrorState
        title="Support queue couldn't be loaded"
        description="Unable to retrieve IT support issues. Please verify your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="IT Support"
        description="Organization-wide IT support request queue."
        actions={
          isItAdmin ? (
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="size-3.5" aria-hidden />
              Create Issue
            </Button>
          ) : undefined
        }
      />

      {/* Operational summary — derived from the currently filtered real data, not invented */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-xs font-medium text-text-secondary block">Open</span>
          <span className="text-xl font-semibold text-text">{summary.open}</span>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-xs font-medium text-text-secondary block">In Progress</span>
          <span className="text-xl font-semibold text-text">{summary.in_progress}</span>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-xs font-medium text-text-secondary block">Waiting / On Hold</span>
          <span className="text-xl font-semibold text-text">{summary.waiting}</span>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-xs font-medium text-text-secondary block">Resolved</span>
          <span className="text-xl font-semibold text-text">{summary.resolved}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" aria-hidden />
          <Input
            placeholder="Search by issue number or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(val) => setStatus((val as typeof status) ?? 'all')}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(val) => setPriority((val as typeof priority) ?? 'all')}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(val) => setCategory((val as typeof category) ?? 'all')}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="w-full sm:w-56">
          <ManagerCombobox value={requesterId} onChange={setRequesterId} />
        </div>
      </div>

      {issues.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title={hasActiveFilters ? 'No issues match your current filters.' : 'No IT support issues yet'}
          description={
            hasActiveFilters
              ? 'Try changing the filters or search terms.'
              : 'Submitted IT requests will appear here.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Issue</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow
                  key={issue.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/app/support/${issue.id}`)}
                >
                  <TableCell className="font-mono text-xs font-semibold text-primary whitespace-nowrap">
                    {issue.issue_number}
                  </TableCell>
                  <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                    {issue.requester?.full_name ?? '—'}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <span className="font-medium text-text block truncate">{issue.title}</span>
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
                    {formatDateTime(issue.submitted_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateIssueQueueDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
