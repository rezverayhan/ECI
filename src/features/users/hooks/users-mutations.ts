import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/context/auth-context'
import { logAuditEvent } from '@/lib/supabase/audit'
import type { Json } from '@/lib/supabase/database.types'
import { createUser, updateUser } from '../api/users-api'
import type { UserInsert, UserRow, UserUpdate } from '../types'

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: UserInsert) => createUser(input),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'USER_CREATED',
          entityType: 'users',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] })
    },
  })
}

interface UpdateUserArgs {
  id: string
  input: UserUpdate
  previous: UserRow
  auditAction: 'USER_UPDATED' | 'USER_STATUS_CHANGED'
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: ({ id, input }: UpdateUserArgs) => updateUser(id, input),
    onSuccess: async (updated, variables) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: variables.auditAction,
          entityType: 'users',
          entityId: updated.id,
          oldValues: variables.previous as unknown as Record<string, Json>,
          newValues: updated as unknown as Record<string, Json>,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', updated.id] })
      queryClient.invalidateQueries({ queryKey: ['app-user'] })
    },
  })
}
