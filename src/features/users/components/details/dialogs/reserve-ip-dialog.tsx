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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ManagerCombobox } from '../../manager-combobox'
import { useIpPoolActions } from '../../../hooks/user-details-mutations'

interface ReserveIpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ipAddressId: string
  ipAddressLabel: string
}

export function ReserveIpDialog({ open, onOpenChange, ipAddressId, ipAddressLabel }: ReserveIpDialogProps) {
  const { reserve } = useIpPoolActions()
  const [reservedFor, setReservedFor] = useState<string | undefined>(undefined)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reservedFor) {
      setError('Select who or what this IP is reserved for.')
      return
    }
    setError(null)
    try {
      await reserve.mutateAsync({ ipAddressId, reservedFor, notes: notes.trim() || null })
      setReservedFor(undefined)
      setNotes('')
      onOpenChange(false)
    } catch {
      setError('Failed to reserve this IP address. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reserve IP Address</DialogTitle>
          <DialogDescription>
            Hold <span className="font-medium text-text">{ipAddressLabel}</span> out of the
            normal assignment pool for a specific purpose.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Reserved For</Label>
            <ManagerCombobox value={reservedFor} onChange={setReservedFor} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reserve-notes">Notes (Optional)</Label>
            <Textarea id="reserve-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={reserve.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={reserve.isPending}>
              {reserve.isPending ? 'Reserving…' : 'Reserve IP'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
