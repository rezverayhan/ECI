import { useMemo } from 'react'
import { CalendarDays, Car, Bell } from 'lucide-react'
import { StatCard } from './stat-card'
import { QuickLinkRow } from './quick-link-row'
import { useAuth } from '@/features/auth/context/auth-context'
import { useRoomBookings, useCarBookings } from '@/features/bookings/hooks/bookings-queries'
import { useUnreadNotificationCount } from '@/features/notifications/api/notifications-queries'

/**
 * admin's meeting_room_bookings_select / car_bookings_select RLS grants
 * full org-wide read access (is_admin() branch), so scope: 'all' here
 * returns the real organization-wide set, not just the admin's own rows.
 */
export function AdminOverview() {
  const { appUser } = useAuth()
  const currentUserId = appUser?.id ?? ''

  const roomBookings = useRoomBookings({ scope: 'all', currentUserId, status: 'confirmed' })
  const carBookings = useCarBookings({ scope: 'all', currentUserId, status: 'confirmed' })
  const unread = useUnreadNotificationCount()

  const now = useMemo(() => new Date().toISOString(), [])
  const upcomingRooms = roomBookings.data?.filter((b) => b.end_at > now).length ?? null
  const upcomingCars = carBookings.data?.filter((b) => b.end_at > now).length ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Active Room Bookings" value={upcomingRooms} isLoading={roomBookings.isPending} isError={roomBookings.isError} />
        <StatCard label="Active Car Bookings" value={upcomingCars} isLoading={carBookings.isPending} isError={carBookings.isError} />
        <StatCard label="Unread Notifications" value={unread.data ?? null} isLoading={unread.isPending} isError={unread.isError} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-text">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickLinkRow to="/app/bookings/meeting-rooms" icon={CalendarDays} label="Meeting Rooms" description="Manage bookings and availability" />
          <QuickLinkRow to="/app/bookings/cars" icon={Car} label="Cars" description="Manage bookings and availability" />
          <QuickLinkRow to="/app/notifications" icon={Bell} label="Notifications" description="Your recent activity" />
        </div>
      </div>
    </div>
  )
}
