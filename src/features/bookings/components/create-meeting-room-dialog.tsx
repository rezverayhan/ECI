import { useState } from 'react'
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
import { useCreateMeetingRoom } from '../hooks/bookings-mutations'

interface CreateMeetingRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateMeetingRoomDialog({ open, onOpenChange }: CreateMeetingRoomDialogProps) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createRoom = useCreateMeetingRoom()

  function resetAndClose() {
    setName('')
    setLocation('')
    setCapacity('')
    setDescription('')
    setError(null)
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a room name.')
      return
    }
    setError(null)
    try {
      await createRoom.mutateAsync({
        name: name.trim(),
        location: location.trim() || null,
        capacity: capacity.trim() ? Number(capacity) : null,
        description: description.trim() || null,
      })
      resetAndClose()
    } catch {
      setError('Failed to register this meeting room. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : resetAndClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Meeting Room</DialogTitle>
          <DialogDescription>Adds a bookable room to the catalog.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="room-name">Room Name *</Label>
            <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Conference Room A" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="room-location">Location</Label>
              <Input id="room-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. 3rd Floor" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-capacity">Capacity</Label>
              <Input id="room-capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 8" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="room-description">Description (Optional)</Label>
            <Textarea id="room-description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Has a projector and whiteboard" />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={createRoom.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRoom.isPending}>
              {createRoom.isPending ? 'Registering…' : 'Register Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
