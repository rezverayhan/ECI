import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type {
  SearchedUser,
  UserInsert,
  UserRow,
  UserSearchParams,
  UserUpdate,
} from '../types'

export async function searchUsers(
  params: UserSearchParams,
): Promise<{ rows: SearchedUser[]; totalCount: number }> {
  const offset = (params.page - 1) * params.pageSize

  const { data, error } = await supabase.rpc('search_users', {
    p_query: params.query || undefined,
    p_department_id: params.departmentId ?? undefined,
    p_designation_id: params.designationId ?? undefined,
    p_employment_status: params.employmentStatus ?? undefined,
    p_manager_id: params.managerId ?? undefined,
    p_limit: params.pageSize,
    p_offset: offset,
    p_sort_by: params.sortBy,
    p_sort_dir: params.sortDir,
  })

  if (error) throw error

  const rows = data ?? []
  const totalCount = rows[0]?.total_count ?? 0
  return { rows, totalCount }
}

export async function searchManagerCandidates(
  query: string,
  excludeUserId?: string,
): Promise<SearchedUser[]> {
  const { data, error } = await supabase.rpc('search_users', {
    p_query: query || undefined,
    p_limit: 10,
    p_offset: 0,
  })
  if (error) throw error
  return (data ?? []).filter((u) => u.id !== excludeUserId)
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export interface UserDetail extends UserRow {
  department_name: string | null
  designation_name: string | null
  manager_name: string | null
}

export async function getUserDetailById(id: string): Promise<UserDetail | null> {
  const { data, error } = await supabase
    .from('users')
    .select(
      '*, department:departments(name), designation:designations(name), manager:manager_id(full_name)',
    )
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const { department, designation, manager, ...rest } = data as typeof data & {
    department: { name: string } | null
    designation: { name: string } | null
    manager: { full_name: string } | null
  }

  return {
    ...rest,
    department_name: department?.name ?? null,
    designation_name: designation?.name ?? null,
    manager_name: manager?.full_name ?? null,
  }
}

export async function getDepartments() {
  const { data, error } = await supabase.from('departments').select('*').order('name')
  if (error) throw error
  return data
}

export async function getDesignations() {
  const { data, error } = await supabase.from('designations').select('*').order('name')
  if (error) throw error
  return data
}

export async function createUser(input: UserInsert): Promise<UserRow> {
  const { data, error } = await supabase.from('users').insert(input).select('*').single()
  if (error) throw error
  return data
}

export interface ProvisionAccountResult {
  success: boolean
  alreadyLinked?: boolean
}

/** Creates (or reuses) the Supabase Auth account for an employee whose public.users
 *  row has no auth_user_id yet, and emails them a secure account-setup link. See
 *  the admin-provision-user-account edge function for the full authorization and
 *  linking logic — this never touches auth.users directly from the client. */
export async function provisionUserAccount(employeeId: string): Promise<ProvisionAccountResult> {
  const { data, error } = await supabase.functions.invoke<ProvisionAccountResult & { error?: string }>(
    'admin-provision-user-account',
    { body: { employeeId } },
  )
  if (error) {
    // supabase-js collapses every non-2xx response into `error` (a FunctionsHttpError)
    // and leaves `data` null — the function's own {error: "..."} JSON body, which always
    // explains exactly what went wrong (unauthorized, already-provisioned, Auth Admin API
    // failure, etc.), was previously discarded here in favor of one generic message no
    // matter the real cause. Unwrap the underlying Response and surface its actual reason.
    let message = 'Unable to provision the login account. Please try again.'
    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json()
        if (typeof body?.error === 'string') message = body.error
      } catch {
        // Non-JSON error response (e.g. a gateway failure) — keep the generic message.
      }
    }
    throw new Error(message)
  }
  if (!data?.success) throw new Error(data?.error ?? 'Unable to provision the login account.')
  return data
}

export async function updateUser(id: string, input: UserUpdate): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update(input)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}
