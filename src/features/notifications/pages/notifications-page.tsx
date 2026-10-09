import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { PaginationBar } from '@/features/users/components/pagination-bar'
import {
  resolveNotificationHref,
  useNotificationsList,
  useUnreadNotificationCount,
  type NotificationListItem,
} from '../api/notifications-queries'
import { useMarkAllNotificationsRead, useMarkNotificationRead } from '../api/notifications-mutations'

const PAGE_SIZE = 20

const TYPE_LABELS: Record<string, string> = {
  SUPPORT_ISSUE_ACKNOWLEDGED: 'Issue acknowledged',
  SUPPORT_ISSUE_STATUS_CHANGED: 'Status changed',
  SUPPORT_ISSUE_RESOLVED: 'Issue resolved',
  SUPPORT_ISSUE_CLOSED: 'Issue closed',
  SUPPORT_ISSUE_ASSIGNED: 'Issue assigned',
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)

  const { data, isPending, isError, refetch } = useNotificationsList({
    page,
    pageSize: PAGE_SIZE,
    unreadOnly: filter === 'unread',
  })
  const unreadCountQuery = useUnreadNotificationCount()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const [markAllError, setMarkAllError] = useState<string | null>(null)

  const hasUnread = (unreadCountQuery.data ?? 0) > 0

  function changeFilter(next: 'all' | 'unread') {
    setFilter(next)
    setPage(1)
  }

  function handleClick(notification: NotificationListItem) {
    if (!notification.is_read) markRead.mutate(notification.id)
    const href = resolveNotificationHref(notification)
    if (href) navigate(href, { state: { from: '/app/notifications', fromLabel: 'Notifications' } })
  }

  async function handleMarkAll() {
    setMarkAllError(null)
    try {
      await markAll.mutateAsync()
    } catch {
      setMarkAllError('Unable to mark all notifications as read. Refresh and try again.')
    }
  }

  if (isPending) {
    return <LoadingState label="Loading notifications…" />
  }

  if (isError) {
    return (
      <ErrorState
        title="Your notifications could not be loaded"
        description="Check your connection and retry."
        onRetry={() => refetch()}
      />
    )
  }

  const rows = data?.rows ?? []
  const totalCount = data?.totalCount ?? 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Updates relevant to your account."
        actions={
          hasUnread ? (
            <Button size="sm" variant="outline" onClick={handleMarkAll} disabled={markAll.isPending} className="gap-1.5">
              <CheckCheck className="size-3.5" aria-hidden />
              {markAll.isPending ? 'Marking…' : 'Mark all as read'}
            </Button>
          ) : undefined
        }
      />

      {markAllError && <p className="text-xs text-error">{markAllError}</p>}

      <div className="flex items-center gap-1 border-b border-border">
        <button
          type="button"
          onClick={() => changeFilter('all')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => changeFilter('unread')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'unread' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          Unread
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? "You're all caught up." : 'No notifications yet'}
          description={
            filter === 'unread'
              ? 'New notifications will appear here when there is an update.'
              : 'Notifications relevant to your account will appear here.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <ul className="divide-y divide-border">
            {rows.map((notification) => {
              const href = resolveNotificationHref(notification)
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(notification)}
                    disabled={!href && notification.is_read}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <span
                      className={`mt-2 size-2 shrink-0 rounded-full ${notification.is_read ? 'bg-transparent border border-border' : 'bg-primary'}`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm ${notification.is_read ? 'text-text-secondary' : 'font-semibold text-text'}`}>
                          {notification.title}
                        </span>
                        {!notification.is_read && (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-primary">Unread</span>
                        )}
                      </span>
                      {notification.message && (
                        <span className="mt-0.5 block text-sm text-text-secondary">{notification.message}</span>
                      )}
                      <span className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                        <span>{formatDateTime(notification.created_at)}</span>
                        {TYPE_LABELS[notification.notification_type] && (
                          <>
                            <span>·</span>
                            <span>{TYPE_LABELS[notification.notification_type]}</span>
                          </>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <PaginationBar page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />
    </div>
  )
}
