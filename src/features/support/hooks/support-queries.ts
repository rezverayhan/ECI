import { useQuery } from '@tanstack/react-query'
import {
  getAttachmentSignedUrl,
  getItAdministrators,
  getSupportIssueAttachments,
  getSupportIssueDetail,
  getSupportIssueTimeline,
  getSupportQueue,
  type SupportQueueFilters,
} from '../api/support-api'

export function useSupportQueue(filters: SupportQueueFilters) {
  return useQuery({
    queryKey: ['support', 'queue', filters],
    queryFn: () => getSupportQueue(filters),
    staleTime: 15_000,
  })
}

export function useSupportIssueDetail(issueId: string | undefined) {
  return useQuery({
    queryKey: ['support', 'issue', issueId],
    queryFn: () => getSupportIssueDetail(issueId!),
    enabled: Boolean(issueId),
    staleTime: 15_000,
  })
}

export function useSupportIssueTimeline(issueId: string | undefined) {
  return useQuery({
    queryKey: ['support', 'timeline', issueId],
    queryFn: () => getSupportIssueTimeline(issueId!),
    enabled: Boolean(issueId),
    staleTime: 15_000,
  })
}

export function useSupportIssueAttachments(issueId: string | undefined) {
  return useQuery({
    queryKey: ['support', 'attachments', issueId],
    queryFn: () => getSupportIssueAttachments(issueId!),
    enabled: Boolean(issueId),
    staleTime: 30_000,
  })
}

export function useItAdministrators() {
  return useQuery({
    queryKey: ['support', 'it-administrators'],
    queryFn: getItAdministrators,
    staleTime: 60_000,
  })
}

export function useAttachmentSignedUrl(storagePath: string | null) {
  return useQuery({
    queryKey: ['support', 'attachment-url', storagePath],
    queryFn: () => getAttachmentSignedUrl(storagePath!),
    enabled: Boolean(storagePath),
    staleTime: 0,
  })
}
