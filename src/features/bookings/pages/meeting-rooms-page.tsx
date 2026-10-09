import { useMemo, useState } from 'react'
import { DoorOpen, Plus, Settings2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/features/auth/context/auth-context'
import { useMeetingRooms, useRoomBookings } from '../hooks/bookings-queries'
import {
  useCancelRoomBooking,
  usePauseRoomBooking,
  useDenyRoomBooking,
  useUpdateMeetingRoomStatus,
} from '../hooks/bookings-mutations'
import { CreateRoomBookingDialog } from '../components/create-room-booking-dialog'
import { CreateMeetingRoomDialog } from '../components/create-meeting-room-dialog'
import { BookingList, type BookingListRow } from '../components/booking-list'
import type { BookingStatus, ResourceStatus } from '../api/bookings-api'

const RESOURCE_STATUS_OPTIONS: { value: ResourceStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'maintenance', label: 'Maintenance' },
]

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'denied', label: 'Denied' },
  { value: 'completed', label: 'Completed' },
]

export function MeetingRoomsPage() {
  const { appUser, accessLevel } = useAuth()
  const canManage = accessLevel === 'admin' || accessLevel === 'it_administrator'
  const isItAdmin = accessLevel === 'it_administrator'
  const currentUserId = appUser?.id ?? ''

  const [createOpen, setCreateOpen] = useState(false)
  const [createRoomOpen, setCreateRoomOpen] = useState(false)
  const updateRoomStatus = useUpdateMeetingRoomStatus()
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')

  const { data: rooms = [], isPending: roomsPending, isError: roomsError, refetch: refetchRooms } = useMeetingRooms()

  const filters = useMemo(
    () => ({
      scope,
      currentUserId,
      status: status === 'all' ? undefined : status,
    }),
    [scope, currentUserId, status],
  )
  const { data: bookings = [], isPending: bookingsPending, isError: bookingsError, refetch: refetchBookings } = useRoomBookings(filters)

  const cancelBooking = useCancelRoomBooking()
  const pauseBooking = usePauseRoomBooking()
  const denyBooking = useDenyRoomBooking()
  const isActionPending = cancelBooking.isPending || pauseBooking.isPending || denyBooking.isPending

  const rows: BookingListRow[] = bookings.map((b) => ({
    id: b.id,
    resourceName: b.room?.name ?? 'Unknown Room',
    resourceSubtitle: b.room?.location ?? null,
    requesterName: b.requester?.full_name ?? 'Unknown',
    requesterEmployeeId: b.requester?.employee_id ?? null,
    startAt: b.start_at,
    endAt: b.end_at,
    status: b.status,
    summary: b.title,
    purpose: b.purpose,
    adminActionReason: b.admin_action_reason,
  }))

  if (roomsPending) return <LoadingState label="Loading meeting rooms…" />
  if (roomsError) {
    return (
      <ErrorState
        title="Meeting rooms couldn't be loaded"
        description="Unable to retrieve meeting rooms. Please verify your connection and try again."
        onRetry={() => refetchRooms()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meeting Rooms"
        description="Book and manage meeting room reservations."
        actions={
          <div className="flex items-center gap-2">
            {isItAdmin && (
              <Button size="sm" variant="outline" onClick={() => setCreateRoomOpen(true)} className="gap-1.5">
                <Settings2 className="size-3.5" aria-hidden />
                Register New Room
              </Button>
            )}
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5" disabled={!rooms.some((r) => r.status === 'available')}>
              <Plus className="size-3.5" aria-hidden />
              Book a Room
            </Button>
          </div>
        }
      />

      {rooms.length === 0 ? (
        <EmptyState icon={DoorOpen} title="No meeting rooms are available in the system yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((room) => (
            <div key={room.id} className="rounded-lg border border-border bg-surface p-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-text truncate">{room.name}</span>
                {isItAdmin ? (
                  <Select
                    value={room.status}
                    onValueChange={(val) =>
                      val && val !== room.status && updateRoomStatus.mutate({ id: room.id, status: val as ResourceStatus })
                    }
                  >
                    <SelectTrigger className="h-6 w-auto text-xs px-2 gap-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={room.status} />
                )}
              </div>
              <div className="mt-1.5 text-xs text-text-secondary space-y-0.5">
                {room.location && <p>{room.location}</p>}
                {room.capacity != null && <p>Capacity: {room.capacity}</p>}
                {room.description && <p className="text-text-muted">{room.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-sm font-semibold text-text">{canManage && scope === 'all' ? 'All Bookings' : 'My Bookings'}</h2>
          <div className="flex gap-2">
            {canManage && (
              <Select value={scope} onValueChange={(val) => setScope((val as typeof scope) ?? 'mine')}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mine">My Bookings</SelectItem>
                  <SelectItem value="all">All Bookings</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={status} onValueChange={(val) => setStatus((val as typeof status) ?? 'all')}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {bookingsPending ? (
          <LoadingState label="Loading bookings…" />
        ) : bookingsError ? (
          <ErrorState
            title="Bookings couldn't be loaded"
            description="Unable to retrieve bookings. Please verify your connection and try again."
            onRetry={() => refetchBookings()}
          />
        ) : (
          <BookingList
            rows={rows}
            canManage={canManage}
            isActionPending={isActionPending}
            onCancel={async (id, reason) => { await cancelBooking.mutateAsync({ bookingId: id, reason }) }}
            onPause={async (id, reason) => { await pauseBooking.mutateAsync({ bookingId: id, reason }) }}
            onDeny={async (id, reason) => { await denyBooking.mutateAsync({ bookingId: id, reason }) }}
            emptyTitle="No bookings yet."
          />
        )}
      </div>

      <CreateRoomBookingDialog open={createOpen} onOpenChange={setCreateOpen} />
      {isItAdmin && <CreateMeetingRoomDialog open={createRoomOpen} onOpenChange={setCreateRoomOpen} />}
    </div>
  )
}
