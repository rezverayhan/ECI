import { Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { LoadingState } from '@/components/shared/loading-state'
import {
  resolveNotificationHref,
  useRecentNotifications,
  useUnreadNotificationCount,
  type NotificationRow,
} from '@/features/notifications/api/notifications-queries'
import { useMarkNotificationRead } from '@/features/notifications/api/notifications-mutations'

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const diffMs = Date.now() - d.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

export function NotificationButton() {
  const navigate = useNavigate()
  const unreadQuery = useUnreadNotificationCount()
  const recentQuery = useRecentNotifications()
  const markRead = useMarkNotificationRead()
  const unreadCount = unreadQuery.data ?? 0

  function handleNotificationClick(notification: Pick<NotificationRow, 'id' | 'is_read' | 'related_entity_type' | 'related_entity_id'>) {
    if (!notification.is_read) {
      markRead.mutate(notification.id)
    }
    const href = resolveNotificationHref(notification)
    if (href) navigate(href)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="size-11" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}>
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
            description="Your notifications could not be loaded. Check your connection and retry."
          />
        ) : recentQuery.data.length === 0 ? (
          <EmptyState title="No notifications yet" description="Notifications relevant to your account will appear here." />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recentQuery.data.map((notification) => {
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="flex w-full items-start gap-2 px-1 py-2 text-left hover:bg-canvas rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${notification.is_read ? 'bg-transparent border border-border' : 'bg-primary'}`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm ${notification.is_read ? 'text-text-secondary' : 'font-medium text-text'}`}>
                        {notification.title}
                      </span>
                      {notification.message ? (
                        <span className="mt-0.5 block text-xs text-text-secondary line-clamp-2">{notification.message}</span>
                      ) : null}
                      <span className="mt-0.5 block text-[11px] text-text-muted">
                        {formatRelativeTime(notification.created_at)}
                        {!notification.is_read ? ' · Unread' : ''}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          nativeButton={false}
          render={<Link to="/app/notifications" />}
        >
          View all notifications
        </Button>
      </PopoverContent>
    </Popover>
  )
}
