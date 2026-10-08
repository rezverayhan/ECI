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
import { useHoldIssue } from '../hooks/support-mutations'

interface HoldIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issueId: string
}

export function HoldIssueDialog({ open, onOpenChange, issueId }: HoldIssueDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const hold = useHoldIssue()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('A reason is required to place this issue on hold.')
      return
    }
    setError(null)
    try {
      await hold.mutateAsync({ issueId, reason })
      setReason('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update this issue. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move to Waiting / On Hold</DialogTitle>
          <DialogDescription>This reason is visible to the requester.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hold-reason">Reason *</Label>
            <Textarea
              id="hold-reason"
              rows={3}
              placeholder="e.g. Waiting on a replacement part from the vendor"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={hold.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={hold.isPending}>
              {hold.isPending ? 'Saving…' : 'Confirm Hold'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
