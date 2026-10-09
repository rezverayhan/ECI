import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

export type SupportCategoryEnum = Database['public']['Enums']['support_category_enum']
export type SupportPriorityEnum = Database['public']['Enums']['support_priority_enum']
export type SupportStatusEnum = Database['public']['Enums']['support_status_enum']
export type SupportIssueRow = Database['public']['Tables']['support_issues']['Row']
export type SupportIssueUpdateRow = Database['public']['Tables']['support_issue_updates']['Row']
export type SupportIssueAttachmentRow = Database['public']['Tables']['support_issue_attachments']['Row']

export interface SupportQueueRow {
  id: string
  issue_number: string
  title: string
  category: SupportCategoryEnum
  priority: SupportPriorityEnum
  status: SupportStatusEnum
  submitted_at: string
  updated_at: string
  resolved_at: string | null
  closed_at: string | null
  user_id: string
  requester: { full_name: string; employee_id: string | null } | null
  assigned_to: string | null
  assignee: { full_name: string } | null
}

export interface SupportQueueFilters {
  status?: SupportStatusEnum
  priority?: SupportPriorityEnum
  category?: SupportCategoryEnum
  userId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

/** Org-wide queue. RLS already scopes this to what the caller's role may see
 * (IT Admin: all; General Manager: all, read-only; General User: none — they
 * use their own Employee 360 history instead, not this queue). */
export async function getSupportQueue(filters: SupportQueueFilters): Promise<SupportQueueRow[]> {
  let query = supabase
    .from('support_issues')
    .select(`
      id, issue_number, title, category, priority, status, submitted_at, updated_at,
      resolved_at, closed_at, user_id,
      requester:users!support_issues_user_id_fkey(full_name, employee_id),
      assigned_to,
      assignee:users!support_issues_assigned_to_fkey(full_name)
    `)
    .order('submitted_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.priority) query = query.eq('priority', filters.priority)
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.userId) query = query.eq('user_id', filters.userId)
  if (filters.dateFrom) query = query.gte('submitted_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('submitted_at', filters.dateTo)
  if (filters.search?.trim()) {
    const q = filters.search.trim()
    query = query.or(`title.ilike.%${q}%,issue_number.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as SupportQueueRow[]
}

export interface SupportIssueDetail extends SupportIssueRow {
  requester: { full_name: string; employee_id: string | null; official_email: string } | null
  assignee: { full_name: string } | null
}

export async function getSupportIssueDetail(issueId: string): Promise<SupportIssueDetail | null> {
  const { data, error } = await supabase
    .from('support_issues')
    .select(`
      *,
      requester:users!support_issues_user_id_fkey(full_name, employee_id, official_email),
      assignee:users!support_issues_assigned_to_fkey(full_name)
    `)
    .eq('id', issueId)
    .maybeSingle()
  if (error) throw error
  return data as unknown as SupportIssueDetail | null
}

export interface SupportTimelineEntry extends SupportIssueUpdateRow {
  actor: { full_name: string } | null
}

/** RLS (support_issue_updates_select) already excludes is_internal rows for
 * non-admin callers — no client-side filtering needed or trustworthy. */
export async function getSupportIssueTimeline(issueId: string): Promise<SupportTimelineEntry[]> {
  const { data, error } = await supabase
    .from('support_issue_updates')
    .select(`*, actor:users!support_issue_updates_actor_user_id_fkey(full_name)`)
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as SupportTimelineEntry[]
}

export interface SupportAttachment extends SupportIssueAttachmentRow {
  uploader: { full_name: string } | null
}

export async function getSupportIssueAttachments(issueId: string): Promise<SupportAttachment[]> {
  const { data, error } = await supabase
    .from('support_issue_attachments')
    .select(`*, uploader:users!support_issue_attachments_uploaded_by_fkey(full_name)`)
    .eq('issue_id', issueId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as SupportAttachment[]
}

const ATTACHMENT_BUCKET = 'it-support-attachments'

export async function getAttachmentSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(ATTACHMENT_BUCKET).createSignedUrl(storagePath, 300)
  if (error) throw error
  return data.signedUrl
}

export interface UploadAttachmentInput {
  issueId: string
  file: File
  uploadedBy: string
}

export async function uploadSupportAttachment(input: UploadAttachmentInput): Promise<SupportIssueAttachmentRow> {
  const storagePath = `${input.issueId}/${Date.now()}-${input.file.name}`
  const { error: uploadError } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(storagePath, input.file)
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('support_issue_attachments')
    .insert({
      issue_id: input.issueId,
      storage_path: storagePath,
      file_name: input.file.name,
      file_type: input.file.type || null,
      file_size: input.file.size,
      uploaded_by: input.uploadedBy,
    })
    .select('*')
    .single()

  if (error) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([storagePath])
    throw error
  }
  return data
}

export async function deleteSupportAttachment(attachmentId: string, storagePath: string): Promise<void> {
  const { error: storageError } = await supabase.storage.from(ATTACHMENT_BUCKET).remove([storagePath])
  if (storageError) throw storageError
  const { error } = await supabase.from('support_issue_attachments').delete().eq('id', attachmentId)
  if (error) throw error
}

export interface ItAdministrator {
  id: string
  full_name: string
  employee_id: string | null
}

export async function getItAdministrators(): Promise<ItAdministrator[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, employee_id')
    .eq('access_level', 'it_administrator')
    .order('full_name')
  if (error) throw error
  return data ?? []
}

/* ==========================================================================
   Lifecycle transitions
   ========================================================================== */

async function insertTimelineEntry(input: {
  issueId: string
  actorUserId: string
  updateType: string
  oldStatus?: SupportStatusEnum | null
  newStatus?: SupportStatusEnum | null
  comment?: string | null
  isInternal: boolean
}): Promise<SupportIssueUpdateRow> {
  const { data, error } = await supabase
    .from('support_issue_updates')
    .insert({
      issue_id: input.issueId,
      actor_user_id: input.actorUserId,
      update_type: input.updateType,
      old_status: input.oldStatus ?? null,
      new_status: input.newStatus ?? null,
      comment: input.comment ?? null,
      is_internal: input.isInternal,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

async function notifyRecipient(input: {
  recipientUserId: string
  notificationType: string
  title: string
  message: string
  relatedIssueId: string
}): Promise<void> {
  // Best-effort: notifications_insert requires is_it_administrator(), which is
  // true for every caller of these lifecycle functions (see each export below).
  const { error } = await supabase.from('notifications').insert({
    recipient_user_id: input.recipientUserId,
    notification_type: input.notificationType,
    title: input.title,
    message: input.message,
    related_entity_type: 'support_issues',
    related_entity_id: input.relatedIssueId,
  })
  if (error) console.error('Failed to write notification', input.notificationType, error)
}

export interface TransitionResult {
  issue: SupportIssueRow
  update: SupportIssueUpdateRow
}

async function readIssueOrThrow(issueId: string): Promise<SupportIssueRow> {
  const { data, error } = await supabase.from('support_issues').select('*').eq('id', issueId).single()
  if (error) throw error
  return data
}

export async function acknowledgeIssue(issueId: string, actorUserId: string): Promise<TransitionResult> {
  const current = await readIssueOrThrow(issueId)
  if (current.status !== 'submitted') {
    throw new Error(`This issue is already ${current.status.replace('_', ' ')} — it cannot be acknowledged again.`)
  }

  const { data: issue, error } = await supabase
    .from('support_issues')
    .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
    .eq('id', issueId)
    .eq('status', 'submitted')
    .select('*')
    .single()
  if (error) throw error

  const update = await insertTimelineEntry({
    issueId,
    actorUserId,
    updateType: 'status_change',
    oldStatus: 'submitted',
    newStatus: 'acknowledged',
    isInternal: false,
  })

  await notifyRecipient({
    recipientUserId: issue.user_id,
    notificationType: 'SUPPORT_ISSUE_ACKNOWLEDGED',
    title: `Issue ${issue.issue_number} acknowledged`,
    message: `Your IT support request "${issue.title}" has been acknowledged.`,
    relatedIssueId: issueId,
  })

  return { issue, update }
}

export async function startIssue(issueId: string, actorUserId: string): Promise<TransitionResult> {
  const current = await readIssueOrThrow(issueId)
  const allowedFrom: SupportStatusEnum[] = ['submitted', 'acknowledged', 'waiting_on_hold']
  if (!allowedFrom.includes(current.status)) {
    throw new Error(`This issue is ${current.status.replace('_', ' ')} — it cannot be moved to In Progress from this state.`)
  }

  const { data: issue, error } = await supabase
    .from('support_issues')
    .update({
      status: 'in_progress',
      started_at: current.started_at ?? new Date().toISOString(),
    })
    .eq('id', issueId)
    .in('status', allowedFrom)
    .select('*')
    .single()
  if (error) throw error

  const update = await insertTimelineEntry({
    issueId,
    actorUserId,
    updateType: 'status_change',
    oldStatus: current.status,
    newStatus: 'in_progress',
    isInternal: false,
  })

  await notifyRecipient({
    recipientUserId: issue.user_id,
    notificationType: 'SUPPORT_ISSUE_STATUS_CHANGED',
    title: `Issue ${issue.issue_number} is now in progress`,
    message: `IT has started working on "${issue.title}".`,
    relatedIssueId: issueId,
  })

  return { issue, update }
}

export async function holdIssue(issueId: string, actorUserId: string, reason: string): Promise<TransitionResult> {
  if (!reason.trim()) {
    throw new Error('A reason is required to place this issue on hold.')
  }
  const current = await readIssueOrThrow(issueId)
  const allowedFrom: SupportStatusEnum[] = ['acknowledged', 'in_progress']
  if (!allowedFrom.includes(current.status)) {
    throw new Error(`This issue is ${current.status.replace('_', ' ')} — it cannot be placed on hold from this state.`)
  }

  const { data: issue, error } = await supabase
    .from('support_issues')
    .update({ status: 'waiting_on_hold' })
    .eq('id', issueId)
    .in('status', allowedFrom)
    .select('*')
    .single()
  if (error) throw error

  const update = await insertTimelineEntry({
    issueId,
    actorUserId,
    updateType: 'status_change',
    oldStatus: current.status,
    newStatus: 'waiting_on_hold',
    comment: reason.trim(),
    isInternal: false,
  })

  await notifyRecipient({
    recipientUserId: issue.user_id,
    notificationType: 'SUPPORT_ISSUE_STATUS_CHANGED',
    title: `Issue ${issue.issue_number} is waiting / on hold`,
    message: reason.trim(),
    relatedIssueId: issueId,
  })

  return { issue, update }
}

export async function resolveIssue(issueId: string, actorUserId: string, resolution: string): Promise<TransitionResult> {
  if (!resolution.trim()) {
    throw new Error('This issue cannot be resolved until a resolution is provided.')
  }
  const current = await readIssueOrThrow(issueId)
  const allowedFrom: SupportStatusEnum[] = ['submitted', 'acknowledged', 'in_progress', 'waiting_on_hold']
  if (!allowedFrom.includes(current.status)) {
    throw new Error(`This issue is already ${current.status.replace('_', ' ')}.`)
  }

  const { data: issue, error } = await supabase
    .from('support_issues')
    .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolution: resolution.trim() })
    .eq('id', issueId)
    .in('status', allowedFrom)
    .select('*')
    .single()
  if (error) throw error

  const update = await insertTimelineEntry({
    issueId,
    actorUserId,
    updateType: 'status_change',
    oldStatus: current.status,
    newStatus: 'resolved',
    comment: resolution.trim(),
    isInternal: false,
  })

  await notifyRecipient({
    recipientUserId: issue.user_id,
    notificationType: 'SUPPORT_ISSUE_RESOLVED',
    title: `Issue ${issue.issue_number} resolved`,
    message: `Your IT support request "${issue.title}" has been resolved.`,
    relatedIssueId: issueId,
  })

  return { issue, update }
}

export async function closeIssue(issueId: string, actorUserId: string): Promise<TransitionResult> {
  const current = await readIssueOrThrow(issueId)
  if (current.status !== 'resolved') {
    throw new Error('This issue is already closed.')
  }

  const { data: issue, error } = await supabase
    .from('support_issues')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', issueId)
    .eq('status', 'resolved')
    .select('*')
    .single()
  if (error) throw error

  const update = await insertTimelineEntry({
    issueId,
    actorUserId,
    updateType: 'status_change',
    oldStatus: 'resolved',
    newStatus: 'closed',
    isInternal: false,
  })

  await notifyRecipient({
    recipientUserId: issue.user_id,
    notificationType: 'SUPPORT_ISSUE_CLOSED',
    title: `Issue ${issue.issue_number} closed`,
    message: `Your IT support request "${issue.title}" has been closed.`,
    relatedIssueId: issueId,
  })

  return { issue, update }
}

export async function assignIssue(issueId: string, actorUserId: string, assignedTo: string | null): Promise<TransitionResult> {
  const current = await readIssueOrThrow(issueId)
  if (current.status === 'closed') {
    throw new Error('This issue is closed and cannot be reassigned.')
  }

  const { data: issue, error } = await supabase
    .from('support_issues')
    .update({ assigned_to: assignedTo })
    .eq('id', issueId)
    .select('*')
    .single()
  if (error) throw error

  // Assignment mechanics are internal — never shown to the requester.
  const update = await insertTimelineEntry({
    issueId,
    actorUserId,
    updateType: 'assignment',
    comment: assignedTo ? null : 'Assignment cleared',
    isInternal: true,
  })

  if (assignedTo) {
    await notifyRecipient({
      recipientUserId: assignedTo,
      notificationType: 'SUPPORT_ISSUE_ASSIGNED',
      title: `Issue ${issue.issue_number} assigned to you`,
      message: `"${issue.title}" has been assigned to you.`,
      relatedIssueId: issueId,
    })
  }

  return { issue, update }
}

export async function addInternalNote(issueId: string, actorUserId: string, comment: string): Promise<SupportIssueUpdateRow> {
  if (!comment.trim()) {
    throw new Error('Enter a note before saving.')
  }
  return insertTimelineEntry({
    issueId,
    actorUserId,
    updateType: 'note',
    comment: comment.trim(),
    isInternal: true,
  })
}
