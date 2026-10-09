import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

export type NotificationPreferencesRow = Database['public']['Tables']['notification_preferences']['Row']
export type NotificationPreferencesUpdate = Database['public']['Tables']['notification_preferences']['Update']

export interface NotificationPreferencesQueryResult {
  preferences: NotificationPreferencesRow
  isPendingMigration: boolean
}

export function getDefaultPreferences(userId: string): NotificationPreferencesRow {
  return {
    id: 'default',
    user_id: userId,
    notify_support: true,
    notify_bookings: true,
    push_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function isMissingTableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const code = (err as { code?: string })?.code
  const message = (err as { message?: string })?.message || ''
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('relation "public.notification_preferences" does not exist') ||
    message.includes('relation "notification_preferences" does not exist')
  )
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferencesQueryResult> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error)) {
      return { preferences: getDefaultPreferences(userId), isPendingMigration: true }
    }
    throw error
  }

  return {
    preferences: data ?? getDefaultPreferences(userId),
    isPendingMigration: false,
  }
}

export async function updateNotificationPreferences(
  input: NotificationPreferencesUpdate,
  userId: string,
): Promise<NotificationPreferencesRow> {
  const payload = {
    ...input,
    user_id: userId,
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) {
    if (isMissingTableError(error)) {
      throw new Error(
        'Database migration 0047 has not been applied yet. Run migration 0047 in Supabase to enable persistent preferences.',
      )
    }
    throw error
  }

  return data
}
