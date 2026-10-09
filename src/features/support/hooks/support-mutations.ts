import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/context/auth-context'
import { logAuditEvent } from '@/lib/supabase/audit'
import type { Json } from '@/lib/supabase/database.types'
import {
  createSupportIssueForUser,
  type CreateSupportIssueInput,
} from '@/features/users/api/user-details-api'
import {
  acknowledgeIssue,
  addInternalNote,
  assignIssue,
  closeIssue,
  deleteSupportAttachment,
  holdIssue,
  resolveIssue,
  startIssue,
  uploadSupportAttachment,
  type UploadAttachmentInput,
} from '../api/support-api'

function invalidateIssueQueries(queryClient: ReturnType<typeof useQueryClient>, issueId: string) {
  queryClient.invalidateQueries({ queryKey: ['support', 'issue', issueId] })
  queryClient.invalidateQueries({ queryKey: ['support', 'timeline', issueId] })
  queryClient.invalidateQueries({ queryKey: ['support', 'queue'] })
  queryClient.invalidateQueries({ queryKey: ['users', 'support-issues'] })
  queryClient.invalidateQueries({ queryKey: ['users', 'audit-logs'] })
}

export function useCreateSupportIssueAsAdmin() {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (input: CreateSupportIssueInput) => createSupportIssueForUser(input),
    onSuccess: async (created) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_CREATED',
          entityType: 'support_issues',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
          metadata: {
            issue_number: created.issue_number,
            requester_id: created.user_id,
            creator_id: appUser.id,
          },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['support', 'queue'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'support-issues', created.user_id] })
    },
  })
}

export function useAcknowledgeIssue() {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (issueId: string) => acknowledgeIssue(issueId, appUser?.id ?? ''),
    onSuccess: async ({ issue }) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_ACKNOWLEDGED',
          entityType: 'support_issues',
          entityId: issue.id,
          newValues: issue as unknown as Record<string, Json>,
          metadata: { issue_number: issue.issue_number },
        })
      }
      invalidateIssueQueries(queryClient, issue.id)
    },
  })
}

export function useStartIssue() {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (issueId: string) => startIssue(issueId, appUser?.id ?? ''),
    onSuccess: async ({ issue }) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_STATUS_CHANGED',
          entityType: 'support_issues',
          entityId: issue.id,
          newValues: issue as unknown as Record<string, Json>,
          metadata: { issue_number: issue.issue_number, new_status: 'in_progress' },
        })
      }
      invalidateIssueQueries(queryClient, issue.id)
    },
  })
}

export function useHoldIssue() {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (vars: { issueId: string; reason: string }) =>
      holdIssue(vars.issueId, appUser?.id ?? '', vars.reason),
    onSuccess: async ({ issue }) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_STATUS_CHANGED',
          entityType: 'support_issues',
          entityId: issue.id,
          newValues: issue as unknown as Record<string, Json>,
          metadata: { issue_number: issue.issue_number, new_status: 'waiting_on_hold' },
        })
      }
      invalidateIssueQueries(queryClient, issue.id)
    },
  })
}

export function useResolveIssue() {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (vars: { issueId: string; resolution: string }) =>
      resolveIssue(vars.issueId, appUser?.id ?? '', vars.resolution),
    onSuccess: async ({ issue }) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_RESOLVED',
          entityType: 'support_issues',
          entityId: issue.id,
          newValues: issue as unknown as Record<string, Json>,
          metadata: { issue_number: issue.issue_number },
        })
      }
      invalidateIssueQueries(queryClient, issue.id)
    },
  })
}

export function useCloseIssue() {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (issueId: string) => closeIssue(issueId, appUser?.id ?? ''),
    onSuccess: async ({ issue }) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_CLOSED',
          entityType: 'support_issues',
          entityId: issue.id,
          newValues: issue as unknown as Record<string, Json>,
          metadata: { issue_number: issue.issue_number },
        })
      }
      invalidateIssueQueries(queryClient, issue.id)
    },
  })
}

export function useAssignIssue() {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (vars: { issueId: string; assignedTo: string | null }) =>
      assignIssue(vars.issueId, appUser?.id ?? '', vars.assignedTo),
    onSuccess: async ({ issue }, vars) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_ASSIGNED',
          entityType: 'support_issues',
          entityId: issue.id,
          metadata: { issue_number: issue.issue_number, assigned_to: vars.assignedTo ?? null },
        })
      }
      invalidateIssueQueries(queryClient, issue.id)
    },
  })
}

export function useAddInternalNote(issueId: string) {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (comment: string) => addInternalNote(issueId, appUser?.id ?? '', comment),
    onSuccess: async (update) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_UPDATED',
          entityType: 'support_issue_updates',
          entityId: update.id,
          metadata: { issue_id: issueId },
        })
      }
      invalidateIssueQueries(queryClient, issueId)
    },
  })
}

export function useUploadAttachment(issueId: string) {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (file: File) =>
      uploadSupportAttachment({ issueId, file, uploadedBy: appUser?.id ?? '' } satisfies UploadAttachmentInput),
    onSuccess: async (attachment) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_ATTACHMENT_ADDED',
          entityType: 'support_issue_attachments',
          entityId: attachment.id,
          metadata: { issue_id: issueId, file_name: attachment.file_name },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['support', 'attachments', issueId] })
    },
  })
}

export function useDeleteAttachment(issueId: string) {
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  return useMutation({
    mutationFn: (vars: { attachmentId: string; storagePath: string; fileName: string }) =>
      deleteSupportAttachment(vars.attachmentId, vars.storagePath),
    onSuccess: async (_data, vars) => {
      if (appUser && isItAdmin) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'ISSUE_ATTACHMENT_REMOVED',
          entityType: 'support_issue_attachments',
          entityId: vars.attachmentId,
          metadata: { issue_id: issueId, file_name: vars.fileName },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['support', 'attachments', issueId] })
    },
  })
}
