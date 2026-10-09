import type { UserDetail } from '../../api/users-api'
import type {
  MachineProfileRow,
  UserApplicationData,
  UserCurrentDeviceData,
  UserCurrentIpPhoneData,
  UserCurrentNetworkData,
  UserCurrentPrinterData,
  UserDeviceHistoryEntry,
  DeviceServiceRecordRow,
  UserLicenseWithRenewals,
  UserSupportIssueData,
  UserAuditLogEntry,
} from '../../api/user-details-api'

export interface Employee360Data {
  user: UserDetail
  machine: MachineProfileRow | null | undefined
  currentDevice: UserCurrentDeviceData | null | undefined
  currentNetwork: UserCurrentNetworkData | null | undefined
  currentIpPhone: UserCurrentIpPhoneData | null | undefined
  currentPrinter: UserCurrentPrinterData | null | undefined
  deviceHistory: UserDeviceHistoryEntry[]
  serviceHistory: DeviceServiceRecordRow[]
  applications: UserApplicationData[]
  supportIssues: UserSupportIssueData[]
  licenses: UserLicenseWithRenewals[]
  auditLogs: UserAuditLogEntry[]
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  } catch {
    return `$${amount}`
  }
}

export const DEVICE_REPLACEMENT_REASONS = [
  'Routine Lifecycle Upgrade',
  'Hardware Defect / Repair Needed',
  'Role Change / Dept Transfer',
  'Employee Departure / Resignation',
  'Temporary Loan Return',
  'Asset Decommissioned / Retired',
  'Other Operational Reason',
] as const

export const DEVICE_RETIREMENT_REASONS = [
  'End of Lifecycle / Obsolete',
  'Beyond Economical Repair',
  'Physical Damage / Hardware Failure',
  'Lost or Stolen Asset',
  'Decommissioned / Asset Surplus',
  'Other Operational Reason',
] as const

export const PRINTER_RETIREMENT_REASONS = [
  'End of Lifecycle / Obsolete',
  'Beyond Economical Repair',
  'Physical Damage / Hardware Failure',
  'Lost or Stolen Asset',
  'Decommissioned / Asset Surplus',
  'Other Operational Reason',
] as const

export interface NavSectionItem {
  id: string
  label: string
}

export const NAV_SECTIONS: NavSectionItem[] = [
  { id: 'sec-employee', label: 'Employee' },
  { id: 'sec-machine-network', label: 'Machine & Network' },
  { id: 'sec-device', label: 'Device' },
  { id: 'sec-ip-phone', label: 'IP Phone' },
  { id: 'sec-printer', label: 'Printer' },
  { id: 'sec-warranty', label: 'Warranty' },
  { id: 'sec-device-history', label: 'Device History' },
  { id: 'sec-ip-phone-history', label: 'Phone History' },
  { id: 'sec-printer-history', label: 'Printer History' },
  { id: 'sec-service-history', label: 'Service History' },
  { id: 'sec-applications', label: 'Applications' },
  { id: 'sec-support', label: 'IT Support' },
  { id: 'sec-account', label: 'Account & License' },
  { id: 'sec-security', label: 'Security' },
]
