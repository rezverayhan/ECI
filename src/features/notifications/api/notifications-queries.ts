import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/features/auth/context/auth-context'

export function useRecentNotifications() {
  const { appUser } = useAuth()
  const userId = appUser?.id

  return useQuery({
    queryKey: ['notifications', 'recent', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, is_read, created_at')
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
