import { useQuery } from '@tanstack/react-query'
import {
  getDepartments,
  getDesignations,
  getUserDetailById,
  searchManagerCandidates,
  searchUsers,
} from '../api/users-api'
import type { UserSearchParams } from '../types'

export function useUsersSearch(params: UserSearchParams) {
  return useQuery({
    queryKey: ['users', 'search', params],
    queryFn: () => searchUsers(params),
    placeholderData: (previous) => previous,
  })
}

export function useUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: () => getUserDetailById(userId!),
    enabled: Boolean(userId),
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: 5 * 60_000,
  })
}

export function useDesignations() {
  return useQuery({
    queryKey: ['designations'],
    queryFn: getDesignations,
    staleTime: 5 * 60_000,
  })
}

export function useManagerCandidates(query: string, excludeUserId?: string) {
  return useQuery({
    queryKey: ['users', 'manager-candidates', query, excludeUserId],
    queryFn: () => searchManagerCandidates(query, excludeUserId),
  })
}
