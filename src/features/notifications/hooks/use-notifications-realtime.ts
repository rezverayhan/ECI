import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/features/auth/context/auth-context'

/**
 * Mount exactly once (in AppShell) for the lifetime of an authenticated session —
 * never inside the bell or the notifications page themselves, which can mount and
 * unmount repeatedly and would otherwise open duplicate Realtime channels.
 * RLS still applies to the Realtime changefeed, so this only ever receives rows
 * where recipient_user_id matches the caller.
 */
export function useNotificationsRealtime() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()
  const userId = appUser?.id

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `recipient_user_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', 'recent', userId] })
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', userId] })
          queryClient.invalidateQueries({ queryKey: ['notifications', 'list', userId] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, userId])
}
