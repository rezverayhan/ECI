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
import { useCreateCar } from '../hooks/bookings-mutations'

interface CreateCarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCarDialog({ open, onOpenChange }: CreateCarDialogProps) {
  const [name, setName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [model, setModel] = useState('')
  const [driverInformation, setDriverInformation] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createCar = useCreateCar()

  function resetAndClose() {
    setName('')
    setRegistrationNumber('')
    setModel('')
    setDriverInformation('')
    setNotes('')
    setError(null)
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a car name.')
      return
    }
    setError(null)
    try {
      await createCar.mutateAsync({
        name: name.trim(),
        registrationNumber: registrationNumber.trim() || null,
        model: model.trim() || null,
        driverInformation: driverInformation.trim() || null,
        notes: notes.trim() || null,
      })
      resetAndClose()
    } catch {
      setError('Failed to register this car. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : resetAndClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Car</DialogTitle>
          <DialogDescription>Adds a bookable vehicle to the catalog.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="car-name">Car Name *</Label>
            <Input id="car-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Toyota Hiace - Dhaka 1" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="car-reg">Registration Number</Label>
              <Input id="car-reg" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="e.g. DHA-1234" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="car-model">Model</Label>
              <Input id="car-model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Hiace 2022" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="car-driver">Driver Information</Label>
            <Input id="car-driver" value={driverInformation} onChange={(e) => setDriverInformation(e.target.value)} placeholder="e.g. Assigned driver name / contact" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="car-notes">Notes (Optional)</Label>
            <Textarea id="car-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={createCar.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCar.isPending}>
              {createCar.isPending ? 'Registering…' : 'Register Car'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
