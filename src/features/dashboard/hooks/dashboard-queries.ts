import { useQuery } from '@tanstack/react-query'
import { getEmployeeCounts } from '../api/dashboard-api'

export function useEmployeeCounts(enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'employee-counts'],
    queryFn: getEmployeeCounts,
    enabled,
    staleTime: 60_000,
  })
}
