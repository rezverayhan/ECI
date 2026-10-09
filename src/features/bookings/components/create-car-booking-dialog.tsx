import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCars, useConfirmedCarBookingsInRange } from '../hooks/bookings-queries'
import { useCreateCarBooking } from '../hooks/bookings-mutations'
import { BookingConflictError } from '../api/bookings-api'
import { dhakaInputsToIso, formatDhakaRange, nowInDhaka } from '../lib/datetime'

interface CreateCarBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCarId?: string
}

export function CreateCarBookingDialog({ open, onOpenChange, defaultCarId }: CreateCarBookingDialogProps) {
  const { data: cars = [] } = useCars()
  const availableCars = useMemo(() => cars.filter((c) => c.status === 'available'), [cars])

  const today = nowInDhaka()
  const [carId, setCarId] = useState(defaultCarId ?? '')
  const [date, setDate] = useState(today.date)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [destination, setDestination] = useState('')
  const [purpose, setPurpose] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createBooking = useCreateCarBooking()

  const startIso = carId && date && startTime ? dhakaInputsToIso(date, startTime) : null
  const endIso = carId && date && endTime ? dhakaInputsToIso(date, endTime) : null

  const { data: conflicts = [] } = useConfirmedCarBookingsInRange(carId || null, startIso, endIso)
  const hasPrecheckConflict = Boolean(startIso && endIso && conflicts.length > 0)

  function reset() {
    setCarId(defaultCarId ?? '')
    setDate(today.date)
    setStartTime('')
    setEndTime('')
    setDestination('')
    setPurpose('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!carId) return setError('Select a car.')
    if (!date || !startTime || !endTime) return setError('Date, start time and end time are required.')
    if (startTime >= endTime) return setError('Start time must be before end time.')

    const start = dhakaInputsToIso(date, startTime)
    const end = dhakaInputsToIso(date, endTime)
    if (new Date(start).getTime() < Date.now()) return setError('This booking starts in the past. Choose a current or future time.')
    if (hasPrecheckConflict) return setError('This car is already booked for part of the selected time. Choose another time or car.')

    setError(null)
    try {
      await createBooking.mutateAsync({
        carId,
        startAt: start,
        endAt: end,
        destination: destination || null,
        purpose: purpose || null,
      })
      reset()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof BookingConflictError ? err.message : 'Failed to create the booking. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book a Car</DialogTitle>
          <DialogDescription>
            Available cars are confirmed automatically. Conflicting times are blocked.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Car *</Label>
            <Select value={carId} onValueChange={(val) => setCarId(val ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a car" />
              </SelectTrigger>
              <SelectContent>
                {availableCars.map((car) => (
                  <SelectItem key={car.id} value={car.id}>
                    {car.name}
                    {car.registration_number ? ` — ${car.registration_number}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableCars.length === 0 && (
              <p className="text-xs text-text-muted">No cars are currently available for booking.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="car-booking-date">Date *</Label>
              <Input id="car-booking-date" type="date" min={today.date} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="car-booking-start">Start Time *</Label>
              <Input id="car-booking-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="car-booking-end">End Time *</Label>
              <Input id="car-booking-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>

          {hasPrecheckConflict && conflicts[0] && (
            <p className="text-xs text-error">
              This car is already booked for part of this time ({formatDhakaRange(conflicts[0].start_at, conflicts[0].end_at)}
              {conflicts.length > 1 ? `, +${conflicts.length - 1} more` : ''}). Choose another time or car.
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="car-booking-destination">Destination (Optional)</Label>
            <Input id="car-booking-destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Client Office, Gulshan" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="car-booking-purpose">Purpose (Optional)</Label>
            <Textarea id="car-booking-purpose" rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createBooking.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBooking.isPending || hasPrecheckConflict}>
              {createBooking.isPending ? 'Booking…' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
