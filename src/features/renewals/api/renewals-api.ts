import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

export type LicenseStatus = Database['public']['Enums']['license_status_enum']

export interface LicenseRenewalListItem {
  id: string
  license_name: string
  license_type: string | null
  status: LicenseStatus
  expiry_date: string | null
  auto_renew: boolean
  user_id: string
  requester: { full_name: string; employee_id: string | null } | null
}

export interface RenewalsFilters {
  status?: LicenseStatus
  search?: string
}

/**
 * Org-wide view of every employee's account license. RLS already scopes
 * this to what the caller may see (IT Administrator: all; everyone else:
 * only their own row, via the self-row branch of user_licenses_select) —
 * the route this powers is additionally restricted to IT Administrator
 * (see router) since that is the only role for which this view is
 * meaningfully org-wide, matching the actual database policy rather than
 * showing General Manager/Admin a page that would silently render empty.
 */
export async function getAllLicenses(filters: RenewalsFilters): Promise<LicenseRenewalListItem[]> {
  let query = supabase
    .from('user_licenses')
    .select(`
      id, license_name, license_type, status, expiry_date, auto_renew, user_id,
      requester:users!user_licenses_user_id_fkey(full_name, employee_id)
    `)
    .order('expiry_date', { ascending: true, nullsFirst: false })

  if (filters.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw error

  const rows = (data ?? []) as unknown as LicenseRenewalListItem[]
  const q = filters.search?.trim().toLowerCase()
  if (!q) return rows
  return rows.filter(
    (row) =>
      row.license_name.toLowerCase().includes(q) ||
      row.requester?.full_name.toLowerCase().includes(q) ||
      row.requester?.employee_id?.toLowerCase().includes(q),
  )
}
