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
import { useResolveIssue } from '../hooks/support-mutations'

interface ResolveIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issueId: string
}

export function ResolveIssueDialog({ open, onOpenChange, issueId }: ResolveIssueDialogProps) {
  const [resolution, setResolution] = useState('')
  const [error, setError] = useState<string | null>(null)
  const resolve = useResolveIssue()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!resolution.trim()) {
      setError('This issue cannot be resolved until a resolution is provided.')
      return
    }
    setError(null)
    try {
      await resolve.mutateAsync({ issueId, resolution })
      setResolution('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve this issue. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Resolve Issue</DialogTitle>
          <DialogDescription>This resolution is visible to the requester.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="resolution-text">Resolution *</Label>
            <Textarea
              id="resolution-text"
              rows={4}
              placeholder="Describe what was done to resolve this issue…"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={resolve.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={resolve.isPending}>
              {resolve.isPending ? 'Resolving…' : 'Mark Resolved'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
