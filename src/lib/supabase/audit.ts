import { supabase } from './client'
import type { Json } from './database.types'

interface LogAuditEventInput {
  actorUserId: string
  action: string
  entityType: string
  entityId?: string
  oldValues?: Record<string, Json> | null
  newValues?: Record<string, Json> | null
  metadata?: Record<string, Json> | null
}

/**
 * Best-effort audit write. The RLS policy on audit_logs only allows IT
 * Administrators to insert, and only with actor_user_id = themselves — so
 * this is only ever called from IT-Administrator-driven mutations. A
 * failure here is logged but never blocks or rolls back the action that
 * already succeeded; losing one audit entry shouldn't fail the user's task.
 */
export async function logAuditEvent(input: LogAuditEventInput): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    old_values: input.oldValues ?? null,
    new_values: input.newValues ?? null,
    metadata: input.metadata ?? null,
  })

  if (error) {
    console.error('Failed to write audit log', input.action, error)
  }
}
