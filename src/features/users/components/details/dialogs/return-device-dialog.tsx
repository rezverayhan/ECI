import { useState } from 'react'
import { AlertTriangle, Archive, RotateCcw } from 'lucide-react'
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
  const [reason, setReason] = useState<string>(REPLACEMENT_REASONS[0])
  const [disposition, setDisposition] = useState<'available' | 'retired'>('available')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const returnDeviceMutation = useReturnDevice(userId)
  const isRetiring = disposition === 'retired'

  function handleReasonChange(newReason: string) {
    setReason(newReason)
    if (newReason === 'Asset Decommissioned / Retired') {
      setDisposition('retired')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await returnDeviceMutation.mutateAsync({
        assignmentId: currentDevice.id,
        deviceId: currentDevice.device_id,
        replacementReason: reason,
        notes: notes.trim() || null,
        retireDevice: isRetiring,
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
          <div className="flex items-center gap-2">
            {isRetiring ? (
              <Archive className="size-5 text-destructive" aria-hidden />
            ) : (
              <RotateCcw className="size-5 text-primary" aria-hidden />
            )}
            <DialogTitle>{isRetiring ? 'Return & Retire Assigned Device' : 'Return Assigned Device'}</DialogTitle>
          </div>
          <DialogDescription>
            Record custody return of{' '}
            <span className="font-semibold text-text">
              {currentDevice.device.brand ? currentDevice.device.brand + ' ' : ''}{currentDevice.device.model} ({currentDevice.device.asset_id})
            </span>
            . Assignment history will remain preserved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="device-return-reason">Return / Replacement Reason</Label>
            <Select value={reason} onValueChange={(val) => handleReasonChange(val ?? REPLACEMENT_REASONS[0])}>
              <SelectTrigger id="device-return-reason" className="w-full">
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
            <Label htmlFor="post-return-disposition">Post-Return Hardware Disposition</Label>
            <Select
              value={disposition}
              onValueChange={(val) => setDisposition(val as 'available' | 'retired')}
            >
              <SelectTrigger id="post-return-disposition" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  Return to Inventory (Status: Available for reassignment)
                </SelectItem>
                <SelectItem value="retired">
                  Decommission & Retire Asset (Status: Retired)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isRetiring && (
            <div className="flex items-start gap-2.5 rounded-md border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-text">
              <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" aria-hidden />
              <div className="space-y-0.5">
                <span className="font-semibold block">Asset Retirement Notice</span>
                <p className="text-text-secondary leading-relaxed">
                  This device will be permanently marked as <strong>Retired</strong> and will not be available for future employee assignment. Assignment and service histories remain fully intact.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="return-notes">Condition / Notes (Optional)</Label>
            <Textarea
              id="return-notes"
              rows={2}
              placeholder={isRetiring ? 'e.g. Scrapped for components, e-waste recycling' : 'e.g. Good physical condition, wiped clean and placed in IT storage'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

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
              variant={isRetiring ? 'destructive' : 'default'}
              disabled={returnDeviceMutation.isPending}
            >
              {returnDeviceMutation.isPending
                ? 'Processing…'
                : isRetiring
                  ? 'Confirm Return & Retire'
                  : 'Confirm Return'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
