import { supabase } from '@/lib/supabase/client'

export interface EmployeeCounts {
  active: number
  inactive: number
}

/**
 * Org-wide headcount. Only meaningful for IT Administrator — users_select
 * RLS only grants full-table visibility to that role, so this is never
 * called from a General User/Admin/General Manager dashboard context.
 */
export async function getEmployeeCounts(): Promise<EmployeeCounts> {
  const [activeRes, inactiveRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('employment_status', 'active'),
    supabase.from('users').select('id', { count: 'exact', head: true }).neq('employment_status', 'active'),
  ])
  if (activeRes.error) throw activeRes.error
  if (inactiveRes.error) throw inactiveRes.error
  return { active: activeRes.count ?? 0, inactive: inactiveRes.count ?? 0 }
}
