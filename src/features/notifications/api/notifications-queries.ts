import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/features/auth/context/auth-context'
import type { Database } from '@/lib/supabase/database.types'

export type NotificationRow = Database['public']['Tables']['notifications']['Row']
export type NotificationListItem = Pick<
  NotificationRow,
  'id' | 'notification_type' | 'title' | 'message' | 'related_entity_type' | 'related_entity_id' | 'is_read' | 'read_at' | 'created_at'
>

const NOTIFICATION_SELECT = 'id, notification_type, title, message, related_entity_type, related_entity_id, is_read, read_at, created_at'

export function useRecentNotifications() {
  const { appUser } = useAuth()
  const userId = appUser?.id

  return useQuery({
    queryKey: ['notifications', 'recent', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(NOTIFICATION_SELECT)
        .eq('recipient_user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data
    },
  })
}

export function useUnreadNotificationCount() {
  const { appUser } = useAuth()
  const userId = appUser?.id

  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_user_id', userId!)
        .eq('is_read', false)

      if (error) throw error
      return count ?? 0
    },
  })
}

export interface NotificationsListParams {
  page: number
  pageSize: number
  unreadOnly: boolean
}

export interface NotificationsListResult {
  rows: NotificationListItem[]
  totalCount: number
}

/** Page-based, consistent with the existing search_users pagination convention
 * elsewhere in the app — never downloads the full table to paginate client-side. */
export function useNotificationsList(params: NotificationsListParams) {
  const { appUser } = useAuth()
  const userId = appUser?.id

  return useQuery({
    queryKey: ['notifications', 'list', userId, params],
    enabled: Boolean(userId),
    queryFn: async (): Promise<NotificationsListResult> => {
      const from = (params.page - 1) * params.pageSize
      const to = from + params.pageSize - 1

      let query = supabase
        .from('notifications')
        .select(NOTIFICATION_SELECT, { count: 'exact' })
        .eq('recipient_user_id', userId!)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (params.unreadOnly) query = query.eq('is_read', false)

      const { data, error, count } = await query
      if (error) throw error
      return { rows: data ?? [], totalCount: count ?? 0 }
    },
  })
}

/**
 * Known, explicit allowlist of notification types -> real routes. Never derives a
 * destination from the title, and never builds an arbitrary URL from stored text —
 * only `related_entity_id` (a real row id) is interpolated into a known route shape.
 * Unknown/missing destinations return null; callers must handle that by not navigating.
 */
export function resolveNotificationHref(notification: Pick<NotificationRow, 'related_entity_type' | 'related_entity_id'>): string | null {
  if (!notification.related_entity_id) return null
  if (notification.related_entity_type === 'support_issues') {
    return `/app/support/${notification.related_entity_id}`
  }
  // Booking notifications have no per-booking detail route — they land on the
  // relevant resource list page, where the booking appears in "My Bookings".
  if (notification.related_entity_type === 'meeting_room_bookings') {
    return `/app/bookings/meeting-rooms`
  }
  if (notification.related_entity_type === 'car_bookings') {
    return `/app/bookings/cars`
  }
  return null
}
