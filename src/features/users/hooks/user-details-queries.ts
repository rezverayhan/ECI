import { useQuery } from '@tanstack/react-query'
import {
  getAllApplications,
  getAvailableDevices,
  getAvailableIpAddresses,
  getAvailableIpPhones,
  getAvailablePrinters,
  getIpPool,
  getUserApplications,
  getUserAuditLogs,
  getUserCurrentDevice,
  getUserCurrentIpPhone,
  getUserCurrentNetwork,
  getUserCurrentPrinter,
  getUserDeviceHistory,
  getUserDeviceServiceHistory,
  getUserIpPhoneHistory,
  getUserLicenses,
  getUserMachineProfile,
  getUserPrinterHistory,
  getUserSupportIssues,
} from '../api/user-details-api'

export function useUserMachine(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'machine', userId],
    queryFn: () => getUserMachineProfile(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUserCurrentDevice(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'current-device', userId],
    queryFn: () => getUserCurrentDevice(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUserCurrentNetwork(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'current-network', userId],
    queryFn: () => getUserCurrentNetwork(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUserCurrentIpPhone(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'current-ip-phone', userId],
    queryFn: () => getUserCurrentIpPhone(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUserCurrentPrinter(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'current-printer', userId],
    queryFn: () => getUserCurrentPrinter(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUserDeviceHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'device-history', userId],
    queryFn: () => getUserDeviceHistory(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUserDeviceServiceHistory(deviceId: string | undefined | null) {
  return useQuery({
    queryKey: ['devices', 'service-history', deviceId],
    queryFn: () => getUserDeviceServiceHistory(deviceId),
    enabled: Boolean(deviceId),
    staleTime: 60_000,
  })
}

export function useUserApplications(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'applications', userId],
    queryFn: () => getUserApplications(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUserSupportIssues(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'support-issues', userId],
    queryFn: () => getUserSupportIssues(userId!),
    enabled: Boolean(userId),
    staleTime: 30_000,
  })
}

export function useUserLicenses(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'licenses', userId],
    queryFn: () => getUserLicenses(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUserAuditLogs(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'audit-logs', userId],
    queryFn: () => getUserAuditLogs(userId!),
    enabled: Boolean(userId),
    staleTime: 30_000,
  })
}

/* Catalog queries for assignment pickers */
export function useAvailableDevices() {
  return useQuery({
    queryKey: ['catalog', 'available-devices'],
    queryFn: getAvailableDevices,
    staleTime: 30_000,
  })
}

export function useAvailableIpAddresses() {
  return useQuery({
    queryKey: ['catalog', 'available-ips'],
    queryFn: getAvailableIpAddresses,
    staleTime: 30_000,
  })
}

export function useAvailableIpPhones() {
  return useQuery({
    queryKey: ['catalog', 'available-ip-phones'],
    queryFn: getAvailableIpPhones,
    staleTime: 30_000,
  })
}

export function useUserIpPhoneHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'ip-phone-history', userId],
    queryFn: () => getUserIpPhoneHistory(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useUserPrinterHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', 'printer-history', userId],
    queryFn: () => getUserPrinterHistory(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}

export function useIpPool(enabled: boolean) {
  return useQuery({
    queryKey: ['catalog', 'ip-pool'],
    queryFn: getIpPool,
    enabled,
    staleTime: 30_000,
  })
}

export function useAvailablePrinters() {
  return useQuery({
    queryKey: ['catalog', 'available-printers'],
    queryFn: getAvailablePrinters,
    staleTime: 30_000,
  })
}

export function useAllApplications() {
  return useQuery({
    queryKey: ['catalog', 'all-applications'],
    queryFn: getAllApplications,
    staleTime: 60_000,
  })
}
