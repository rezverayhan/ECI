import type { Database } from '@/lib/supabase/database.types'

export type UserRow = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type Department = Database['public']['Tables']['departments']['Row']
export type Designation = Database['public']['Tables']['designations']['Row']

export type SearchedUser =
  Database['public']['Functions']['search_users']['Returns'][number]

export const SORTABLE_COLUMNS = [
  { value: 'full_name', label: 'Name' },
  { value: 'employee_id', label: 'Employee ID' },
  { value: 'department', label: 'Department' },
  { value: 'status', label: 'Status' },
  { value: 'join_date', label: 'Join Date' },
] as const

export type SortColumn = (typeof SORTABLE_COLUMNS)[number]['value']
export type SortDirection = 'asc' | 'desc'

export interface UserSearchParams {
  query: string
  departmentId: string | null
  designationId: string | null
  employmentStatus: UserRow['employment_status'] | null
  managerId: string | null
  page: number
  pageSize: number
  sortBy: SortColumn
  sortDir: SortDirection
}
