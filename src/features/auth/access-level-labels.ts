import type { AccessLevel } from './types'

// Display labels for the four approved access categories (PRD §4). This is
// presentation only — the access_level_enum value itself is what RLS and
// routing guards actually check.
export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  it_administrator: 'System / IT Administrator',
  general_manager: 'General Manager',
  admin: 'Admin',
  general_user: 'General User',
}
