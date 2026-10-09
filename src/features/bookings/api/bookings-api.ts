import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

export type BookingStatus = Database['public']['Enums']['booking_status_enum']
export type ResourceStatus = Database['public']['Enums']['resource_status_enum']
export type MeetingRoomRow = Database['public']['Tables']['meeting_rooms']['Row']
export type CarRow = Database['public']['Tables']['cars']['Row']
export type MeetingRoomBookingRow = Database['public']['Tables']['meeting_room_bookings']['Row']
export type CarBookingRow = Database['public']['Tables']['car_bookings']['Row']

/** Exclusion-constraint violation — the authoritative, DB-level overlap guard
 * (not just a frontend pre-check). Both booking tables already carry this. */
const POSTGRES_EXCLUSION_VIOLATION = '23P01'

export class BookingConflictError extends Error {
  constructor() {
    super('This resource is already booked for part of the selected time. Choose another time or resource.')
  }
}

function isExclusionViolation(err: unknown): boolean {
  return Boolean(err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === POSTGRES_EXCLUSION_VIOLATION)
}

/* ==========================================================================
   Resources
   ========================================================================== */

export async function getMeetingRooms(): Promise<MeetingRoomRow[]> {
  const { data, error } = await supabase.from('meeting_rooms').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function getCars(): Promise<CarRow[]> {
  const { data, error } = await supabase.from('cars').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export interface CreateMeetingRoomInput {
  name: string
  location?: string | null
  capacity?: number | null
  description?: string | null
}

// meeting_rooms/cars (the catalog) keep their own direct-write RLS (is_it_administrator()) —
// unlike meeting_room_bookings/car_bookings, migration 0044/0045 never routed these through
// an RPC, so a plain insert/update is the correct, already-supported path.
export async function createMeetingRoom(input: CreateMeetingRoomInput): Promise<MeetingRoomRow> {
  const { data, error } = await supabase
    .from('meeting_rooms')
    .insert({
      name: input.name.trim(),
      location: input.location?.trim() || null,
      capacity: input.capacity ?? null,
      description: input.description?.trim() || null,
      status: 'available',
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateMeetingRoomStatus(id: string, status: ResourceStatus): Promise<MeetingRoomRow> {
  const { data, error } = await supabase
    .from('meeting_rooms')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export interface CreateCarInput {
  name: string
  registrationNumber?: string | null
  model?: string | null
  driverInformation?: string | null
  notes?: string | null
}

export async function createCar(input: CreateCarInput): Promise<CarRow> {
  const { data, error } = await supabase
    .from('cars')
    .insert({
      name: input.name.trim(),
      registration_number: input.registrationNumber?.trim() || null,
      model: input.model?.trim() || null,
      driver_information: input.driverInformation?.trim() || null,
      notes: input.notes?.trim() || null,
      status: 'available',
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCarStatus(id: string, status: ResourceStatus): Promise<CarRow> {
  const { data, error } = await supabase
    .from('cars')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

/* ==========================================================================
   Meeting Room Bookings
   ========================================================================== */

export interface BookingWithRequester {
  id: string
  user_id: string
  start_at: string
  end_at: string
  status: BookingStatus
  admin_action: string | null
  admin_action_reason: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  requester: { full_name: string; employee_id: string | null } | null
}

export interface RoomBookingWithDetails extends BookingWithRequester {
  title: string | null
  purpose: string | null
  room: { id: string; name: string; location: string | null } | null
}

export interface RoomBookingFilters {
  scope: 'mine' | 'all'
  currentUserId: string
  roomId?: string
  status?: BookingStatus
  dateFrom?: string
  dateTo?: string
}

export async function getRoomBookings(filters: RoomBookingFilters): Promise<RoomBookingWithDetails[]> {
  let query = supabase
    .from('meeting_room_bookings')
    .select(`
      id, user_id, start_at, end_at, title, purpose, status,
      admin_action, admin_action_reason, cancelled_at, created_at, updated_at,
      requester:users!meeting_room_bookings_user_id_fkey(full_name, employee_id),
      room:meeting_rooms(id, name, location)
    `)
    .order('start_at', { ascending: false })

  if (filters.scope === 'mine') query = query.eq('user_id', filters.currentUserId)
  if (filters.roomId) query = query.eq('meeting_room_id', filters.roomId)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.dateFrom) query = query.gte('start_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('start_at', filters.dateTo)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as RoomBookingWithDetails[]
}

/** Pre-check only — mirrors the DB exclusion constraint's own filter (status='confirmed')
 * so the UI's "busy" view never disagrees with what the DB will actually enforce. */
export async function getConfirmedRoomBookingsInRange(roomId: string, fromIso: string, toIso: string) {
  const { data, error } = await supabase
    .from('meeting_room_bookings')
    .select('id, start_at, end_at')
    .eq('meeting_room_id', roomId)
    .eq('status', 'confirmed')
    .lt('start_at', toIso)
    .gt('end_at', fromIso)
  if (error) throw error
  return data ?? []
}

export interface CreateRoomBookingInput {
  meetingRoomId: string
  startAt: string
  endAt: string
  title?: string | null
  purpose?: string | null
}

/**
 * Create + audit + notify happen server-side as one atomic call (see
 * migration 0044). The actor is derived from the session inside the RPC —
 * never passed from the client — so this can never write a booking that
 * silently has no audit trail.
 */
export async function createRoomBooking(input: CreateRoomBookingInput): Promise<MeetingRoomBookingRow> {
  const { data, error } = await supabase.rpc('create_room_booking', {
    p_meeting_room_id: input.meetingRoomId,
    p_start_at: input.startAt,
    p_end_at: input.endAt,
    p_title: input.title ?? undefined,
    p_purpose: input.purpose ?? undefined,
  })

  if (error) {
    if (isExclusionViolation(error)) throw new BookingConflictError()
    throw error
  }
  return data
}

export interface AdminActionInput {
  bookingId: string
  reason?: string | null
}

async function applyRoomBookingAdminAction(
  action: 'cancelled' | 'paused' | 'denied',
  input: AdminActionInput,
): Promise<MeetingRoomBookingRow> {
  const { data, error } = await supabase.rpc('set_room_booking_status', {
    p_booking_id: input.bookingId,
    p_action: action,
    p_reason: input.reason ?? undefined,
  })
  if (error) throw error
  return data
}

export const cancelRoomBooking = (input: AdminActionInput) => applyRoomBookingAdminAction('cancelled', input)
export const pauseRoomBooking = (input: AdminActionInput) => applyRoomBookingAdminAction('paused', input)
export const denyRoomBooking = (input: AdminActionInput) => applyRoomBookingAdminAction('denied', input)

/* ==========================================================================
   Car Bookings (mirrors Meeting Room Bookings exactly — same lifecycle)
   ========================================================================== */

export interface CarBookingWithDetails extends BookingWithRequester {
  destination: string | null
  purpose: string | null
  car: { id: string; name: string; registration_number: string | null } | null
}

export interface CarBookingFilters {
  scope: 'mine' | 'all'
  currentUserId: string
  carId?: string
  status?: BookingStatus
  dateFrom?: string
  dateTo?: string
}

export async function getCarBookings(filters: CarBookingFilters): Promise<CarBookingWithDetails[]> {
  let query = supabase
    .from('car_bookings')
    .select(`
      id, user_id, start_at, end_at, destination, purpose, status,
      admin_action, admin_action_reason, cancelled_at, created_at, updated_at,
      requester:users!car_bookings_user_id_fkey(full_name, employee_id),
      car:cars(id, name, registration_number)
    `)
    .order('start_at', { ascending: false })

  if (filters.scope === 'mine') query = query.eq('user_id', filters.currentUserId)
  if (filters.carId) query = query.eq('car_id', filters.carId)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.dateFrom) query = query.gte('start_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('start_at', filters.dateTo)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as CarBookingWithDetails[]
}

export async function getConfirmedCarBookingsInRange(carId: string, fromIso: string, toIso: string) {
  const { data, error } = await supabase
    .from('car_bookings')
    .select('id, start_at, end_at')
    .eq('car_id', carId)
    .eq('status', 'confirmed')
    .lt('start_at', toIso)
    .gt('end_at', fromIso)
  if (error) throw error
  return data ?? []
}

export interface CreateCarBookingInput {
  carId: string
  startAt: string
  endAt: string
  destination?: string | null
  purpose?: string | null
}

/** Same trusted-RPC pattern as createRoomBooking — see migration 0044. */
export async function createCarBooking(input: CreateCarBookingInput): Promise<CarBookingRow> {
  const { data, error } = await supabase.rpc('create_car_booking', {
    p_car_id: input.carId,
    p_start_at: input.startAt,
    p_end_at: input.endAt,
    p_destination: input.destination ?? undefined,
    p_purpose: input.purpose ?? undefined,
  })

  if (error) {
    if (isExclusionViolation(error)) throw new BookingConflictError()
    throw error
  }
  return data
}

async function applyCarBookingAdminAction(
  action: 'cancelled' | 'paused' | 'denied',
  input: AdminActionInput,
): Promise<CarBookingRow> {
  const { data, error } = await supabase.rpc('set_car_booking_status', {
    p_booking_id: input.bookingId,
    p_action: action,
    p_reason: input.reason ?? undefined,
  })
  if (error) throw error
  return data
}

export const cancelCarBooking = (input: AdminActionInput) => applyCarBookingAdminAction('cancelled', input)
export const pauseCarBooking = (input: AdminActionInput) => applyCarBookingAdminAction('paused', input)
export const denyCarBooking = (input: AdminActionInput) => applyCarBookingAdminAction('denied', input)
