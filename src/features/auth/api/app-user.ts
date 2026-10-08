import { supabase } from '@/lib/supabase/client'
import type { AppUser } from '../types'

/**
 * Fetches the application-level profile for the signed-in Supabase Auth
 * user. RLS only ever returns a row here when the account is active and not
 * soft-deleted (see current_user_id() / users_select policy) — a
 * deactivated or resigned account resolves to `null` exactly like one that
 * was never provisioned, which is the correct, fail-closed behavior.
 */
export async function fetchAppUser(authUserId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}
