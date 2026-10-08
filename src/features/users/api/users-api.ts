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
