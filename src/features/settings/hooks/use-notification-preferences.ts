import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferencesUpdate,
} from '../api/notification-preferences-api'
import { useAuth } from '@/features/auth/context/auth-context'

export function useNotificationPreferences() {
  const { appUser } = useAuth()
  const userId = appUser?.id

  return useQuery({
    queryKey: ['settings', 'notification-preferences', userId],
    queryFn: () => getNotificationPreferences(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()
  const userId = appUser?.id

  return useMutation({
    mutationFn: (input: NotificationPreferencesUpdate) => {
      if (!userId) throw new Error('Not authenticated')
      return updateNotificationPreferences(input, userId)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings', 'notification-preferences', userId], {
        preferences: updated,
        isPendingMigration: false,
      })
      queryClient.invalidateQueries({ queryKey: ['settings', 'notification-preferences', userId] })
    },
  })
}
