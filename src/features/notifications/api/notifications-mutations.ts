import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/features/auth/context/auth-context'

function invalidateNotificationQueries(queryClient: ReturnType<typeof useQueryClient>, userId: string | undefined) {
  queryClient.invalidateQueries({ queryKey: ['notifications', 'recent', userId] })
  queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', userId] })
  queryClient.invalidateQueries({ queryKey: ['notifications', 'list', userId] })
}

/** Idempotent: marking an already-read notification again is a harmless no-op,
 * not an error — only genuinely unread rows are affected. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => invalidateNotificationQueries(queryClient, appUser?.id),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!appUser?.id) throw new Error('Your session could not be verified. Please sign in again.')
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_user_id', appUser.id)
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => invalidateNotificationQueries(queryClient, appUser?.id),
  })
}
