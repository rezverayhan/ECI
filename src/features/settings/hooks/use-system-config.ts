import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getSystemConfiguration,
  updateSystemConfiguration,
  type SystemConfigurationUpdate,
} from '../api/system-config-api'
import { useAuth } from '@/features/auth/context/auth-context'

export function useSystemConfiguration() {
  return useQuery({
    queryKey: ['settings', 'system-configuration'],
    queryFn: getSystemConfiguration,
    staleTime: 60_000,
  })
}

export function useUpdateSystemConfiguration() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: SystemConfigurationUpdate) => {
      if (!appUser?.id) throw new Error('Not authenticated')
      return updateSystemConfiguration(input, appUser.id)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings', 'system-configuration'], {
        config: updated,
        isPendingMigration: false,
      })
      queryClient.invalidateQueries({ queryKey: ['settings', 'system-configuration'] })
    },
  })
}
