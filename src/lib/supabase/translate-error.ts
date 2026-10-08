import type { PostgrestError } from '@supabase/supabase-js'

const UNIQUE_CONSTRAINT_MESSAGES: Record<string, string> = {
  users_employee_id_key: 'Employee ID already exists.',
  users_user_id_key: 'User ID already exists.',
  users_official_email_key: 'This email address is already in use.',
}

/**
 * Never surface a raw Postgrest/Postgres error to the UI (Content
 * Guidelines §25-26, Stage 6 §19/§35). Recognized constraint violations get
 * a specific message; everything else gets a calm generic fallback.
 */
export function translateSupabaseError(
  error: PostgrestError,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error.code === '23505') {
    for (const [constraint, message] of Object.entries(UNIQUE_CONSTRAINT_MESSAGES)) {
      if (error.message.includes(constraint)) return message
    }
    return 'This record already exists.'
  }

  if (error.code === '42501') {
    return 'You do not have permission to perform this action.'
  }

  return fallback
}
