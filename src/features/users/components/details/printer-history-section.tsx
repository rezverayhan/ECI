import { History, Printer } from 'lucide-react'
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
import type { UserPrinterHistoryEntry } from '../../api/user-details-api'

interface PrinterHistorySectionProps {
  history: UserPrinterHistoryEntry[]
}

export function PrinterHistorySection({ history }: PrinterHistorySectionProps) {
  return (
    <SectionPanel id="sec-printer-history" ariaLabelledby="heading-printer-history">
      <SectionHeader
        icon={History}
        title="Printer Assignment History"
        description="Chronological record of all printer assets held by this employee."
        headingId="heading-printer-history"
      />

      {history.length === 0 ? (
        <EmptyState icon={Printer} title="No printer assignment history found." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Printer</TableHead>
                <TableHead>Asset ID / Serial</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Returned Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => {
                const isCurrent = item.assignment_status === 'active'
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-medium text-text block truncate">
                        {item.printer.brand ? `${item.printer.brand} ` : ''}{item.printer.printer_name}
                      </span>
                      {item.printer.model && (
                        <span className="text-xs text-text-secondary">{item.printer.model}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-text">
                      <div>{item.printer.asset_id}</div>
                      {item.printer.serial_number && (
                        <div className="text-xs text-text-muted">SN: {item.printer.serial_number}</div>
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
                      <StatusBadge status={isCurrent ? 'assigned' : 'returned'} labelOverride={isCurrent ? 'Current' : 'Returned'} />
                    </TableCell>
                    <TableCell className="text-text-secondary max-w-xs">
                      {item.notes ? (
                        <span className="block text-xs text-text-muted truncate" title={item.notes}>
                          {item.notes}
                        </span>
                      ) : (
                        '—'
                      )}
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
