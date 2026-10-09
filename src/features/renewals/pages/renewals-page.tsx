import { useMemo, useState } from 'react'
import { Search, KeyRound } from 'lucide-react'
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
import { formatDate } from '@/features/users/components/details/details-types'
import { useAllLicenses } from '../hooks/renewals-queries'
import type { LicenseStatus } from '../api/renewals-api'

const STATUS_OPTIONS: { value: LicenseStatus; label: string }[] = [
  { value: 'due', label: 'Due' },
  { value: 'expired', label: 'Expired' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
]

export function RenewalsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<LicenseStatus | 'all'>('all')

  const filters = useMemo(
    () => ({ search: search || undefined, status: status === 'all' ? undefined : status }),
    [search, status],
  )
  const { data: licenses = [], isPending, isError, refetch } = useAllLicenses(filters)

  const hasActiveFilters = Boolean(search || status !== 'all')

  if (isPending) return <LoadingState label="Loading license renewals…" />
  if (isError) {
    return (
      <ErrorState
        title="Renewals couldn't be loaded"
        description="Unable to retrieve license records. Please verify your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const summary = {
    due: licenses.filter((l) => l.status === 'due').length,
    expired: licenses.filter((l) => l.status === 'expired').length,
    upcoming: licenses.filter((l) => l.status === 'upcoming').length,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Renewals" description="Upcoming, due and expired account license renewals across the organization." />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-xs font-medium text-text-secondary block">Due</span>
          <span className="text-xl font-semibold text-text">{summary.due}</span>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-xs font-medium text-text-secondary block">Expired</span>
          <span className="text-xl font-semibold text-text">{summary.expired}</span>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-xs font-medium text-text-secondary block">Upcoming</span>
          <span className="text-xl font-semibold text-text">{summary.upcoming}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" aria-hidden />
          <Input
            placeholder="Search employee or license…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(val) => setStatus((val as typeof status) ?? 'all')}>
          <SelectTrigger className="w-full sm:w-40">
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
      </div>

      {licenses.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title={hasActiveFilters ? 'No licenses match your current filters.' : 'No account licenses are recorded yet.'}
          description={hasActiveFilters ? 'Try changing the filters or search terms.' : undefined}
        />
      ) : (
        <>
          <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-surface">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Employee</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Auto-Renew</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium text-text block">{license.requester?.full_name ?? '—'}</span>
                      {license.requester?.employee_id && (
                        <span className="text-xs text-text-secondary">{license.requester.employee_id}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-text">{license.license_name}</TableCell>
                    <TableCell className="text-text-secondary">{license.license_type ?? '—'}</TableCell>
                    <TableCell className="text-text-secondary whitespace-nowrap">{formatDate(license.expiry_date)}</TableCell>
                    <TableCell className="text-text-secondary">{license.auto_renew ? 'Enabled' : 'Disabled'}</TableCell>
                    <TableCell>
                      <StatusBadge status={license.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {licenses.map((license) => (
              <div key={license.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-text">{license.requester?.full_name ?? '—'}</span>
                  <StatusBadge status={license.status} />
                </div>
                <p className="text-xs text-text-secondary">{license.license_name}{license.license_type ? ` · ${license.license_type}` : ''}</p>
                <p className="mt-1 text-xs text-text-muted">
                  Expires {formatDate(license.expiry_date)} · Auto-renew {license.auto_renew ? 'on' : 'off'}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
