import { useMemo, useState } from 'react'
import { Car, Plus, Settings2 } from 'lucide-react'
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
import { useCars, useCarBookings } from '../hooks/bookings-queries'
import {
  useCancelCarBooking,
  usePauseCarBooking,
  useDenyCarBooking,
  useUpdateCarStatus,
} from '../hooks/bookings-mutations'
import { CreateCarBookingDialog } from '../components/create-car-booking-dialog'
import { CreateCarDialog } from '../components/create-car-dialog'
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

export function CarsPage() {
  const { appUser, accessLevel } = useAuth()
  const canManage = accessLevel === 'admin' || accessLevel === 'it_administrator'
  const isItAdmin = accessLevel === 'it_administrator'
  const currentUserId = appUser?.id ?? ''

  const [createOpen, setCreateOpen] = useState(false)
  const [createCarOpen, setCreateCarOpen] = useState(false)
  const updateCarStatus = useUpdateCarStatus()
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')

  const { data: cars = [], isPending: carsPending, isError: carsError, refetch: refetchCars } = useCars()

  const filters = useMemo(
    () => ({
      scope,
      currentUserId,
      status: status === 'all' ? undefined : status,
    }),
    [scope, currentUserId, status],
  )
  const { data: bookings = [], isPending: bookingsPending, isError: bookingsError, refetch: refetchBookings } = useCarBookings(filters)

  const cancelBooking = useCancelCarBooking()
  const pauseBooking = usePauseCarBooking()
  const denyBooking = useDenyCarBooking()
  const isActionPending = cancelBooking.isPending || pauseBooking.isPending || denyBooking.isPending

  const rows: BookingListRow[] = bookings.map((b) => ({
    id: b.id,
    resourceName: b.car?.name ?? 'Unknown Car',
    resourceSubtitle: b.car?.registration_number ?? null,
    requesterName: b.requester?.full_name ?? 'Unknown',
    requesterEmployeeId: b.requester?.employee_id ?? null,
    startAt: b.start_at,
    endAt: b.end_at,
    status: b.status,
    summary: b.destination,
    purpose: b.purpose,
    adminActionReason: b.admin_action_reason,
  }))

  if (carsPending) return <LoadingState label="Loading cars…" />
  if (carsError) {
    return (
      <ErrorState
        title="Cars couldn't be loaded"
        description="Unable to retrieve cars. Please verify your connection and try again."
        onRetry={() => refetchCars()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cars"
        description="Book and manage company car reservations."
        actions={
          <div className="flex items-center gap-2">
            {isItAdmin && (
              <Button size="sm" variant="outline" onClick={() => setCreateCarOpen(true)} className="gap-1.5">
                <Settings2 className="size-3.5" aria-hidden />
                Register New Car
              </Button>
            )}
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5" disabled={!cars.some((c) => c.status === 'available')}>
              <Plus className="size-3.5" aria-hidden />
              Book a Car
            </Button>
          </div>
        }
      />

      {cars.length === 0 ? (
        <EmptyState icon={Car} title="No cars are registered in the system yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cars.map((car) => (
            <div key={car.id} className="rounded-lg border border-border bg-surface p-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-text truncate">{car.name}</span>
                {isItAdmin ? (
                  <Select
                    value={car.status}
                    onValueChange={(val) =>
                      val && val !== car.status && updateCarStatus.mutate({ id: car.id, status: val as ResourceStatus })
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
                  <StatusBadge status={car.status} />
                )}
              </div>
              <div className="mt-1.5 text-xs text-text-secondary space-y-0.5">
                {car.model && <p>{car.model}</p>}
                {car.registration_number && <p className="font-mono">{car.registration_number}</p>}
                {car.notes && <p className="text-text-muted">{car.notes}</p>}
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

      <CreateCarBookingDialog open={createOpen} onOpenChange={setCreateOpen} />
      {isItAdmin && <CreateCarDialog open={createCarOpen} onOpenChange={setCreateCarOpen} />}
    </div>
  )
}
