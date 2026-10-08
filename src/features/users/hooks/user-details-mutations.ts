import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/context/auth-context'
import { logAuditEvent } from '@/lib/supabase/audit'
import type { Json } from '@/lib/supabase/database.types'
import {
  assignApplication,
  assignDevice,
  assignIpAddress,
  assignIpPhone,
  assignPrinter,
  clearIpPhoneConflict,
  createApplication,
  createDevice,
  createDeviceServiceRecord,
  createIpPhone,
  createPrinter,
  createSupportIssueForUser,
  createUserLicense,
  flagIpPhoneConflict,
  initializeIpRange,
  reassignIpAddress,
  reassignIpPhone,
  releaseIpAddress,
  releaseIpPhone,
  removeUserApplication,
  renewLicense,
  replaceDevice,
  replacePrinter,
  reserveIpAddress,
  returnDevice,
  returnPrinter,
  saveMachineProfile,
  unreserveIpAddress,
  updateUserApplication,
  updateUserLicense,
  type AssignApplicationInput,
  type AssignDeviceInput,
  type AssignIpInput,
  type AssignIpPhoneInput,
  type AssignPrinterInput,
  type CreateApplicationInput,
  type CreateDeviceInput,
  type CreateIpPhoneInput,
  type CreatePrinterInput,
  type CreateServiceRecordInput,
  type CreateSupportIssueInput,
  type CreateUserLicenseInput,
  type FlagIpPhoneConflictInput,
  type ReassignIpInput,
  type ReassignIpPhoneInput,
  type ReleaseIpInput,
  type ReleaseIpPhoneInput,
  type RenewLicenseInput,
  type ReplaceDeviceInput,
  type ReplacePrinterInput,
  type ReserveIpInput,
  type ReturnDeviceInput,
  type ReturnPrinterInput,
  type SaveMachineProfileInput,
  type UpdateUserApplicationInput,
  type UpdateUserLicenseInput,
} from '../api/user-details-api'
import type { UserApplicationData, UserLicenseWithRenewals } from '../api/user-details-api'

export function useCreateSupportIssue(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<CreateSupportIssueInput, 'userId'>) =>
      createSupportIssueForUser({ ...input, userId }),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_CREATED',
          entityType: 'support_issues',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
          metadata: { user_id: userId, issue_number: created.issue_number },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'support-issues', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useSaveMachineProfile(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<SaveMachineProfileInput, 'userId'>) =>
      saveMachineProfile({ ...input, userId }),
    onSuccess: async (saved) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'MACHINE_PROFILE_UPDATED',
          entityType: 'machine_profiles',
          entityId: saved.id,
          newValues: saved as unknown as Record<string, Json>,
          metadata: { user_id: userId, machine_name: saved.machine_name },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'machine', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useAssignDevice(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<AssignDeviceInput, 'userId' | 'assignedByUserId'>) =>
      assignDevice({ ...input, userId, assignedByUserId: appUser?.id ?? '' }),
    onSuccess: async (assigned) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'DEVICE_ASSIGNED',
          entityType: 'device_assignments',
          entityId: assigned.id,
          newValues: assigned as unknown as Record<string, Json>,
          metadata: { user_id: userId, device_id: assigned.device_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'current-device', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'device-history', userId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-devices'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useReturnDevice(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ReturnDeviceInput, 'returnedByUserId'>) =>
      returnDevice({ ...input, returnedByUserId: appUser?.id ?? '' }),
    onSuccess: async (_data, variables) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'DEVICE_RETURNED',
          entityType: 'device_assignments',
          entityId: variables.assignmentId,
          newValues: { device_id: variables.deviceId, replacement_reason: variables.replacementReason ?? null },
          metadata: { user_id: userId },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'current-device', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'device-history', userId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-devices'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useReplaceDevice(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ReplaceDeviceInput, 'userId' | 'assignedByUserId'>) =>
      replaceDevice({ ...input, userId, assignedByUserId: appUser?.id ?? '' }),
    onSuccess: async (assigned) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'DEVICE_REPLACED',
          entityType: 'device_assignments',
          entityId: assigned.id,
          newValues: assigned as unknown as Record<string, Json>,
          metadata: { user_id: userId, device_id: assigned.device_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'current-device', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'device-history', userId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-devices'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useCreateDevice() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: CreateDeviceInput) => createDevice(input),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'DEVICE_CREATED',
          entityType: 'devices',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
          metadata: { asset_id: created.asset_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-devices'] })
    },
  })
}

export function useCreateServiceRecord(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<CreateServiceRecordInput, 'createdBy'>) =>
      createDeviceServiceRecord({ ...input, createdBy: appUser?.id ?? '' }),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'SERVICE_RECORD_CREATED',
          entityType: 'device_service_records',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
          metadata: { user_id: userId, device_id: created.device_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['devices', 'service-history', created.device_id] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useAssignIpAddress(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<AssignIpInput, 'userId' | 'assignedByUserId'>) =>
      assignIpAddress({ ...input, userId, assignedByUserId: appUser?.id ?? '' }),
    onSuccess: async (assigned) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_ADDRESS_ASSIGNED',
          entityType: 'ip_assignments',
          entityId: assigned.id,
          newValues: assigned as unknown as Record<string, Json>,
          metadata: { user_id: userId, ip_address_id: assigned.ip_address_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'current-network', userId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-ips'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useReleaseIpAddress(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ReleaseIpInput, 'releasedByUserId'>) =>
      releaseIpAddress({ ...input, releasedByUserId: appUser?.id ?? '' }),
    onSuccess: async (_data, variables) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_ADDRESS_RELEASED',
          entityType: 'ip_assignments',
          entityId: variables.assignmentId,
          metadata: { user_id: userId, ip_address_id: variables.ipAddressId },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'current-network', userId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-ips'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useReassignIpAddress(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ReassignIpInput, 'userId' | 'assignedByUserId'>) =>
      reassignIpAddress({ ...input, userId, assignedByUserId: appUser?.id ?? '' }),
    onSuccess: async (assigned) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_ADDRESS_REASSIGNED',
          entityType: 'ip_assignments',
          entityId: assigned.id,
          newValues: assigned as unknown as Record<string, Json>,
          metadata: { user_id: userId, ip_address_id: assigned.ip_address_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'current-network', userId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-ips'] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'ip-pool'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useIpPoolActions() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  function invalidatePool() {
    queryClient.invalidateQueries({ queryKey: ['catalog', 'ip-pool'] })
    queryClient.invalidateQueries({ queryKey: ['catalog', 'available-ips'] })
  }

  const initialize = useMutation({
    mutationFn: initializeIpRange,
    onSuccess: async (result) => {
      if (appUser && result.created > 0) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_POOL_INITIALIZED',
          entityType: 'ip_addresses',
          metadata: { created: result.created, already_existed: result.alreadyExisted, total: result.total },
        })
      }
      invalidatePool()
    },
  })

  const reserve = useMutation({
    mutationFn: (input: ReserveIpInput) => reserveIpAddress(input),
    onSuccess: async (reserved) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_ADDRESS_RESERVED',
          entityType: 'ip_addresses',
          entityId: reserved.id,
          newValues: reserved as unknown as Record<string, Json>,
          metadata: { reserved_for: reserved.reserved_for },
        })
      }
      invalidatePool()
    },
  })

  const unreserve = useMutation({
    mutationFn: (ipAddressId: string) => unreserveIpAddress(ipAddressId),
    onSuccess: async (updated) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_ADDRESS_UNRESERVED',
          entityType: 'ip_addresses',
          entityId: updated.id,
          newValues: updated as unknown as Record<string, Json>,
        })
      }
      invalidatePool()
    },
  })

  return { initialize, reserve, unreserve }
}

export function useAssignPrinter(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<AssignPrinterInput, 'userId' | 'assignedByUserId'>) =>
      assignPrinter({ ...input, userId, assignedByUserId: appUser?.id ?? '' }),
    onSuccess: async (assigned) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'PRINTER_ASSIGNED',
          entityType: 'printer_assignments',
          entityId: assigned.id,
          newValues: assigned as unknown as Record<string, Json>,
          metadata: { user_id: userId, printer_id: assigned.printer_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'current-printer', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'printer-history', userId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-printers'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useReturnPrinter(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ReturnPrinterInput, 'returnedByUserId'>) =>
      returnPrinter({ ...input, returnedByUserId: appUser?.id ?? '' }),
    onSuccess: async (_data, variables) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'PRINTER_RETURNED',
          entityType: 'printer_assignments',
          entityId: variables.assignmentId,
          metadata: { user_id: userId, printer_id: variables.printerId },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'current-printer', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'printer-history', userId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-printers'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useReplacePrinter(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ReplacePrinterInput, 'userId' | 'assignedByUserId'>) =>
      replacePrinter({ ...input, userId, assignedByUserId: appUser?.id ?? '' }),
    onSuccess: async (assigned) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'PRINTER_REASSIGNED',
          entityType: 'printer_assignments',
          entityId: assigned.id,
          newValues: assigned as unknown as Record<string, Json>,
          metadata: { user_id: userId, printer_id: assigned.printer_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'current-printer', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'printer-history', userId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-printers'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useCreatePrinter() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: CreatePrinterInput) => createPrinter(input),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'PRINTER_CREATED',
          entityType: 'printers',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
          metadata: { asset_id: created.asset_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-printers'] })
    },
  })
}

export function useAssignApplication(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<AssignApplicationInput, 'userId'>) =>
      assignApplication({ ...input, userId }),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'APPLICATION_ASSIGNED',
          entityType: 'user_applications',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
          metadata: { user_id: userId, application_id: created.application_id },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'applications', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useUpdateUserApplication(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (vars: { userAppId: string; previous: UserApplicationData; input: UpdateUserApplicationInput }) =>
      updateUserApplication(vars.userAppId, vars.input),
    onSuccess: async (updated, vars) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'APPLICATION_UPDATED',
          entityType: 'user_applications',
          entityId: updated.id,
          oldValues: vars.previous as unknown as Record<string, Json>,
          newValues: updated as unknown as Record<string, Json>,
          metadata: { user_id: userId },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'applications', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: CreateApplicationInput) => createApplication(input),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'APPLICATION_CREATED',
          entityType: 'applications',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
          metadata: { name: created.name },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['catalog', 'all-applications'] })
    },
  })
}

function invalidateIpPhoneQueries(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  queryClient.invalidateQueries({ queryKey: ['users', 'current-ip-phone', userId] })
  queryClient.invalidateQueries({ queryKey: ['users', 'ip-phone-history', userId] })
  queryClient.invalidateQueries({ queryKey: ['catalog', 'available-ip-phones'] })
  queryClient.invalidateQueries({ queryKey: ['catalog', 'ip-phone-directory'] })
  queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
}

export function useAssignIpPhone(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<AssignIpPhoneInput, 'userId' | 'assignedByUserId'>) =>
      assignIpPhone({ ...input, userId, assignedByUserId: appUser?.id ?? '' }),
    onSuccess: async (assigned) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_PHONE_ASSIGNED',
          entityType: 'ip_phone_assignments',
          entityId: assigned.id,
          newValues: assigned as unknown as Record<string, Json>,
          metadata: { user_id: userId, ip_phone_id: assigned.ip_phone_id },
        })
      }
      invalidateIpPhoneQueries(queryClient, userId)
    },
  })
}

export function useReleaseIpPhone(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ReleaseIpPhoneInput, 'releasedByUserId'>) =>
      releaseIpPhone({ ...input, releasedByUserId: appUser?.id ?? '' }),
    onSuccess: async (released) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_PHONE_RELEASED',
          entityType: 'ip_phone_assignments',
          entityId: released.id,
          metadata: { user_id: userId, ip_phone_id: released.ip_phone_id },
        })
      }
      invalidateIpPhoneQueries(queryClient, userId)
    },
  })
}

export function useReassignIpPhone(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ReassignIpPhoneInput, 'userId' | 'assignedByUserId'>) =>
      reassignIpPhone({ ...input, userId, assignedByUserId: appUser?.id ?? '' }),
    onSuccess: async (assigned) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_PHONE_REASSIGNED',
          entityType: 'ip_phone_assignments',
          entityId: assigned.id,
          newValues: assigned as unknown as Record<string, Json>,
          metadata: { user_id: userId, ip_phone_id: assigned.ip_phone_id },
        })
      }
      invalidateIpPhoneQueries(queryClient, userId)
    },
  })
}

export function useCreateIpPhone() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: CreateIpPhoneInput) => createIpPhone(input),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_PHONE_CREATED',
          entityType: 'ip_phones',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
          metadata: { extension: created.extension },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['catalog', 'available-ip-phones'] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'ip-phone-directory'] })
    },
  })
}

export function useIpPhoneConflictActions() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['catalog', 'available-ip-phones'] })
    queryClient.invalidateQueries({ queryKey: ['catalog', 'ip-phone-directory'] })
  }

  const flag = useMutation({
    mutationFn: (input: FlagIpPhoneConflictInput) => flagIpPhoneConflict(input),
    onSuccess: async (updated) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_PHONE_CONFLICT_FLAGGED',
          entityType: 'ip_phones',
          entityId: updated.id,
          metadata: { extension: updated.extension },
        })
      }
      invalidate()
    },
  })

  const clear = useMutation({
    mutationFn: (ipPhoneId: string) => clearIpPhoneConflict(ipPhoneId),
    onSuccess: async (updated) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'IP_PHONE_CONFLICT_CLEARED',
          entityType: 'ip_phones',
          entityId: updated.id,
          metadata: { extension: updated.extension },
        })
      }
      invalidate()
    },
  })

  return { flag, clear }
}

export function useRemoveApplication(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    // The full row is passed in (not just its id) because user_applications has no
    // status/history column — the audit log's oldValues is the only surviving
    // record of what this revoked assignment actually was.
    mutationFn: (item: UserApplicationData) => removeUserApplication(item.id),
    onSuccess: async (_data, item) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'APPLICATION_REMOVED',
          entityType: 'user_applications',
          entityId: item.id,
          oldValues: item as unknown as Record<string, Json>,
          metadata: { user_id: userId, application_name: item.application.name },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'applications', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useCreateUserLicense(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<CreateUserLicenseInput, 'userId'>) => createUserLicense({ ...input, userId }),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'LICENSE_CREATED',
          entityType: 'user_licenses',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
          metadata: { user_id: userId, license_name: created.license_name },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'licenses', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useUpdateUserLicense(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (vars: { licenseId: string; previous: UserLicenseWithRenewals; input: UpdateUserLicenseInput }) =>
      updateUserLicense(vars.licenseId, vars.input),
    onSuccess: async (updated, vars) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'LICENSE_UPDATED',
          entityType: 'user_licenses',
          entityId: updated.id,
          oldValues: vars.previous as unknown as Record<string, Json>,
          newValues: updated as unknown as Record<string, Json>,
          metadata: { user_id: userId },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'licenses', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}

export function useRenewLicense(userId: string) {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<RenewLicenseInput, 'userId' | 'renewedByUserId'>) =>
      renewLicense({ ...input, userId, renewedByUserId: appUser?.id ?? '' }),
    onSuccess: async (result) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'LICENSE_RENEWED',
          entityType: 'license_renewals',
          entityId: result.renewal.id,
          newValues: result.renewal as unknown as Record<string, Json>,
          metadata: {
            user_id: userId,
            user_license_id: result.license.id,
            previous_expiry_date: result.renewal.previous_expiry_date,
            new_expiry_date: result.renewal.new_expiry_date,
          },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'licenses', userId] })
      queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs', userId] })
    },
  })
}
