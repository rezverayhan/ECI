import { History, PhoneCall } from 'lucide-react'
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
import type { UserIpPhoneHistoryEntry } from '../../api/user-details-api'

interface IpPhoneHistorySectionProps {
  history: UserIpPhoneHistoryEntry[]
}

export function IpPhoneHistorySection({ history }: IpPhoneHistorySectionProps) {
  return (
    <SectionPanel id="sec-ip-phone-history" ariaLabelledby="heading-ip-phone-history">
      <SectionHeader
        icon={History}
        title="IP Phone Assignment History"
        description="Chronological record of all extensions held by this employee."
        headingId="heading-ip-phone-history"
      />

      {history.length === 0 ? (
        <EmptyState icon={PhoneCall} title="No IP Phone assignment history found." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Extension</TableHead>
                <TableHead>Phone Type</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Released Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => {
                const isCurrent = item.assignment_status === 'active'
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-text">Ext {item.ip_phone.extension}</TableCell>
                    <TableCell className="text-xs text-text-secondary">{item.ip_phone.phone_type ?? '—'}</TableCell>
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
                          <div>{formatDate(item.released_at)}</div>
                          {item.released_by_user && (
                            <div className="text-xs text-text-muted">by {item.released_by_user.full_name}</div>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={isCurrent ? 'assigned' : 'returned'} labelOverride={isCurrent ? 'Current' : 'Released'} />
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
