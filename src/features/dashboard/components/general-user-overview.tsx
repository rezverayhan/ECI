import { Laptop, KeyRound, CalendarDays, Car, Bell, UserCircle2 } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { StatCard } from './stat-card'
import { QuickLinkRow } from './quick-link-row'
import { useAuth } from '@/features/auth/context/auth-context'
import { useUserCurrentDevice, useUserSupportIssues, useUserLicenses } from '@/features/users/hooks/user-details-queries'
import { useRoomBookings, useCarBookings } from '@/features/bookings/hooks/bookings-queries'
import { useUnreadNotificationCount } from '@/features/notifications/api/notifications-queries'
import { formatDate } from '@/features/users/components/details/details-types'

const OPEN_SUPPORT_STATUSES = new Set(['submitted', 'acknowledged', 'in_progress', 'waiting_on_hold'])

export function GeneralUserOverview() {
  const { appUser } = useAuth()
  const userId = appUser?.id

  const device = useUserCurrentDevice(userId)
  const issues = useUserSupportIssues(userId)
  const licenses = useUserLicenses(userId)
  const roomBookings = useRoomBookings({ scope: 'mine', currentUserId: userId ?? '', status: 'confirmed' })
  const carBookings = useCarBookings({ scope: 'mine', currentUserId: userId ?? '', status: 'confirmed' })
  const unread = useUnreadNotificationCount()

  const openIssueCount = issues.data?.filter((i) => OPEN_SUPPORT_STATUSES.has(i.status)).length ?? null
  const myBookingCount = (roomBookings.data?.length ?? 0) + (carBookings.data?.length ?? 0)
  const primaryLicense = licenses.data?.[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="My Open Issues" value={openIssueCount} isLoading={issues.isPending} isError={issues.isError} />
        <StatCard
          label="My Upcoming Bookings"
          value={roomBookings.isPending || carBookings.isPending ? null : myBookingCount}
          isLoading={roomBookings.isPending || carBookings.isPending}
          isError={roomBookings.isError || carBookings.isError}
        />
        <StatCard label="Unread Notifications" value={unread.data ?? null} isLoading={unread.isPending} isError={unread.isError} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Laptop className="size-4 text-text-muted" aria-hidden />
            <h3 className="text-sm font-semibold text-text">My Device</h3>
          </div>
          {device.isPending ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : device.isError ? (
            <p className="text-sm text-text-secondary">Unable to load device information.</p>
          ) : !device.data ? (
            <EmptyState title="No device is currently assigned to you." />
          ) : (
            <div>
              <p className="text-sm font-medium text-text">
                {[device.data.device.brand, device.data.device.model].filter(Boolean).join(' ') || device.data.device.device_type}
              </p>
              <p className="text-xs text-text-secondary">Asset ID: {device.data.device.asset_id ?? '—'}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="size-4 text-text-muted" aria-hidden />
            <h3 className="text-sm font-semibold text-text">My License</h3>
          </div>
          {licenses.isPending ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : licenses.isError ? (
            <p className="text-sm text-text-secondary">Unable to load license information.</p>
          ) : !primaryLicense ? (
            <EmptyState title="No account license is currently recorded for you." />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">{primaryLicense.license_name}</p>
                <p className="text-xs text-text-secondary">Expires {formatDate(primaryLicense.expiry_date)}</p>
              </div>
              <StatusBadge status={primaryLicense.status} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-text">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickLinkRow
            to={userId ? `/app/users/${userId}` : '/app/dashboard'}
            icon={UserCircle2}
            label="My Employee 360 Profile"
            description="Device, license, support and history"
          />
          <QuickLinkRow to="/app/bookings/meeting-rooms" icon={CalendarDays} label="Book a Meeting Room" />
          <QuickLinkRow to="/app/bookings/cars" icon={Car} label="Book a Car" />
          <QuickLinkRow to="/app/notifications" icon={Bell} label="Notifications" />
        </div>
      </div>
    </div>
  )
}
