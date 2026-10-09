import { KeyRound, LifeBuoy, Bell, Users } from 'lucide-react'
import { StatCard } from './stat-card'
import { QuickLinkRow } from './quick-link-row'
import { useEmployeeCounts } from '../hooks/dashboard-queries'
import { useSupportQueue } from '@/features/support/hooks/support-queries'
import { useAllLicenses } from '@/features/renewals/hooks/renewals-queries'
import { useUnreadNotificationCount } from '@/features/notifications/api/notifications-queries'

const OPEN_SUPPORT_STATUSES = new Set(['submitted', 'acknowledged', 'in_progress', 'waiting_on_hold'])

export function ItAdminOverview() {
  const employeeCounts = useEmployeeCounts(true)
  const openQueue = useSupportQueue({})
  const licenses = useAllLicenses({})
  const unread = useUnreadNotificationCount()

  const openIssueCount = openQueue.data?.filter((i) => OPEN_SUPPORT_STATUSES.has(i.status)).length ?? null
  const renewalCount = licenses.data?.filter((l) => l.status === 'due' || l.status === 'expired').length ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Active Employees" value={employeeCounts.data?.active ?? null} isLoading={employeeCounts.isPending} isError={employeeCounts.isError} />
        <StatCard label="Open Support Issues" value={openIssueCount} isLoading={openQueue.isPending} isError={openQueue.isError} />
        <StatCard label="Licenses Needing Renewal" value={renewalCount} isLoading={licenses.isPending} isError={licenses.isError} />
        <StatCard label="Unread Notifications" value={unread.data ?? null} isLoading={unread.isPending} isError={unread.isError} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-text">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickLinkRow to="/app/users" icon={Users} label="Users" description="Search and manage employee records" />
          <QuickLinkRow to="/app/support" icon={LifeBuoy} label="IT Support Queue" description="Org-wide support requests" />
          <QuickLinkRow to="/app/renewals" icon={KeyRound} label="Renewals" description="Upcoming, due and expired licenses" />
          <QuickLinkRow to="/app/notifications" icon={Bell} label="Notifications" description="Your recent activity" />
        </div>
      </div>
    </div>
  )
}
