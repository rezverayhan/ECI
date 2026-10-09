import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/context/auth-context'
import { logAuditEvent } from '@/lib/supabase/audit'
import type { Json } from '@/lib/supabase/database.types'
import {
  cancelCarBooking,
  cancelRoomBooking,
  createCar,
  createCarBooking,
  createMeetingRoom,
  createRoomBooking,
  denyCarBooking,
  denyRoomBooking,
  pauseCarBooking,
  pauseRoomBooking,
  updateCarStatus,
  updateMeetingRoomStatus,
  type CreateCarInput,
  type CreateMeetingRoomInput,
  type ResourceStatus,
} from '../api/bookings-api'

function invalidateRoomBookings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['bookings', 'room-bookings'] })
  queryClient.invalidateQueries({ queryKey: ['bookings', 'room-availability'] })
  queryClient.invalidateQueries({ queryKey: ['notifications'] })
}

function invalidateCarBookings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['bookings', 'car-bookings'] })
  queryClient.invalidateQueries({ queryKey: ['bookings', 'car-availability'] })
  queryClient.invalidateQueries({ queryKey: ['notifications'] })
}

/* ==========================================================================
   Meeting Room
   — Audit logging and notification are written server-side, inside the
   create_room_booking / set_room_booking_status RPCs (migration 0044), in
   the same transaction as the booking mutation. The client no longer writes
   audit_logs or notifications directly for bookings.
   ========================================================================== */

export function useCreateRoomBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRoomBooking,
    onSuccess: () => invalidateRoomBookings(queryClient),
  })
}

export function useCancelRoomBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelRoomBooking,
    onSuccess: () => invalidateRoomBookings(queryClient),
  })
}

export function usePauseRoomBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: pauseRoomBooking,
    onSuccess: () => invalidateRoomBookings(queryClient),
  })
}

export function useDenyRoomBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: denyRoomBooking,
    onSuccess: () => invalidateRoomBookings(queryClient),
  })
}

/* ==========================================================================
   Car — same trusted-RPC pattern as Meeting Room, see above.
   ========================================================================== */

export function useCreateCarBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCarBooking,
    onSuccess: () => invalidateCarBookings(queryClient),
  })
}

export function useCancelCarBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelCarBooking,
    onSuccess: () => invalidateCarBookings(queryClient),
  })
}

export function usePauseCarBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: pauseCarBooking,
    onSuccess: () => invalidateCarBookings(queryClient),
  })
}

export function useDenyCarBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: denyCarBooking,
    onSuccess: () => invalidateCarBookings(queryClient),
  })
}

/* ==========================================================================
   Resource Catalog (Meeting Rooms / Cars)
   — Unlike bookings, these are plain client inserts/updates: migration
   0044/0045 never moved the catalog tables behind an RPC, so logAuditEvent
   is written client-side here, matching the house pattern used everywhere
   else in the app (e.g. user-details-mutations.ts).
   ========================================================================== */

export function useCreateMeetingRoom() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()
  return useMutation({
    mutationFn: (input: CreateMeetingRoomInput) => createMeetingRoom(input),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'MEETING_ROOM_CREATED',
          entityType: 'meeting_rooms',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['bookings', 'meeting-rooms'] })
    },
  })
}

export function useUpdateMeetingRoomStatus() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ResourceStatus }) => updateMeetingRoomStatus(id, status),
    onSuccess: async (updated) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'MEETING_ROOM_STATUS_CHANGED',
          entityType: 'meeting_rooms',
          entityId: updated.id,
          newValues: { status: updated.status },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['bookings', 'meeting-rooms'] })
    },
  })
}

export function useCreateCar() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()
  return useMutation({
    mutationFn: (input: CreateCarInput) => createCar(input),
    onSuccess: async (created) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'CAR_CREATED',
          entityType: 'cars',
          entityId: created.id,
          newValues: created as unknown as Record<string, Json>,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['bookings', 'cars'] })
    },
  })
}

export function useUpdateCarStatus() {
  const queryClient = useQueryClient()
  const { appUser } = useAuth()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ResourceStatus }) => updateCarStatus(id, status),
    onSuccess: async (updated) => {
      if (appUser) {
        await logAuditEvent({
          actorUserId: appUser.id,
          action: 'CAR_STATUS_CHANGED',
          entityType: 'cars',
          entityId: updated.id,
          newValues: { status: updated.status },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['bookings', 'cars'] })
    },
  })
}
