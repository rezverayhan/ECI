import { useQuery } from '@tanstack/react-query'
import { getAllLicenses, type RenewalsFilters } from '../api/renewals-api'

export function useAllLicenses(filters: RenewalsFilters) {
  return useQuery({
    queryKey: ['renewals', 'licenses', filters],
    queryFn: () => getAllLicenses(filters),
    staleTime: 30_000,
  })
}
