import { LifeBuoy, Bell, CalendarDays, Phone } from 'lucide-react'
import { StatCard } from './stat-card'
import { QuickLinkRow } from './quick-link-row'
import { useSupportQueue } from '@/features/support/hooks/support-queries'
import { useUnreadNotificationCount } from '@/features/notifications/api/notifications-queries'

const OPEN_SUPPORT_STATUSES = new Set(['submitted', 'acknowledged', 'in_progress', 'waiting_on_hold'])

/**
 * General Manager has full read access to support_issues (is_general_manager()
 * in that policy), but no visibility into users/user_licenses/device_assignments
 * tables — so only Support and Notifications are shown here, honestly.
 */
export function GeneralManagerOverview() {
  const openQueue = useSupportQueue({})
  const unread = useUnreadNotificationCount()

  const openIssueCount = openQueue.data?.filter((i) => OPEN_SUPPORT_STATUSES.has(i.status)).length ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Open Support Issues" value={openIssueCount} isLoading={openQueue.isPending} isError={openQueue.isError} />
        <StatCard label="Unread Notifications" value={unread.data ?? null} isLoading={unread.isPending} isError={unread.isError} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-text">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickLinkRow to="/app/support" icon={LifeBuoy} label="IT Support Queue" description="Org-wide support requests (read-only)" />
          <QuickLinkRow to="/app/bookings/meeting-rooms" icon={CalendarDays} label="Meeting Rooms" description="Check availability and bookings" />
          <QuickLinkRow to="/app/ip-phone-directory" icon={Phone} label="IP Phone Directory" description="Organization extension directory" />
          <QuickLinkRow to="/app/notifications" icon={Bell} label="Notifications" description="Your recent activity" />
        </div>
      </div>
    </div>
  )
}
