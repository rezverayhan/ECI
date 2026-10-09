import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

export type SystemConfigurationRow = Database['public']['Tables']['system_configuration']['Row']
export type SystemConfigurationUpdate = Database['public']['Tables']['system_configuration']['Update']

export const DEFAULT_SYSTEM_CONFIGURATION: SystemConfigurationRow = {
  id: 'default',
  app_name: 'ECI User Management',
  maintenance_mode: false,
  maintenance_message: null,
  max_booking_advance_days: 30,
  max_booking_duration_hours: 8,
  support_auto_acknowledge: false,
  support_ticket_prefix: 'ECI-IT',
  updated_at: new Date().toISOString(),
  updated_by: null,
}

export interface SystemConfigQueryResult {
  config: SystemConfigurationRow
  isPendingMigration: boolean
}

function isMissingTableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const code = (err as { code?: string })?.code
  const message = (err as { message?: string })?.message || ''
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('relation "public.system_configuration" does not exist') ||
    message.includes('relation "system_configuration" does not exist')
  )
}

export async function getSystemConfiguration(): Promise<SystemConfigQueryResult> {
  const { data, error } = await supabase
    .from('system_configuration')
    .select('*')
    .eq('id', 'default')
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error)) {
      return { config: DEFAULT_SYSTEM_CONFIGURATION, isPendingMigration: true }
    }
    throw error
  }

  return {
    config: data ?? DEFAULT_SYSTEM_CONFIGURATION,
    isPendingMigration: false,
  }
}

export async function updateSystemConfiguration(
  input: SystemConfigurationUpdate,
  userId: string,
): Promise<SystemConfigurationRow> {
  const payload = {
    ...input,
    id: 'default',
    updated_by: userId,
  }

  const { data, error } = await supabase
    .from('system_configuration')
    .upsert(payload)
    .select('*')
    .single()

  if (error) {
    if (isMissingTableError(error)) {
      throw new Error(
        'Database migration 0047 has not been applied yet. Run migration 0047 in Supabase to enable persistent settings.',
      )
    }
    throw error
  }

  return data
}
