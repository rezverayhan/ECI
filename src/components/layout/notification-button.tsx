import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { LoadingState } from '@/components/shared/loading-state'
import {
  useRecentNotifications,
  useUnreadNotificationCount,
} from '@/features/notifications/api/notifications-queries'

export function NotificationButton() {
  const unreadQuery = useUnreadNotificationCount()
  const recentQuery = useRecentNotifications()
  const unreadCount = unreadQuery.data ?? 0

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <span className="relative inline-flex">
              <Bell className="size-4.5" aria-hidden />
              {unreadCount > 0 ? (
                <span
                  className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-error text-[9px] font-medium text-white"
                  aria-hidden
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between px-1 py-1">
          <p className="text-sm font-medium text-text">Notifications</p>
        </div>
        {recentQuery.isPending ? (
          <LoadingState label="Loading notifications…" />
        ) : recentQuery.isError ? (
          <ErrorState
            title="Unable to load notifications"
            description="Please try again."
          />
        ) : recentQuery.data.length === 0 ? (
          <EmptyState title="You're all caught up" description="There are no new notifications." />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recentQuery.data.map((notification) => (
              <li key={notification.id} className="px-1 py-2">
                <p className="text-sm font-medium text-text">{notification.title}</p>
                {notification.message ? (
                  <p className="mt-0.5 text-xs text-text-secondary">{notification.message}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          nativeButton={false}
          render={<Link to="/app/notifications" />}
        >
          View all
        </Button>
      </PopoverContent>
    </Popover>
  )
}
