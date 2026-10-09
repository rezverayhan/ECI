import { useState } from 'react'
import { CalendarX2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { BookingActionDialog, type BookingAction } from './booking-action-dialog'
import { formatDhakaRange } from '../lib/datetime'
import type { BookingStatus } from '../api/bookings-api'

export interface BookingListRow {
  id: string
  resourceName: string
  resourceSubtitle: string | null
  requesterName: string
  requesterEmployeeId: string | null
  startAt: string
  endAt: string
  status: BookingStatus
  summary: string | null
  purpose: string | null
  adminActionReason: string | null
}

interface BookingListProps {
  rows: BookingListRow[]
  canManage: boolean
  isActionPending: boolean
  onCancel: (id: string, reason: string | null) => Promise<void>
  onPause: (id: string, reason: string | null) => Promise<void>
  onDeny: (id: string, reason: string | null) => Promise<void>
  emptyTitle: string
  emptyDescription?: string
}

const CANCEL_DENY_FROM: BookingStatus[] = ['confirmed', 'pending', 'paused']
const PAUSE_FROM: BookingStatus[] = ['confirmed']

export function BookingList({
  rows,
  canManage,
  isActionPending,
  onCancel,
  onPause,
  onDeny,
  emptyTitle,
  emptyDescription,
}: BookingListProps) {
  const [actionState, setActionState] = useState<{ row: BookingListRow; action: BookingAction } | null>(null)

  if (rows.length === 0) {
    return <EmptyState icon={CalendarX2} title={emptyTitle} description={emptyDescription} />
  }

  async function handleConfirm(reason: string | null) {
    if (!actionState) return
    const { row, action } = actionState
    if (action === 'cancel') await onCancel(row.id, reason)
    else if (action === 'pause') await onPause(row.id, reason)
    else await onDeny(row.id, reason)
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Resource</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap">
                  <span className="font-medium text-text block">{row.resourceName}</span>
                  {row.resourceSubtitle && <span className="text-xs text-text-secondary">{row.resourceSubtitle}</span>}
                </TableCell>
                <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                  {row.requesterName}
                  {row.requesterEmployeeId ? ` (${row.requesterEmployeeId})` : ''}
                </TableCell>
                <TableCell className="text-xs text-text-secondary whitespace-nowrap">
                  {formatDhakaRange(row.startAt, row.endAt)}
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <span className="text-xs text-text block truncate">{row.summary ?? '—'}</span>
                  {row.purpose && <span className="text-xs text-text-muted block truncate">{row.purpose}</span>}
                  {row.status !== 'confirmed' && row.adminActionReason && (
                    <span className="text-xs text-text-muted block truncate">Reason: {row.adminActionReason}</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={row.status} />
                </TableCell>
                {canManage && (
                  <TableCell className="text-right whitespace-nowrap">
                    <BookingRowActions row={row} onSelect={(action) => setActionState({ row, action })} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-border bg-surface p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">{row.resourceName}</p>
                {row.resourceSubtitle && <p className="text-xs text-text-secondary truncate">{row.resourceSubtitle}</p>}
              </div>
              <StatusBadge status={row.status} />
            </div>
            <p className="mt-2 text-xs text-text-secondary">{formatDhakaRange(row.startAt, row.endAt)}</p>
            <p className="text-xs text-text-secondary">
              {row.requesterName}
              {row.requesterEmployeeId ? ` (${row.requesterEmployeeId})` : ''}
            </p>
            {row.summary && <p className="mt-1 text-xs text-text truncate">{row.summary}</p>}
            {row.purpose && <p className="text-xs text-text-muted truncate">{row.purpose}</p>}
            {row.status !== 'confirmed' && row.adminActionReason && (
              <p className="text-xs text-text-muted truncate">Reason: {row.adminActionReason}</p>
            )}
            {canManage && (
              <div className="mt-3">
                <BookingRowActions row={row} onSelect={(action) => setActionState({ row, action })} stacked />
              </div>
            )}
          </div>
        ))}
      </div>

      {actionState && (
        <BookingActionDialog
          open
          onOpenChange={(next) => { if (!next) setActionState(null) }}
          action={actionState.action}
          resourceLabel={actionState.row.resourceName}
          requesterName={actionState.row.requesterName}
          isPending={isActionPending}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}

function BookingRowActions({
  row,
  onSelect,
  stacked = false,
}: {
  row: BookingListRow
  onSelect: (action: BookingAction) => void
  stacked?: boolean
}) {
  const canPause = PAUSE_FROM.includes(row.status)
  const canCancelOrDeny = CANCEL_DENY_FROM.includes(row.status)

  if (!canPause && !canCancelOrDeny) {
    return <span className="text-xs text-text-muted">—</span>
  }

  return (
    <div className={stacked ? 'flex gap-2' : 'flex justify-end gap-2'}>
      {canPause && (
        <Button size="sm" variant="outline" onClick={() => onSelect('pause')}>
          Pause
        </Button>
      )}
      {canCancelOrDeny && (
        <>
          <Button size="sm" variant="outline" onClick={() => onSelect('deny')}>
            Deny
          </Button>
          <Button size="sm" variant="outline" className="text-error hover:text-error" onClick={() => onSelect('cancel')}>
            Cancel
          </Button>
        </>
      )}
    </div>
  )
}
