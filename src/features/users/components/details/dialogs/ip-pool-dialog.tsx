import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
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
import { Network } from 'lucide-react'
import { useIpPool } from '../../../hooks/user-details-queries'
import { useIpPoolActions } from '../../../hooks/user-details-mutations'
import { ReserveIpDialog } from './reserve-ip-dialog'

const STATUS_FILTERS = ['all', 'free', 'assigned', 'reserved', 'unavailable'] as const

interface IpPoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IpPoolDialog({ open, onOpenChange }: IpPoolDialogProps) {
  const { data: pool = [], isPending } = useIpPool(open)
  const { initialize, unreserve } = useIpPoolActions()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('all')
  const [error, setError] = useState<string | null>(null)
  const [reserveTarget, setReserveTarget] = useState<{ id: string; label: string } | null>(null)

  const counts = useMemo(() => {
    const c = { total: pool.length, free: 0, assigned: 0, reserved: 0, unavailable: 0 }
    for (const ip of pool) {
      if (ip.status === 'free') c.free++
      else if (ip.status === 'assigned') c.assigned++
      else if (ip.status === 'reserved') c.reserved++
      else if (ip.status === 'unavailable') c.unavailable++
    }
    return c
  }, [pool])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pool.filter((ip) => {
      if (statusFilter !== 'all' && ip.status !== statusFilter) return false
      if (!q) return true
      return (
        ip.ip_address.toLowerCase().includes(q) ||
        (ip.assigned_user_name?.toLowerCase().includes(q) ?? false) ||
        (ip.assigned_employee_id?.toLowerCase().includes(q) ?? false) ||
        (ip.assigned_department?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [pool, query, statusFilter])

  async function handleInitialize() {
    setError(null)
    try {
      await initialize.mutateAsync()
    } catch {
      setError('Failed to initialize the IP range. Please try again.')
    }
  }

  async function handleUnreserve(id: string) {
    setError(null)
    try {
      await unreserve.mutateAsync(id)
    } catch {
      setError('Failed to unreserve this IP address. Please try again.')
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>IP Address Pool</DialogTitle>
          <DialogDescription>
            Operational view of the 10.200.198.1 – 10.200.198.254 range. Only real, registered
            addresses are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <span className="font-medium text-text">{counts.total} registered</span>
          <span>·</span>
          <span>{counts.free} free</span>
          <span>·</span>
          <span>{counts.assigned} assigned</span>
          <span>·</span>
          <span>{counts.reserved} reserved</span>
          <span>·</span>
          <span>{counts.unavailable} unavailable</span>
          <span className="ml-auto">
            <Button type="button" size="xs" variant="outline" onClick={handleInitialize} disabled={initialize.isPending}>
              {initialize.isPending ? 'Initializing…' : 'Initialize Missing Range'}
            </Button>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search IP, employee, department…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter((val as typeof statusFilter) ?? 'all')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="max-h-96 overflow-y-auto rounded-lg border border-border">
          {isPending ? (
            <p className="p-6 text-center text-xs text-text-secondary">Loading IP pool…</p>
          ) : pool.length === 0 ? (
            <EmptyState
              icon={Network}
              title="No IP addresses have been registered yet"
              description='Use "Initialize Missing Range" above to register the approved 10.200.198.0/24 range.'
            />
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-xs text-text-secondary">No IP addresses match this search/filter.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned User</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-mono text-xs">{ip.ip_address}</TableCell>
                    <TableCell>
                      <StatusBadge status={ip.status} />
                    </TableCell>
                    <TableCell className="text-xs text-text-secondary">
                      {ip.assigned_user_name ?? (ip.status === 'reserved' ? ip.reserved_user_name ?? '—' : '—')}
                    </TableCell>
                    <TableCell className="text-xs text-text-secondary">{ip.assigned_employee_id ?? '—'}</TableCell>
                    <TableCell className="text-xs text-text-secondary">{ip.assigned_department ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      {ip.status === 'reserved' ? (
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          onClick={() => handleUnreserve(ip.id)}
                          disabled={unreserve.isPending}
                        >
                          Unreserve
                        </Button>
                      ) : ip.status === 'free' ? (
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          onClick={() => setReserveTarget({ id: ip.id, label: ip.ip_address })}
                        >
                          Reserve
                        </Button>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {reserveTarget && (
      <ReserveIpDialog
        open={Boolean(reserveTarget)}
        onOpenChange={(next) => !next && setReserveTarget(null)}
        ipAddressId={reserveTarget.id}
        ipAddressLabel={reserveTarget.label}
      />
    )}
    </>
  )
}
