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
import { useIpPhoneConflictActions } from '../../../hooks/user-details-mutations'

interface FlagIpPhoneConflictDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ipPhoneId: string
  extensionLabel: string
}

export function FlagIpPhoneConflictDialog({
  open,
  onOpenChange,
  ipPhoneId,
  extensionLabel,
}: FlagIpPhoneConflictDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { flag } = useIpPhoneConflictActions()

  function handleOpenChange(next: boolean) {
    if (!next && !flag.isPending) {
      setReason('')
      setError(null)
    }
    onOpenChange(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please describe the conflict before flagging this extension.')
      return
    }
    setError(null)
    try {
      await flag.mutateAsync({ ipPhoneId, reason: reason.trim() })
      handleOpenChange(false)
    } catch {
      setError('Failed to flag this extension. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Flag Extension Conflict</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-text">Ext {extensionLabel}</span> will be excluded from
            normal assignment until an IT Administrator clears the conflict. The reason stays visible in
            the directory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="conflict-reason">Reason *</Label>
            <Textarea
              id="conflict-reason"
              rows={3}
              placeholder="e.g. Two employees claim this extension — needs IT verification before reassignment."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={flag.isPending}
              required
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={flag.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={flag.isPending}>
              {flag.isPending ? 'Flagging…' : 'Flag Conflict'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
