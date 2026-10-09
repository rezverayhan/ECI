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
import { useMeetingRooms, useConfirmedRoomBookingsInRange } from '../hooks/bookings-queries'
import { useCreateRoomBooking } from '../hooks/bookings-mutations'
import { BookingConflictError } from '../api/bookings-api'
import { dhakaInputsToIso, formatDhakaRange, nowInDhaka } from '../lib/datetime'

interface CreateRoomBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRoomId?: string
}

export function CreateRoomBookingDialog({ open, onOpenChange, defaultRoomId }: CreateRoomBookingDialogProps) {
  const { data: rooms = [] } = useMeetingRooms()
  const availableRooms = useMemo(() => rooms.filter((r) => r.status === 'available'), [rooms])

  const today = nowInDhaka()
  const [roomId, setRoomId] = useState(defaultRoomId ?? '')
  const [date, setDate] = useState(today.date)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [title, setTitle] = useState('')
  const [purpose, setPurpose] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createBooking = useCreateRoomBooking()

  const startIso = roomId && date && startTime ? dhakaInputsToIso(date, startTime) : null
  const endIso = roomId && date && endTime ? dhakaInputsToIso(date, endTime) : null

  const { data: conflicts = [] } = useConfirmedRoomBookingsInRange(roomId || null, startIso, endIso)
  const hasPrecheckConflict = Boolean(startIso && endIso && conflicts.length > 0)

  function reset() {
    setRoomId(defaultRoomId ?? '')
    setDate(today.date)
    setStartTime('')
    setEndTime('')
    setTitle('')
    setPurpose('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!roomId) return setError('Select a meeting room.')
    if (!date || !startTime || !endTime) return setError('Date, start time and end time are required.')
    if (startTime >= endTime) return setError('Start time must be before end time.')

    const start = dhakaInputsToIso(date, startTime)
    const end = dhakaInputsToIso(date, endTime)
    if (new Date(start).getTime() < Date.now()) return setError('This booking starts in the past. Choose a current or future time.')
    if (hasPrecheckConflict) return setError('This room is already booked for part of the selected time. Choose another time or room.')

    setError(null)
    try {
      await createBooking.mutateAsync({
        meetingRoomId: roomId,
        startAt: start,
        endAt: end,
        title: title || null,
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
          <DialogTitle>Book a Meeting Room</DialogTitle>
          <DialogDescription>
            Available rooms are confirmed automatically. Conflicting times are blocked.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Meeting Room *</Label>
            <Select value={roomId} onValueChange={(val) => setRoomId(val ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                    {room.location ? ` — ${room.location}` : ''}
                    {room.capacity ? ` (${room.capacity} seats)` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableRooms.length === 0 && (
              <p className="text-xs text-text-muted">No rooms are currently available for booking.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="room-booking-date">Date *</Label>
              <Input id="room-booking-date" type="date" min={today.date} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-booking-start">Start Time *</Label>
              <Input id="room-booking-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-booking-end">End Time *</Label>
              <Input id="room-booking-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>

          {hasPrecheckConflict && conflicts[0] && (
            <p className="text-xs text-error">
              This room is already booked for part of this time ({formatDhakaRange(conflicts[0].start_at, conflicts[0].end_at)}
              {conflicts.length > 1 ? `, +${conflicts.length - 1} more` : ''}). Choose another time or room.
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="room-booking-title">Meeting Title (Optional)</Label>
            <Input id="room-booking-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly Sync" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="room-booking-purpose">Purpose (Optional)</Label>
            <Textarea id="room-booking-purpose" rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
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
