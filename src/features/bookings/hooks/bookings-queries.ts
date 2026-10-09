import { useQuery } from '@tanstack/react-query'
import {
  getCarBookings,
  getCars,
  getConfirmedCarBookingsInRange,
  getConfirmedRoomBookingsInRange,
  getMeetingRooms,
  getRoomBookings,
  type CarBookingFilters,
  type RoomBookingFilters,
} from '../api/bookings-api'

export function useMeetingRooms() {
  return useQuery({
    queryKey: ['bookings', 'meeting-rooms'],
    queryFn: getMeetingRooms,
    staleTime: 60_000,
  })
}

export function useCars() {
  return useQuery({
    queryKey: ['bookings', 'cars'],
    queryFn: getCars,
    staleTime: 60_000,
  })
}

export function useRoomBookings(filters: RoomBookingFilters) {
  return useQuery({
    queryKey: ['bookings', 'room-bookings', filters],
    queryFn: () => getRoomBookings(filters),
    enabled: Boolean(filters.currentUserId),
    staleTime: 15_000,
  })
}

export function useCarBookings(filters: CarBookingFilters) {
  return useQuery({
    queryKey: ['bookings', 'car-bookings', filters],
    queryFn: () => getCarBookings(filters),
    enabled: Boolean(filters.currentUserId),
    staleTime: 15_000,
  })
}

/** UI pre-check only — the real, authoritative guard is the DB exclusion constraint. */
export function useConfirmedRoomBookingsInRange(roomId: string | null, fromIso: string | null, toIso: string | null) {
  return useQuery({
    queryKey: ['bookings', 'room-availability', roomId, fromIso, toIso],
    queryFn: () => getConfirmedRoomBookingsInRange(roomId!, fromIso!, toIso!),
    enabled: Boolean(roomId && fromIso && toIso),
    staleTime: 0,
  })
}

export function useConfirmedCarBookingsInRange(carId: string | null, fromIso: string | null, toIso: string | null) {
  return useQuery({
    queryKey: ['bookings', 'car-availability', carId, fromIso, toIso],
    queryFn: () => getConfirmedCarBookingsInRange(carId!, fromIso!, toIso!),
    enabled: Boolean(carId && fromIso && toIso),
    staleTime: 0,
  })
}
