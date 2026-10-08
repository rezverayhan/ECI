import type { Database } from '@/lib/supabase/database.types'

export type AppUser = Database['public']['Tables']['users']['Row']
export type AccessLevel = Database['public']['Enums']['access_level_enum']
