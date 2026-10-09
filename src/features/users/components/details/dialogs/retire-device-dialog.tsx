import { useState } from 'react'
import { AlertTriangle, Archive } from 'lucide-react'
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
import { useReturnDevice, useRetireDevice } from '../../../hooks/user-details-mutations'
import { DEVICE_RETIREMENT_REASONS } from '../details-types'

interface RetireDeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: {
    id: string
    asset_id: string
    brand?: string | null
    model: string
    serial_number?: string | null
  }
  /** If the device is actively held by an employee, provide assignment context for return-and-retire */
  currentAssignment?: {
    id: string
    userId: string
    employeeName: string
  }
  onSuccess?: () => void
}

export function RetireDeviceDialog({
  open,
  onOpenChange,
  device,
  currentAssignment,
  onSuccess,
}: RetireDeviceDialogProps) {
  const [reason, setReason] = useState<string>(DEVICE_RETIREMENT_REASONS[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const returnDeviceMutation = useReturnDevice(currentAssignment?.userId ?? '')
  const retireDeviceMutation = useRetireDevice(currentAssignment?.userId)

  const isPending = currentAssignment
    ? returnDeviceMutation.isPending
    : retireDeviceMutation.isPending

  const deviceLabel = `${device.brand ? device.brand + ' ' : ''}${device.model} (${device.asset_id})`

  function resetAndClose() {
    setReason(DEVICE_RETIREMENT_REASONS[0])
    setNotes('')
    setError(null)
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      if (currentAssignment) {
        // Safe Return-and-Retire workflow for actively assigned devices
        await returnDeviceMutation.mutateAsync({
          assignmentId: currentAssignment.id,
          deviceId: device.id,
          replacementReason: reason,
          notes: notes.trim() || null,
          retireDevice: true,
        })
      } else {
        // Direct retirement for unassigned inventory devices
        await retireDeviceMutation.mutateAsync({
          deviceId: device.id,
          retirementReason: reason,
          notes: notes.trim() || null,
        })
      }

      onSuccess?.()
      resetAndClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retire device. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : resetAndClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Archive className="size-5" aria-hidden />
            <DialogTitle>Retire Hardware Device</DialogTitle>
          </div>
          <DialogDescription>
            Permanently transition{' '}
            <span className="font-semibold text-text">{deviceLabel}</span> to retired status.
          </DialogDescription>
        </DialogHeader>

        {/* Strong Confirmation Warning per Phase 4 Content Guidelines §32 */}
        <div className="flex items-start gap-3 rounded-md border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-text">
          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" aria-hidden />
          <div className="space-y-1">
            <span className="font-semibold text-text block">Consequence & Lifecycle Impact</span>
            <p className="text-text-secondary leading-relaxed">
              {currentAssignment ? (
                <>
                  This asset is currently in active custody with{' '}
                  <strong className="text-text">{currentAssignment.employeeName}</strong>. Retiring will safely end the custody assignment, preserve all assignment and service history, and remove the hardware asset from operational availability.
                </>
              ) : (
                <>
                  This device will be permanently removed from operational availability and cannot be assigned to any employee. Historical records and service tickets remain preserved.
                </>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="retire-reason">Retirement Reason</Label>
            <Select value={reason} onValueChange={(val) => setReason(val ?? DEVICE_RETIREMENT_REASONS[0])}>
              <SelectTrigger id="retire-reason" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEVICE_RETIREMENT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="retire-notes">Decommissioning Notes (Optional)</Label>
            <Textarea
              id="retire-notes"
              rows={2}
              placeholder="e.g. Broken motherboard, scrapped for parts, recycled at e-waste facility"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
            >
              {isPending
                ? 'Processing…'
                : currentAssignment
                  ? 'Confirm Return & Retire'
                  : 'Confirm Retirement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
