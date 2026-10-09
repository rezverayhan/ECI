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

export type BookingAction = 'cancel' | 'pause' | 'deny'

const ACTION_COPY: Record<BookingAction, { title: string; confirmLabel: string; destructive: boolean; reasonRequired: boolean }> = {
  cancel: { title: 'Cancel Booking', confirmLabel: 'Cancel Booking', destructive: true, reasonRequired: false },
  pause: { title: 'Pause Booking', confirmLabel: 'Pause Booking', destructive: false, reasonRequired: true },
  deny: { title: 'Deny Booking', confirmLabel: 'Deny Booking', destructive: true, reasonRequired: true },
}

interface BookingActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: BookingAction
  resourceLabel: string
  requesterName: string
  isPending: boolean
  onConfirm: (reason: string | null) => Promise<void>
}

export function BookingActionDialog({
  open,
  onOpenChange,
  action,
  resourceLabel,
  requesterName,
  isPending,
  onConfirm,
}: BookingActionDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const copy = ACTION_COPY[action]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (copy.reasonRequired && !reason.trim()) {
      setError('A reason is required for this action — it will be shared with the requester.')
      return
    }
    setError(null)
    try {
      await onConfirm(reason.trim() || null)
      setReason('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update this booking. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {resourceLabel} — booked by <span className="font-medium text-text">{requesterName}</span>.
            {action === 'cancel' ? ' This cannot be undone from this screen.' : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="booking-action-reason">
              Reason {copy.reasonRequired ? '*' : '(Optional)'}
            </Label>
            <Textarea
              id="booking-action-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="This will be shared with the requester."
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={copy.destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
            >
              {isPending ? 'Saving…' : copy.confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
