import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PhoneCall, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
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
import { getIpPhoneDirectory } from '@/features/users/api/user-details-api'

const STATUS_FILTERS = ['all', 'assigned', 'unassigned'] as const

export function IpPhoneDirectoryPage() {
  const { accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  const { data: directory = [], isPending, isError, refetch } = useQuery({
    queryKey: ['catalog', 'ip-phone-directory'],
    queryFn: getIpPhoneDirectory,
    staleTime: 30_000,
  })

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return directory.filter((row) => {
      const assigned = Boolean(row.assigned_user_name)
      if (statusFilter === 'assigned' && !assigned) return false
      if (statusFilter === 'unassigned' && assigned) return false
      if (!q) return true
      return (
        row.extension.toLowerCase().includes(q) ||
        (row.assigned_user_name?.toLowerCase().includes(q) ?? false) ||
        (row.assigned_employee_id?.toLowerCase().includes(q) ?? false) ||
        (row.assigned_department?.toLowerCase().includes(q) ?? false) ||
        (row.department_name?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [directory, query, statusFilter])

  if (isPending) {
    return <LoadingState label="Loading IP Phone directory…" />
  }

  if (isError) {
    return (
      <ErrorState
        title="Directory couldn't be loaded"
        description="Unable to retrieve the IP Phone directory. Please verify your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="IP Phone Directory"
        description="Organization-wide extension directory. Read-only — contact IT Administration for changes."
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" aria-hidden />
          <Input
            placeholder="Search extension, employee, department…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter((val as typeof statusFilter) ?? 'all')}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'All Extensions' : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {directory.length === 0 ? (
        <EmptyState icon={PhoneCall} title="No IP Phone records are currently available." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No extensions match this search/filter." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Extension</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                {isItAdmin && <TableHead>Review</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono font-medium text-text">Ext {row.extension}</TableCell>
                  <TableCell className="text-text-secondary">{row.assigned_user_name ?? '—'}</TableCell>
                  <TableCell className="text-text-secondary">{row.assigned_employee_id ?? '—'}</TableCell>
                  <TableCell className="text-text-secondary">
                    {row.assigned_department ?? row.department_name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={row.assigned_user_name ? 'assigned' : row.status}
                      labelOverride={row.assigned_user_name ? 'Assigned' : row.status === 'active' ? 'Unassigned' : 'Inactive'}
                    />
                  </TableCell>
                  {isItAdmin && (
                    <TableCell>
                      {row.has_conflict ? (
                        <span className="text-xs font-medium text-error">Extension conflict requires IT review.</span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
