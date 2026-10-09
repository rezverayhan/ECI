import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/context/auth-context'
import { logAuditEvent } from '@/lib/supabase/audit'
import type { Json } from '@/lib/supabase/database.types'
import { createUser, provisionUserAccount, updateUser } from '../api/users-api'
import type { UserInsert, UserRow, UserUpdate } from '../types'

export interface CreateUserResult {
  user: UserRow
  accountProvisioned: boolean
  provisionError?: string
}

/** Creating the public.users IT-record row alone leaves the employee unable to ever
 *  sign in (no auth.users account exists) — this always attempts to provision+email
 *  their login account right after, but never lets that step hide a successful
 *  record creation behind a fake all-or-nothing failure. See admin-provision-user-account. */
export function useCreateUser() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: async (input: UserInsert): Promise<CreateUserResult> => {
      const created = await createUser(input)
      try {
        await provisionUserAccount(created.id)
        return { user: created, accountProvisioned: true }
      } catch (err) {
        return {
          user: created,
          accountProvisioned: false,
          provisionError: err instanceof Error ? err.message : 'Unable to provision the login account.',
        }
      }
    },
    onSuccess: async ({ user: created }) => {
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

export function useProvisionUserAccount() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (employeeId: string) => provisionUserAccount(employeeId),
    onSuccess: async (_result, employeeId) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'USER_ACCOUNT_PROVISIONED',
          entityType: 'users',
          entityId: employeeId,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', employeeId] })
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
