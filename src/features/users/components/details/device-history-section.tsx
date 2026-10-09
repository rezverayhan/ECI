import { History, Laptop } from 'lucide-react'
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
import type { UserDeviceHistoryEntry } from '../../api/user-details-api'

interface DeviceHistorySectionProps {
  deviceHistory: UserDeviceHistoryEntry[]
}

export function DeviceHistorySection({ deviceHistory }: DeviceHistorySectionProps) {
  return (
    <SectionPanel id="sec-device-history" ariaLabelledby="heading-device-history">
      <SectionHeader
        icon={History}
        title="Device Assignment History"
        description="Chronological audit of all physical hardware assignments held by this employee."
        headingId="heading-device-history"
      />

      {deviceHistory.length === 0 ? (
        <EmptyState
          icon={History}
          title="No previous device assignments"
          description="This employee does not have any historical hardware assignments on record."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Hardware Asset</TableHead>
                <TableHead>Asset ID / Serial</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Returned Date</TableHead>
                <TableHead>Assignment State</TableHead>
                <TableHead>Replacement / Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceHistory.map((item) => {
                const isCurrent = item.assignment_status === 'active'
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-canvas border border-border text-text-muted">
                          <Laptop className="size-3.5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-text block truncate">
                              {item.device.brand ? `${item.device.brand} ` : ''}{item.device.model}
                            </span>
                            {item.device.status === 'retired' && (
                              <StatusBadge status="retired" />
                            )}
                          </div>
                          <span className="capitalize text-xs text-text-secondary">
                            {item.device.device_type}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-text">
                      <div>{item.device.asset_id}</div>
                      {item.device.serial_number && (
                        <div className="text-xs text-text-muted">SN: {item.device.serial_number}</div>
                      )}
                    </TableCell>

                    <TableCell className="text-text-secondary">
                      <div>{formatDate(item.assigned_at)}</div>
                      {item.assigned_by_user && (
                        <div className="text-xs text-text-muted">by {item.assigned_by_user.full_name}</div>
                      )}
                    </TableCell>

                    <TableCell className="text-text-secondary">
                      {isCurrent ? (
                        <span className="text-primary font-medium">Currently Held</span>
                      ) : (
                        <>
                          <div>{formatDate(item.returned_at)}</div>
                          {item.returned_by_user && (
                            <div className="text-xs text-text-muted">by {item.returned_by_user.full_name}</div>
                          )}
                        </>
                      )}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={isCurrent ? 'assigned' : 'returned'}
                        labelOverride={isCurrent ? 'Current' : 'Returned'}
                      />
                    </TableCell>

                    <TableCell className="text-text-secondary max-w-xs">
                      {item.replacement_reason ? (
                        <span className="font-medium text-text block">{item.replacement_reason}</span>
                      ) : null}
                      {item.notes ? (
                        <span className="block text-xs text-text-muted truncate" title={item.notes}>
                          {item.notes}
                        </span>
                      ) : null}
                      {!item.replacement_reason && !item.notes && '—'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionPanel>
  )
}
