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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useReturnDevice } from '../../../hooks/user-details-mutations'
import { DEVICE_REPLACEMENT_REASONS as REPLACEMENT_REASONS } from '../details-types'
import type { UserCurrentDeviceData } from '../../../api/user-details-api'

interface ReturnDeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  currentDevice: UserCurrentDeviceData
}

export function ReturnDeviceDialog({
  open,
  onOpenChange,
  userId,
  currentDevice,
}: ReturnDeviceDialogProps) {
  const [reason, setReason] = useState(REPLACEMENT_REASONS[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const returnDeviceMutation = useReturnDevice(userId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await returnDeviceMutation.mutateAsync({
        assignmentId: currentDevice.id,
        deviceId: currentDevice.device_id,
        replacementReason: reason,
        notes: notes.trim() || null,
      })
      onOpenChange(false)
    } catch {
      setError('Failed to process device return. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Return Assigned Device</DialogTitle>
          <DialogDescription>
            Record the return of{' '}
            <span className="font-medium text-text">
              {currentDevice.device.brand} {currentDevice.device.model} ({currentDevice.device.asset_id})
            </span>
            . The assignment history will be preserved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Return / Replacement Reason</Label>
            <Select value={reason} onValueChange={(val) => setReason(val ?? REPLACEMENT_REASONS[0]!)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPLACEMENT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="return-notes">Condition / Notes (Optional)</Label>
            <Textarea
              id="return-notes"
              rows={2}
              placeholder="e.g. Good physical condition, wiped clean and placed in IT storage"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={returnDeviceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={returnDeviceMutation.isPending}
            >
              {returnDeviceMutation.isPending ? 'Processing…' : 'Confirm Return'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
