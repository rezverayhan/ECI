import { Activity } from 'lucide-react'
import { SectionPanel } from '@/components/shared/section-panel'
import { ActivityList, type ActivityItem } from '@/components/shared/activity-list'
import { formatDateTime } from './details-types'
import type { UserAuditLogEntry } from '../../api/user-details-api'

interface RecentActivityCardProps {
  auditLogs: UserAuditLogEntry[]
}

const ACTION_DESCRIPTIONS: Record<string, string> = {
  USER_CREATED: 'User profile created',
  USER_UPDATED: 'Profile details updated',
  USER_STATUS_CHANGED: 'Employment status changed',
  DEVICE_ASSIGNED: 'Physical hardware assigned',
  DEVICE_RETURNED: 'Hardware returned to pool',
  IP_ADDRESS_ASSIGNED: 'Static IP allocated',
  IP_ADDRESS_RELEASED: 'IP allocation released',
  PRINTER_ASSIGNED: 'Printer access assigned',
  PRINTER_RETURNED: 'Printer access released',
  APPLICATION_ASSIGNED: 'Software license provisioned',
  APPLICATION_REMOVED: 'Software access revoked',
  SUPPORT_ISSUE_CREATED: 'IT support ticket logged',
  MACHINE_PROFILE_UPDATED: 'Machine identity updated',
}

export function RecentActivityCard({ auditLogs }: RecentActivityCardProps) {
  const items: ActivityItem[] = auditLogs.slice(0, 5).map((log) => ({
    id: log.id,
    title: ACTION_DESCRIPTIONS[log.action] || log.action.replace(/_/g, ' '),
    timestamp: formatDateTime(log.created_at),
    actor: log.actor?.full_name,
  }))

  return (
    <SectionPanel className="p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center gap-2 pb-3 border-b border-border/80">
        <Activity className="size-3.5 text-text-muted" aria-hidden />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Recent Activity
        </h3>
      </div>

      <ActivityList
        items={items}
        emptyMessage="No audit activity recorded yet for this employee."
      />
    </SectionPanel>
  )
}
