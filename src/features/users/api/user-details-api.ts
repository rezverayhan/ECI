import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

export type DeviceTypeEnum = Database['public']['Enums']['device_type_enum']
export type AssetStatusEnum = Database['public']['Enums']['asset_status_enum']
export type ServiceTypeEnum = Database['public']['Enums']['service_type_enum']
export type ServiceStatusEnum = Database['public']['Enums']['service_status_enum']
export type SupportCategoryEnum = Database['public']['Enums']['support_category_enum']
export type SupportPriorityEnum = Database['public']['Enums']['support_priority_enum']
export type SupportStatusEnum = Database['public']['Enums']['support_status_enum']
export type LicenseStatusEnum = Database['public']['Enums']['license_status_enum']
export type IpPhoneStatusEnum = Database['public']['Enums']['ip_phone_status_enum']

export type MachineProfileRow = Database['public']['Tables']['machine_profiles']['Row']
export type DeviceRow = Database['public']['Tables']['devices']['Row']
export type DeviceAssignmentRow = Database['public']['Tables']['device_assignments']['Row']
export type DeviceServiceRecordRow = Database['public']['Tables']['device_service_records']['Row']
export type PrinterRow = Database['public']['Tables']['printers']['Row']
export type PrinterAssignmentRow = Database['public']['Tables']['printer_assignments']['Row']
export type IpAddressRow = Database['public']['Tables']['ip_addresses']['Row']
export type IpAssignmentRow = Database['public']['Tables']['ip_assignments']['Row']
export type IpPhoneRow = Database['public']['Tables']['ip_phones']['Row']
export type IpPhoneAssignmentRow = Database['public']['Tables']['ip_phone_assignments']['Row']
export type ApplicationRow = Database['public']['Tables']['applications']['Row']
export type UserApplicationRow = Database['public']['Tables']['user_applications']['Row']
export type UserLicenseRow = Database['public']['Tables']['user_licenses']['Row']
export type LicenseRenewalRow = Database['public']['Tables']['license_renewals']['Row']
export type SupportIssueRow = Database['public']['Tables']['support_issues']['Row']
export type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']

export interface UserCurrentDeviceData {
  id: string
  device_id: string
  assigned_at: string
  returned_at: string | null
  assignment_status: string
  notes: string | null
  device: {
    id: string
    device_type: DeviceTypeEnum
    brand: string | null
    model: string
    serial_number: string | null
    asset_id: string
    purchase_date: string | null
    purchase_price: number | null
    warranty_duration_months: number | null
    warranty_start_date: string | null
    warranty_end_date: string | null
    status: AssetStatusEnum
    notes: string | null
    purchased_by: string | null
    buyer?: { full_name: string } | null
  }
}

export interface UserCurrentNetworkData {
  id: string
  ip_address_id: string
  assigned_at: string
  released_at: string | null
  assignment_status: string
  notes: string | null
  ip_address: {
    id: string
    ip_address: unknown
    status: string
    notes: string | null
  }
}

export interface UserCurrentIpPhoneData {
  id: string
  ip_phone_id: string
  assigned_at: string
  released_at: string | null
  assignment_status: string
  notes: string | null
  ip_phone: {
    id: string
    extension: string
    phone_type: string | null
    status: string
    notes: string | null
    department?: { name: string } | null
  }
}

export interface UserCurrentPrinterData {
  id: string
  printer_id: string
  assigned_at: string
  returned_at: string | null
  assignment_status: string
  notes: string | null
  printer: {
    id: string
    printer_name: string
    brand: string | null
    model: string | null
    serial_number: string | null
    asset_id: string
    printer_type: string | null
    purchase_date: string | null
    warranty_start_date: string | null
    warranty_end_date: string | null
    status: AssetStatusEnum
    notes: string | null
  }
}

export interface UserDeviceHistoryEntry {
  id: string
  device_id: string
  assigned_at: string
  returned_at: string | null
  assignment_status: string
  replacement_reason: string | null
  notes: string | null
  device: {
    id: string
    device_type: DeviceTypeEnum
    brand: string | null
    model: string
    serial_number: string | null
    asset_id: string
    status: AssetStatusEnum
  }
  assigned_by_user?: { full_name: string } | null
  returned_by_user?: { full_name: string } | null
}

export interface UserApplicationData {
  id: string
  version: string | null
  license_type: string | null
  license_status: string | null
  assigned_date: string | null
  renewal_date: string | null
  notes: string | null
  application: {
    id: string
    name: string
    vendor: string | null
    description: string | null
    is_active: boolean
  }
}

export interface UserSupportIssueData {
  id: string
  issue_number: string
  title: string
  category: SupportCategoryEnum
  description: string | null
  priority: SupportPriorityEnum
  status: SupportStatusEnum
  submitted_at: string
  acknowledged_at: string | null
  started_at: string | null
  resolved_at: string | null
  closed_at: string | null
  resolution: string | null
  assigned_to: string | null
  assignee?: { full_name: string } | null
}

export interface UserLicenseWithRenewals {
  id: string
  license_name: string
  license_type: string | null
  status: LicenseStatusEnum
  start_date: string | null
  expiry_date: string | null
  auto_renew: boolean
  notes: string | null
  renewals: {
    id: string
    previous_expiry_date: string | null
    renewed_on: string
    new_expiry_date: string
    notes: string | null
    renewer?: { full_name: string } | null
  }[]
}

export interface UserAuditLogEntry {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  created_at: string
  actor_user_id: string | null
  actor?: { full_name: string } | null
}

/* ==========================================================================
   Queries
   ========================================================================== */

export async function getUserMachineProfile(userId: string): Promise<MachineProfileRow | null> {
  const { data, error } = await supabase
    .from('machine_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getUserCurrentDevice(userId: string): Promise<UserCurrentDeviceData | null> {
  const { data, error } = await supabase
    .from('device_assignments')
    .select(`
      id,
      device_id,
      assigned_at,
      returned_at,
      assignment_status,
      notes,
      device:devices(
        id,
        device_type,
        brand,
        model,
        serial_number,
        asset_id,
        purchase_date,
        purchase_price,
        warranty_duration_months,
        warranty_start_date,
        warranty_end_date,
        status,
        notes,
        purchased_by,
        buyer:users!devices_purchased_by_fkey(full_name)
      )
    `)
    .eq('user_id', userId)
    .eq('assignment_status', 'active')
    .maybeSingle()

  if (error) throw error
  if (!data || !data.device) return null
  return data as unknown as UserCurrentDeviceData
}

export async function getUserCurrentNetwork(userId: string): Promise<UserCurrentNetworkData | null> {
  const { data, error } = await supabase
    .from('ip_assignments')
    .select(`
      id,
      ip_address_id,
      assigned_at,
      released_at,
      assignment_status,
      notes,
      ip_address:ip_addresses(
        id,
        ip_address,
        status,
        notes
      )
    `)
    .eq('user_id', userId)
    .eq('assignment_status', 'active')
    .maybeSingle()

  if (error) throw error
  if (!data || !data.ip_address) return null
  return data as unknown as UserCurrentNetworkData
}

export async function getUserCurrentIpPhone(userId: string): Promise<UserCurrentIpPhoneData | null> {
  const { data, error } = await supabase
    .from('ip_phone_assignments')
    .select(`
      id,
      ip_phone_id,
      assigned_at,
      released_at,
      assignment_status,
      notes,
      ip_phone:ip_phones(
        id,
        extension,
        phone_type,
        status,
        notes,
        department:departments(name)
      )
    `)
    .eq('user_id', userId)
    .eq('assignment_status', 'active')
    .maybeSingle()

  if (error) throw error
  if (!data || !data.ip_phone) return null
  return data as unknown as UserCurrentIpPhoneData
}

export async function getUserCurrentPrinter(userId: string): Promise<UserCurrentPrinterData | null> {
  const { data, error } = await supabase
    .from('printer_assignments')
    .select(`
      id,
      printer_id,
      assigned_at,
      returned_at,
      assignment_status,
      notes,
      printer:printers(
        id,
        printer_name,
        brand,
        model,
        serial_number,
        asset_id,
        printer_type,
        purchase_date,
        warranty_start_date,
        warranty_end_date,
        status,
        notes
      )
    `)
    .eq('user_id', userId)
    .eq('assignment_status', 'active')
    .maybeSingle()

  if (error) throw error
  if (!data || !data.printer) return null
  return data as unknown as UserCurrentPrinterData
}

export async function getUserDeviceHistory(userId: string): Promise<UserDeviceHistoryEntry[]> {
  const { data, error } = await supabase
    .from('device_assignments')
    .select(`
      id,
      device_id,
      assigned_at,
      returned_at,
      assignment_status,
      replacement_reason,
      notes,
      device:devices(
        id,
        device_type,
        brand,
        model,
        serial_number,
        asset_id,
        status
      ),
      assigned_by_user:users!device_assignments_assigned_by_fkey(full_name),
      returned_by_user:users!device_assignments_returned_by_fkey(full_name)
    `)
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as UserDeviceHistoryEntry[]
}

export async function getUserDeviceServiceHistory(deviceId?: string | null): Promise<DeviceServiceRecordRow[]> {
  if (!deviceId) return []
  const { data, error } = await supabase
    .from('device_service_records')
    .select('*')
    .eq('device_id', deviceId)
    .order('service_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getUserApplications(userId: string): Promise<UserApplicationData[]> {
  const { data, error } = await supabase
    .from('user_applications')
    .select(`
      id,
      version,
      license_type,
      license_status,
      assigned_date,
      renewal_date,
      notes,
      application:applications(
        id,
        name,
        vendor,
        description,
        is_active
      )
    `)
    .eq('user_id', userId)
    .order('assigned_date', { ascending: false, nullsFirst: false })

  if (error) throw error
  return (data ?? []) as unknown as UserApplicationData[]
}

export async function getUserSupportIssues(userId: string): Promise<UserSupportIssueData[]> {
  const { data, error } = await supabase
    .from('support_issues')
    .select(`
      id,
      issue_number,
      title,
      category,
      description,
      priority,
      status,
      submitted_at,
      acknowledged_at,
      started_at,
      resolved_at,
      closed_at,
      resolution,
      assigned_to,
      assignee:users!support_issues_assigned_to_fkey(full_name)
    `)
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as UserSupportIssueData[]
}

export async function getUserLicenses(userId: string): Promise<UserLicenseWithRenewals[]> {
  const { data, error } = await supabase
    .from('user_licenses')
    .select(`
      id,
      license_name,
      license_type,
      status,
      start_date,
      expiry_date,
      auto_renew,
      notes,
      renewals:license_renewals(
        id,
        previous_expiry_date,
        renewed_on,
        new_expiry_date,
        notes,
        renewer:users!license_renewals_renewed_by_fkey(full_name)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as UserLicenseWithRenewals[]
}

export async function getUserAuditLogs(userId: string): Promise<UserAuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      created_at,
      actor_user_id,
      actor:users!audit_logs_actor_user_id_fkey(full_name)
    `)
    .or(`entity_id.eq.${userId},actor_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    // If not authorized (non-admin) or error, fail quietly with empty list
    return []
  }
  return (data ?? []) as unknown as UserAuditLogEntry[]
}

/* ==========================================================================
   Reference Catalog Helpers (for modal assignment pickers)
   ========================================================================== */

export async function getAvailableDevices(): Promise<DeviceRow[]> {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('status', 'available')
    .is('deleted_at', null)
    .order('model')
  if (error) throw error
  return data ?? []
}

export async function getAvailableIpAddresses(): Promise<IpAddressRow[]> {
  const { data, error } = await supabase
    .from('ip_addresses')
    .select('*')
    .eq('status', 'free')
    .order('ip_address')
  if (error) throw error
  return data ?? []
}

export async function getAvailablePrinters(): Promise<PrinterRow[]> {
  const { data, error } = await supabase
    .from('printers')
    .select('*')
    .eq('status', 'available')
    .is('deleted_at', null)
    .order('printer_name')
  if (error) throw error
  return data ?? []
}

export async function getAllApplications(): Promise<ApplicationRow[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

/* ==========================================================================
   Mutations
   ========================================================================== */

export interface CreateSupportIssueInput {
  userId: string
  title: string
  category: SupportCategoryEnum
  priority: SupportPriorityEnum
  description?: string | null
}

export async function createSupportIssueForUser(input: CreateSupportIssueInput): Promise<SupportIssueRow> {
  const { data, error } = await supabase
    .from('support_issues')
    .insert({
      user_id: input.userId,
      title: input.title,
      category: input.category,
      priority: input.priority,
      description: input.description ?? null,
      status: 'submitted',
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface SaveMachineProfileInput {
  userId: string
  machineName: string
  operatingSystem?: string | null
  status?: string
  notes?: string | null
}

export async function saveMachineProfile(input: SaveMachineProfileInput): Promise<MachineProfileRow> {
  const { data, error } = await supabase
    .from('machine_profiles')
    .upsert(
      {
        user_id: input.userId,
        machine_name: input.machineName,
        operating_system: input.operatingSystem ?? null,
        status: input.status ?? 'active',
        notes: input.notes ?? null,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface AssignDeviceInput {
  userId: string
  deviceId: string
  assignedByUserId: string
  notes?: string | null
}

export async function assignDevice(input: AssignDeviceInput) {
  // Conditional update (status must still be 'available') makes this atomic at the
  // database level: a concurrent assign of the same device loses this race safely
  // instead of silently reassigning a device that is already in use or under service.
  const { data: claimedDevice, error: deviceError } = await supabase
    .from('devices')
    .update({ status: 'assigned' })
    .eq('id', input.deviceId)
    .eq('status', 'available')
    .select('id')
    .maybeSingle()
  if (deviceError) throw deviceError
  if (!claimedDevice) {
    throw new Error('This device is no longer available for assignment.')
  }

  const { data, error: assignError } = await supabase
    .from('device_assignments')
    .insert({
      user_id: input.userId,
      device_id: input.deviceId,
      assigned_by: input.assignedByUserId,
      assignment_status: 'active',
      notes: input.notes ?? null,
    })
    .select('*')
    .single()

  if (assignError) {
    // Roll back the status claim — e.g. this employee already has an active
    // assignment (unique-active-per-user) and the insert was rejected.
    await supabase.from('devices').update({ status: 'available' }).eq('id', input.deviceId)
    throw assignError
  }

  return data
}

export interface ReplaceDeviceInput {
  oldAssignmentId: string
  oldDeviceId: string
  newDeviceId: string
  userId: string
  assignedByUserId: string
  replacementReason: string
  notes?: string | null
}

export async function replaceDevice(input: ReplaceDeviceInput) {
  // 1. Close the current assignment (must still be active — defends against a stale page).
  const { data: closedAssignment, error: closeError } = await supabase
    .from('device_assignments')
    .update({
      assignment_status: 'ended',
      returned_at: new Date().toISOString(),
      returned_by: input.assignedByUserId,
      replacement_reason: input.replacementReason,
      notes: input.notes ?? null,
    })
    .eq('id', input.oldAssignmentId)
    .eq('assignment_status', 'active')
    .select('id')
    .maybeSingle()
  if (closeError) throw closeError
  if (!closedAssignment) {
    throw new Error('This device assignment is no longer active. Refresh and try again.')
  }

  // 2. Free the old device. Machine identity and IP assignment are never touched here.
  const { error: freeError } = await supabase
    .from('devices')
    .update({ status: 'available' })
    .eq('id', input.oldDeviceId)
  if (freeError) throw freeError

  // 3. Assign the replacement through the same safe, conditional path.
  return assignDevice({
    userId: input.userId,
    deviceId: input.newDeviceId,
    assignedByUserId: input.assignedByUserId,
    notes: input.notes ?? null,
  })
}

export interface CreateDeviceInput {
  deviceType: DeviceTypeEnum
  brand?: string | null
  model: string
  serialNumber?: string | null
  assetId: string
  purchaseDate?: string | null
  purchasedBy?: string | null
  purchasePrice?: number | null
  warrantyDurationMonths?: number | null
  warrantyStartDate?: string | null
  warrantyEndDate?: string | null
  notes?: string | null
}

export async function createDevice(input: CreateDeviceInput): Promise<DeviceRow> {
  const { data, error } = await supabase
    .from('devices')
    .insert({
      device_type: input.deviceType,
      brand: input.brand?.trim() || null,
      model: input.model.trim(),
      serial_number: input.serialNumber?.trim() || null,
      asset_id: input.assetId.trim(),
      purchase_date: input.purchaseDate || null,
      purchased_by: input.purchasedBy || null,
      purchase_price: input.purchasePrice ?? null,
      warranty_duration_months: input.warrantyDurationMonths ?? null,
      warranty_start_date: input.warrantyStartDate || null,
      warranty_end_date: input.warrantyEndDate || null,
      status: 'available',
      notes: input.notes?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface CreateServiceRecordInput {
  deviceId: string
  serviceDate: string
  serviceType: ServiceTypeEnum
  problem?: string | null
  description?: string | null
  provider?: string | null
  serviceCenter?: string | null
  technician?: string | null
  warrantyCovered?: boolean | null
  cost?: number | null
  status: ServiceStatusEnum
  resolution?: string | null
  completedDate?: string | null
  notes?: string | null
  createdBy: string
}

export async function createDeviceServiceRecord(
  input: CreateServiceRecordInput,
): Promise<DeviceServiceRecordRow> {
  const { data, error } = await supabase
    .from('device_service_records')
    .insert({
      device_id: input.deviceId,
      service_date: input.serviceDate,
      service_type: input.serviceType,
      problem: input.problem?.trim() || null,
      description: input.description?.trim() || null,
      provider: input.provider?.trim() || null,
      service_center: input.serviceCenter?.trim() || null,
      technician: input.technician?.trim() || null,
      warranty_covered: input.warrantyCovered ?? null,
      cost: input.cost ?? null,
      status: input.status,
      resolution: input.resolution?.trim() || null,
      completed_date: input.completedDate || null,
      notes: input.notes?.trim() || null,
      created_by: input.createdBy,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface ReturnDeviceInput {
  assignmentId: string
  deviceId: string
  returnedByUserId: string
  replacementReason?: string | null
  notes?: string | null
}

export async function returnDevice(input: ReturnDeviceInput) {
  // 1. Update assignment to ended
  const { error: assignError } = await supabase
    .from('device_assignments')
    .update({
      assignment_status: 'ended',
      returned_at: new Date().toISOString(),
      returned_by: input.returnedByUserId,
      replacement_reason: input.replacementReason ?? null,
      notes: input.notes ?? null,
    })
    .eq('id', input.assignmentId)
  if (assignError) throw assignError

  // 2. Update device status to available
  const { error: deviceError } = await supabase
    .from('devices')
    .update({ status: 'available' })
    .eq('id', input.deviceId)
  if (deviceError) throw deviceError
}

export interface AssignIpInput {
  userId: string
  ipAddressId: string
  assignedByUserId: string
  notes?: string | null
}

export async function assignIpAddress(input: AssignIpInput) {
  // Conditional update (status must still be 'free') — same atomic claim pattern as
  // assignDevice(): a concurrent assign of the same IP loses this race safely, and a
  // reserved/unavailable IP can never be claimed through the normal assignment path.
  const { data: claimedIp, error: ipError } = await supabase
    .from('ip_addresses')
    .update({ status: 'assigned' })
    .eq('id', input.ipAddressId)
    .eq('status', 'free')
    .select('id')
    .maybeSingle()
  if (ipError) throw ipError
  if (!claimedIp) {
    throw new Error('This IP address is no longer free for assignment.')
  }

  const { data, error: assignError } = await supabase
    .from('ip_assignments')
    .insert({
      user_id: input.userId,
      ip_address_id: input.ipAddressId,
      assigned_by: input.assignedByUserId,
      assignment_status: 'active',
      notes: input.notes ?? null,
    })
    .select('*')
    .single()

  if (assignError) {
    // Roll back the status claim — e.g. this employee already has an active IP
    // (unique-active-per-user) and the insert was rejected.
    await supabase.from('ip_addresses').update({ status: 'free' }).eq('id', input.ipAddressId)
    throw assignError
  }

  return data
}

export interface ReassignIpInput {
  oldAssignmentId: string
  oldIpAddressId: string
  newIpAddressId: string
  userId: string
  assignedByUserId: string
  notes?: string | null
}

export async function reassignIpAddress(input: ReassignIpInput) {
  // 1. Close the current assignment (must still be active).
  const { data: closedAssignment, error: closeError } = await supabase
    .from('ip_assignments')
    .update({
      assignment_status: 'ended',
      released_at: new Date().toISOString(),
      released_by: input.assignedByUserId,
      notes: input.notes ?? null,
    })
    .eq('id', input.oldAssignmentId)
    .eq('assignment_status', 'active')
    .select('id')
    .maybeSingle()
  if (closeError) throw closeError
  if (!closedAssignment) {
    throw new Error('This IP assignment is no longer active. Refresh and try again.')
  }

  // 2. Free the old IP. Machine identity, device, and IP phone are never touched here.
  const { error: freeError } = await supabase
    .from('ip_addresses')
    .update({ status: 'free' })
    .eq('id', input.oldIpAddressId)
  if (freeError) throw freeError

  // 3. Claim the replacement through the same safe, conditional path.
  return assignIpAddress({
    userId: input.userId,
    ipAddressId: input.newIpAddressId,
    assignedByUserId: input.assignedByUserId,
    notes: input.notes ?? null,
  })
}

export interface ReleaseIpInput {
  assignmentId: string
  ipAddressId: string
  releasedByUserId: string
}

export async function releaseIpAddress(input: ReleaseIpInput) {
  const { data: closedAssignment, error: assignError } = await supabase
    .from('ip_assignments')
    .update({
      assignment_status: 'ended',
      released_at: new Date().toISOString(),
      released_by: input.releasedByUserId,
    })
    .eq('id', input.assignmentId)
    .eq('assignment_status', 'active')
    .select('id')
    .maybeSingle()
  if (assignError) throw assignError
  if (!closedAssignment) {
    throw new Error('This IP assignment is no longer active. Refresh and try again.')
  }

  const { error: ipError } = await supabase
    .from('ip_addresses')
    .update({ status: 'free' })
    .eq('id', input.ipAddressId)
  if (ipError) throw ipError
}

/* ==========================================================================
   IP Pool (IT-admin operational surface — reachable from Assign/Change IP)
   ========================================================================== */

export interface IpPoolRow {
  id: string
  ip_address: string
  status: string
  notes: string | null
  reserved_for: string | null
  reserved_user_name: string | null
  assigned_user_id: string | null
  assigned_user_name: string | null
  assigned_employee_id: string | null
  assigned_department: string | null
  assigned_at: string | null
}

export async function getIpPool(): Promise<IpPoolRow[]> {
  const [addressesRes, assignmentsRes] = await Promise.all([
    supabase
      .from('ip_addresses')
      .select('id, ip_address, status, notes, reserved_for, reserved_user:reserved_for(full_name)')
      .order('ip_address'),
    supabase
      .from('ip_assignments')
      .select(`
        ip_address_id,
        assigned_at,
        user:users(id, full_name, employee_id, department:departments(name))
      `)
      .eq('assignment_status', 'active'),
  ])

  if (addressesRes.error) throw addressesRes.error
  if (assignmentsRes.error) throw assignmentsRes.error

  type ActiveRow = {
    ip_address_id: string
    assigned_at: string
    user: { id: string; full_name: string; employee_id: string | null; department: { name: string } | null } | null
  }
  const activeByIp = new Map<string, ActiveRow>()
  for (const row of (assignmentsRes.data ?? []) as unknown as ActiveRow[]) {
    activeByIp.set(row.ip_address_id, row)
  }

  return (addressesRes.data ?? []).map((row) => {
    const addr = row as unknown as {
      id: string
      ip_address: unknown
      status: string
      notes: string | null
      reserved_for: string | null
      reserved_user: { full_name: string } | null
    }
    const active = activeByIp.get(addr.id)
    return {
      id: addr.id,
      ip_address: String(addr.ip_address),
      status: addr.status,
      notes: addr.notes,
      reserved_for: addr.reserved_for,
      reserved_user_name: addr.reserved_user?.full_name ?? null,
      assigned_user_id: active?.user?.id ?? null,
      assigned_user_name: active?.user?.full_name ?? null,
      assigned_employee_id: active?.user?.employee_id ?? null,
      assigned_department: active?.user?.department?.name ?? null,
      assigned_at: active?.assigned_at ?? null,
    }
  })
}

const ECI_IP_RANGE_FIRST_HOST = 1
const ECI_IP_RANGE_LAST_HOST = 254

export interface InitializeIpRangeResult {
  created: number
  alreadyExisted: number
  total: number
}

/** Idempotent: only inserts IPs in the approved range that do not already exist. Never touches existing rows. */
export async function initializeIpRange(): Promise<InitializeIpRangeResult> {
  const candidates: string[] = []
  for (let host = ECI_IP_RANGE_FIRST_HOST; host <= ECI_IP_RANGE_LAST_HOST; host++) {
    candidates.push(`10.200.198.${host}`)
  }

  // Fetch all addresses and filter client-side: PostgREST's containment operator
  // direction ("does this /32 host contain the /24 network") is the wrong way round
  // for this check, and the pool is small enough (<=255 rows) that this is cheap.
  const { data: existing, error: existingError } = await supabase
    .from('ip_addresses')
    .select('ip_address')
  if (existingError) throw existingError

  const candidateSet = new Set(candidates)
  const existingInRange = new Set(
    (existing ?? []).map((r) => String(r.ip_address)).filter((ip) => candidateSet.has(ip)),
  )
  const missing = candidates.filter((ip) => !existingInRange.has(ip))

  if (missing.length > 0) {
    const { error: insertError } = await supabase
      .from('ip_addresses')
      .insert(missing.map((ip) => ({ ip_address: ip, status: 'free' as const })))
    if (insertError) throw insertError
  }

  return {
    created: missing.length,
    alreadyExisted: existingInRange.size,
    total: candidates.length,
  }
}

export interface ReserveIpInput {
  ipAddressId: string
  reservedFor: string
  notes?: string | null
}

export async function reserveIpAddress(input: ReserveIpInput) {
  const { data, error } = await supabase
    .from('ip_addresses')
    .update({ status: 'reserved', reserved_for: input.reservedFor, notes: input.notes ?? null })
    .eq('id', input.ipAddressId)
    .eq('status', 'free')
    .select('*')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Only a free IP address can be reserved.')
  return data
}

export async function unreserveIpAddress(ipAddressId: string) {
  const { data, error } = await supabase
    .from('ip_addresses')
    .update({ status: 'free', reserved_for: null })
    .eq('id', ipAddressId)
    .eq('status', 'reserved')
    .select('*')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Only a reserved IP address can be unreserved.')
  return data
}

export interface AssignPrinterInput {
  userId: string
  printerId: string
  assignedByUserId: string
  notes?: string | null
}

export async function assignPrinter(input: AssignPrinterInput) {
  // Conditional claim (status must still be 'available') — same atomic guard as
  // assignDevice(): a concurrent assign loses this race safely, and a retired or
  // under-service printer can never be claimed through the normal assignment path.
  const { data: claimedPrinter, error: printerError } = await supabase
    .from('printers')
    .update({ status: 'assigned' })
    .eq('id', input.printerId)
    .eq('status', 'available')
    .select('id')
    .maybeSingle()
  if (printerError) throw printerError
  if (!claimedPrinter) {
    throw new Error('This printer is no longer available for assignment.')
  }

  const { data, error: assignError } = await supabase
    .from('printer_assignments')
    .insert({
      user_id: input.userId,
      printer_id: input.printerId,
      assigned_by: input.assignedByUserId,
      assignment_status: 'active',
      notes: input.notes ?? null,
    })
    .select('*')
    .single()

  if (assignError) {
    // Roll back the status claim — e.g. this employee already has an active
    // printer (unique-active-per-user) and the insert was rejected.
    await supabase.from('printers').update({ status: 'available' }).eq('id', input.printerId)
    throw assignError
  }

  return data
}

export interface ReplacePrinterInput {
  oldAssignmentId: string
  oldPrinterId: string
  newPrinterId: string
  userId: string
  assignedByUserId: string
  notes?: string | null
}

export async function replacePrinter(input: ReplacePrinterInput) {
  // 1. Close the current assignment (must still be active).
  const { data: closedAssignment, error: closeError } = await supabase
    .from('printer_assignments')
    .update({
      assignment_status: 'ended',
      returned_at: new Date().toISOString(),
      returned_by: input.assignedByUserId,
      notes: input.notes ?? null,
    })
    .eq('id', input.oldAssignmentId)
    .eq('assignment_status', 'active')
    .select('id')
    .maybeSingle()
  if (closeError) throw closeError
  if (!closedAssignment) {
    throw new Error('This printer assignment is no longer active. Refresh and try again.')
  }

  // 2. Free the old printer.
  const { error: freeError } = await supabase
    .from('printers')
    .update({ status: 'available' })
    .eq('id', input.oldPrinterId)
  if (freeError) throw freeError

  // 3. Claim the replacement through the same safe, conditional path.
  return assignPrinter({
    userId: input.userId,
    printerId: input.newPrinterId,
    assignedByUserId: input.assignedByUserId,
    notes: input.notes ?? null,
  })
}

export interface CreatePrinterInput {
  printerName: string
  brand?: string | null
  model?: string | null
  serialNumber?: string | null
  assetId: string
  printerType?: string | null
  purchaseDate?: string | null
  purchasedBy?: string | null
  purchasePrice?: number | null
  warrantyDurationMonths?: number | null
  warrantyStartDate?: string | null
  warrantyEndDate?: string | null
  notes?: string | null
}

export async function createPrinter(input: CreatePrinterInput): Promise<PrinterRow> {
  const { data, error } = await supabase
    .from('printers')
    .insert({
      printer_name: input.printerName.trim(),
      brand: input.brand?.trim() || null,
      model: input.model?.trim() || null,
      serial_number: input.serialNumber?.trim() || null,
      asset_id: input.assetId.trim(),
      printer_type: input.printerType?.trim() || null,
      purchase_date: input.purchaseDate || null,
      purchased_by: input.purchasedBy || null,
      purchase_price: input.purchasePrice ?? null,
      warranty_duration_months: input.warrantyDurationMonths ?? null,
      warranty_start_date: input.warrantyStartDate || null,
      warranty_end_date: input.warrantyEndDate || null,
      status: 'available',
      notes: input.notes?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface UserPrinterHistoryEntry {
  id: string
  printer_id: string
  assigned_at: string
  returned_at: string | null
  assignment_status: string
  notes: string | null
  printer: {
    id: string
    printer_name: string
    brand: string | null
    model: string | null
    asset_id: string
    serial_number: string | null
    status: AssetStatusEnum
  }
  assigned_by_user?: { full_name: string } | null
  returned_by_user?: { full_name: string } | null
}

export async function getUserPrinterHistory(userId: string): Promise<UserPrinterHistoryEntry[]> {
  const { data, error } = await supabase
    .from('printer_assignments')
    .select(`
      id,
      printer_id,
      assigned_at,
      returned_at,
      assignment_status,
      notes,
      printer:printers(id, printer_name, brand, model, asset_id, serial_number, status),
      assigned_by_user:users!printer_assignments_assigned_by_fkey(full_name),
      returned_by_user:users!printer_assignments_returned_by_fkey(full_name)
    `)
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as UserPrinterHistoryEntry[]
}

export interface ReturnPrinterInput {
  assignmentId: string
  printerId: string
  returnedByUserId: string
}

export async function returnPrinter(input: ReturnPrinterInput) {
  const { data: closedAssignment, error: assignError } = await supabase
    .from('printer_assignments')
    .update({
      assignment_status: 'ended',
      returned_at: new Date().toISOString(),
      returned_by: input.returnedByUserId,
    })
    .eq('id', input.assignmentId)
    .eq('assignment_status', 'active')
    .select('id')
    .maybeSingle()
  if (assignError) throw assignError
  if (!closedAssignment) {
    throw new Error('This printer assignment is no longer active. Refresh and try again.')
  }

  const { error: printerError } = await supabase
    .from('printers')
    .update({ status: 'available' })
    .eq('id', input.printerId)
  if (printerError) throw printerError
}

export interface AssignApplicationInput {
  userId: string
  applicationId: string
  version?: string | null
  licenseType?: string | null
  licenseStatus?: string | null
  assignedDate?: string | null
  renewalDate?: string | null
  notes?: string | null
}

export async function assignApplication(input: AssignApplicationInput): Promise<UserApplicationRow> {
  const { data, error } = await supabase
    .from('user_applications')
    .insert({
      user_id: input.userId,
      application_id: input.applicationId,
      version: input.version ?? null,
      license_type: input.licenseType ?? null,
      license_status: input.licenseStatus ?? null,
      // "Today" is a real, true default for when access was granted — not fabricated data.
      assigned_date: input.assignedDate ?? new Date().toISOString().split('T')[0],
      renewal_date: input.renewalDate ?? null,
      notes: input.notes ?? null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface UpdateUserApplicationInput {
  version?: string | null
  licenseType?: string | null
  licenseStatus?: string | null
  renewalDate?: string | null
  notes?: string | null
}

export async function updateUserApplication(
  userAppId: string,
  input: UpdateUserApplicationInput,
): Promise<UserApplicationRow> {
  const { data, error } = await supabase
    .from('user_applications')
    .update({
      version: input.version ?? null,
      license_type: input.licenseType ?? null,
      license_status: input.licenseStatus ?? null,
      renewal_date: input.renewalDate ?? null,
      notes: input.notes ?? null,
    })
    .eq('id', userAppId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function removeUserApplication(userAppId: string): Promise<void> {
  const { error } = await supabase.from('user_applications').delete().eq('id', userAppId)
  if (error) throw error
}

export interface CreateApplicationInput {
  name: string
  vendor?: string | null
  description?: string | null
}

export async function createApplication(input: CreateApplicationInput): Promise<ApplicationRow> {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      name: input.name.trim(),
      vendor: input.vendor?.trim() || null,
      description: input.description?.trim() || null,
      is_active: true,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

/* ==========================================================================
   Account & License Lifecycle (distinct from Applications & Software above —
   user_licenses/license_renewals represent the user's own account-level
   license, never the per-application seat tracked in user_applications)
   ========================================================================== */

export interface CreateUserLicenseInput {
  userId: string
  licenseName: string
  licenseType?: string | null
  status: LicenseStatusEnum
  startDate?: string | null
  expiryDate?: string | null
  autoRenew: boolean
  notes?: string | null
}

export async function createUserLicense(input: CreateUserLicenseInput): Promise<UserLicenseRow> {
  const { data, error } = await supabase
    .from('user_licenses')
    .insert({
      user_id: input.userId,
      license_name: input.licenseName.trim(),
      license_type: input.licenseType?.trim() || null,
      status: input.status,
      start_date: input.startDate || null,
      expiry_date: input.expiryDate || null,
      auto_renew: input.autoRenew,
      notes: input.notes?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface UpdateUserLicenseInput {
  licenseName?: string
  licenseType?: string | null
  status?: LicenseStatusEnum
  startDate?: string | null
  expiryDate?: string | null
  autoRenew?: boolean
  notes?: string | null
}

export async function updateUserLicense(
  licenseId: string,
  input: UpdateUserLicenseInput,
): Promise<UserLicenseRow> {
  const { data, error } = await supabase
    .from('user_licenses')
    .update({
      ...(input.licenseName !== undefined ? { license_name: input.licenseName.trim() } : {}),
      ...(input.licenseType !== undefined ? { license_type: input.licenseType?.trim() || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.startDate !== undefined ? { start_date: input.startDate || null } : {}),
      ...(input.expiryDate !== undefined ? { expiry_date: input.expiryDate || null } : {}),
      ...(input.autoRenew !== undefined ? { auto_renew: input.autoRenew } : {}),
      ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
    })
    .eq('id', licenseId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface RenewLicenseInput {
  userLicenseId: string
  userId: string
  newExpiryDate: string
  renewedByUserId: string
  notes?: string | null
}

export interface RenewLicenseResult {
  license: UserLicenseRow
  renewal: LicenseRenewalRow
}

export async function renewLicense(input: RenewLicenseInput): Promise<RenewLicenseResult> {
  // 1. Read the current expiry date — the real "previous" value for history.
  const { data: current, error: readError } = await supabase
    .from('user_licenses')
    .select('expiry_date')
    .eq('id', input.userLicenseId)
    .single()
  if (readError) throw readError

  // 2. Record the renewal event (previous_expiry_date is whatever was really
  // stored, including null if none was ever set — never guessed).
  const { data: renewal, error: renewalError } = await supabase
    .from('license_renewals')
    .insert({
      user_license_id: input.userLicenseId,
      user_id: input.userId,
      previous_expiry_date: current.expiry_date,
      renewed_on: new Date().toISOString().split('T')[0],
      new_expiry_date: input.newExpiryDate,
      renewed_by: input.renewedByUserId,
      notes: input.notes ?? null,
    })
    .select('*')
    .single()
  if (renewalError) throw renewalError

  // 3. Update the current license's expiry date. Status is never auto-derived
  // here — no approved due/upcoming/expired threshold is defined anywhere in
  // the approved docs, so status stays an explicit, IT-admin-set field (see
  // updateUserLicense) rather than a guessed calculation.
  const { data: license, error: updateError } = await supabase
    .from('user_licenses')
    .update({ expiry_date: input.newExpiryDate })
    .eq('id', input.userLicenseId)
    .select('*')
    .single()
  if (updateError) throw updateError

  return { license, renewal }
}

/* ==========================================================================
   IP Phone / Extension Lifecycle
   ========================================================================== */

// ip_phones has no stored "conflict" flag and no dedicated availability status
// (only 'active'/'inactive' hardware state). A known unresolved conflict is
// recorded in the real `notes` column with this marker — never a fabricated
// column — so the extension is excluded from normal assignment until an IT
// Admin clears it, and the reason stays visible/traceable in the catalog.
export const IP_PHONE_CONFLICT_PREFIX = '[CONFLICT — PENDING IT REVIEW]'

export interface UserIpPhoneHistoryEntry {
  id: string
  ip_phone_id: string
  assigned_at: string
  released_at: string | null
  assignment_status: string
  notes: string | null
  ip_phone: {
    id: string
    extension: string
    phone_type: string | null
  }
  assigned_by_user?: { full_name: string } | null
  released_by_user?: { full_name: string } | null
}

export async function getUserIpPhoneHistory(userId: string): Promise<UserIpPhoneHistoryEntry[]> {
  const { data, error } = await supabase
    .from('ip_phone_assignments')
    .select(`
      id,
      ip_phone_id,
      assigned_at,
      released_at,
      assignment_status,
      notes,
      ip_phone:ip_phones(id, extension, phone_type),
      assigned_by_user:users!ip_phone_assignments_assigned_by_fkey(full_name),
      released_by_user:users!ip_phone_assignments_released_by_fkey(full_name)
    `)
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as UserIpPhoneHistoryEntry[]
}

export interface AvailableIpPhone {
  id: string
  extension: string
  phone_type: string | null
  status: IpPhoneStatusEnum
  department: { name: string } | null
}

/** Extensions that are active, have no current assignment, and carry no unresolved conflict marker. */
export async function getAvailableIpPhones(): Promise<AvailableIpPhone[]> {
  const [phonesRes, activeRes] = await Promise.all([
    supabase
      .from('ip_phones')
      .select('id, extension, phone_type, status, notes, department:departments(name)')
      .eq('status', 'active')
      .order('extension'),
    supabase.from('ip_phone_assignments').select('ip_phone_id').eq('assignment_status', 'active'),
  ])

  if (phonesRes.error) throw phonesRes.error
  if (activeRes.error) throw activeRes.error

  const assignedIds = new Set((activeRes.data ?? []).map((r) => r.ip_phone_id))

  return (phonesRes.data ?? [])
    .filter((p) => !assignedIds.has(p.id) && !(p.notes ?? '').startsWith(IP_PHONE_CONFLICT_PREFIX))
    .map((p) => ({
      id: p.id,
      extension: p.extension,
      phone_type: p.phone_type,
      status: p.status,
      department: p.department as unknown as { name: string } | null,
    }))
}

export interface IpPhoneDirectoryRow {
  id: string
  extension: string
  phone_type: string | null
  status: IpPhoneStatusEnum
  department_name: string | null
  assigned_user_name: string | null
  assigned_employee_id: string | null
  assigned_department: string | null
  has_conflict: boolean
}

/** Organization-wide directory. Never includes any IP-address field — none exists on ip_phones. */
export async function getIpPhoneDirectory(): Promise<IpPhoneDirectoryRow[]> {
  const [phonesRes, activeRes] = await Promise.all([
    supabase
      .from('ip_phones')
      .select('id, extension, phone_type, status, notes, department:departments(name)')
      .order('extension'),
    supabase
      .from('ip_phone_assignments')
      .select('ip_phone_id, user:users(full_name, employee_id, department:departments(name))')
      .eq('assignment_status', 'active'),
  ])

  if (phonesRes.error) throw phonesRes.error
  if (activeRes.error) throw activeRes.error

  type ActiveRow = {
    ip_phone_id: string
    user: { full_name: string; employee_id: string | null; department: { name: string } | null } | null
  }
  const activeByPhone = new Map<string, ActiveRow>()
  for (const row of (activeRes.data ?? []) as unknown as ActiveRow[]) {
    activeByPhone.set(row.ip_phone_id, row)
  }

  return (phonesRes.data ?? []).map((p) => {
    const active = activeByPhone.get(p.id)
    return {
      id: p.id,
      extension: p.extension,
      phone_type: p.phone_type,
      status: p.status,
      department_name: (p.department as unknown as { name: string } | null)?.name ?? null,
      assigned_user_name: active?.user?.full_name ?? null,
      assigned_employee_id: active?.user?.employee_id ?? null,
      assigned_department: active?.user?.department?.name ?? null,
      has_conflict: (p.notes ?? '').startsWith(IP_PHONE_CONFLICT_PREFIX),
    }
  })
}

export interface CreateIpPhoneInput {
  extension: string
  phoneType?: string | null
  departmentId?: string | null
  notes?: string | null
}

export async function createIpPhone(input: CreateIpPhoneInput): Promise<IpPhoneRow> {
  const { data, error } = await supabase
    .from('ip_phones')
    .insert({
      extension: input.extension.trim(),
      phone_type: input.phoneType?.trim() || null,
      department_id: input.departmentId || null,
      status: 'active',
      notes: input.notes?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface AssignIpPhoneInput {
  userId: string
  ipPhoneId: string
  assignedByUserId: string
  notes?: string | null
}

export async function assignIpPhone(input: AssignIpPhoneInput) {
  // Conditional guard: the phone must be active, unassigned, and not conflict-flagged —
  // re-checked here server-side, not just trusted from the candidate list the UI showed.
  const { data: phone, error: phoneError } = await supabase
    .from('ip_phones')
    .select('id, status, notes')
    .eq('id', input.ipPhoneId)
    .maybeSingle()
  if (phoneError) throw phoneError
  if (!phone || phone.status !== 'active') {
    throw new Error('This extension is not currently active.')
  }
  if ((phone.notes ?? '').startsWith(IP_PHONE_CONFLICT_PREFIX)) {
    throw new Error('This extension has an unresolved conflict and cannot be assigned until IT clears it.')
  }

  const { data, error: assignError } = await supabase
    .from('ip_phone_assignments')
    .insert({
      user_id: input.userId,
      ip_phone_id: input.ipPhoneId,
      assigned_by: input.assignedByUserId,
      assignment_status: 'active',
      notes: input.notes ?? null,
    })
    .select('*')
    .single()

  // No app-layer "claim" update is needed here (ip_phones has no assigned/available
  // status to flip) — uq_ip_phone_assignments_active_phone is the sole, sufficient
  // race guard: a concurrent assign of the same extension is rejected at insert time.
  if (assignError) throw assignError
  return data
}

export interface ReleaseIpPhoneInput {
  assignmentId: string
  releasedByUserId: string
}

export async function releaseIpPhone(input: ReleaseIpPhoneInput) {
  const { data: closedAssignment, error } = await supabase
    .from('ip_phone_assignments')
    .update({
      assignment_status: 'ended',
      released_at: new Date().toISOString(),
      released_by: input.releasedByUserId,
    })
    .eq('id', input.assignmentId)
    .eq('assignment_status', 'active')
    .select('*')
    .maybeSingle()

  if (error) throw error
  if (!closedAssignment) {
    throw new Error('This extension assignment is no longer active. Refresh and try again.')
  }
  return closedAssignment
}

export interface ReassignIpPhoneInput {
  oldAssignmentId: string
  newIpPhoneId: string
  userId: string
  assignedByUserId: string
  notes?: string | null
}

export async function reassignIpPhone(input: ReassignIpPhoneInput) {
  // 1. Close the current assignment (must still be active).
  const { data: closedAssignment, error: closeError } = await supabase
    .from('ip_phone_assignments')
    .update({
      assignment_status: 'ended',
      released_at: new Date().toISOString(),
      released_by: input.assignedByUserId,
      notes: input.notes ?? null,
    })
    .eq('id', input.oldAssignmentId)
    .eq('assignment_status', 'active')
    .select('id')
    .maybeSingle()
  if (closeError) throw closeError
  if (!closedAssignment) {
    throw new Error('This extension assignment is no longer active. Refresh and try again.')
  }

  // 2. Claim the replacement through the same safe, conditional path.
  // Machine identity, physical device, and IP address are never touched here.
  return assignIpPhone({
    userId: input.userId,
    ipPhoneId: input.newIpPhoneId,
    assignedByUserId: input.assignedByUserId,
    notes: input.notes ?? null,
  })
}

export interface FlagIpPhoneConflictInput {
  ipPhoneId: string
  reason: string
}

/** Marks an extension as conflicted (excluded from normal assignment) without picking a winner. */
export async function flagIpPhoneConflict(input: FlagIpPhoneConflictInput): Promise<IpPhoneRow> {
  const { data, error } = await supabase
    .from('ip_phones')
    .update({ notes: `${IP_PHONE_CONFLICT_PREFIX} ${input.reason}` })
    .eq('id', input.ipPhoneId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

/** Clears a conflict marker once IT has made an explicit decision. Does not itself assign anyone. */
export async function clearIpPhoneConflict(ipPhoneId: string): Promise<IpPhoneRow> {
  const { data, error } = await supabase
    .from('ip_phones')
    .update({ notes: null })
    .eq('id', ipPhoneId)
    .select('*')
    .single()
  if (error) throw error
  return data
}
