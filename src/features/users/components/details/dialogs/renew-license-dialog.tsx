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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRenewLicense } from '../../../hooks/user-details-mutations'
import { formatDate } from '../details-types'
import type { UserLicenseWithRenewals } from '../../../api/user-details-api'

interface RenewLicenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  license: UserLicenseWithRenewals
}

export function RenewLicenseDialog({ open, onOpenChange, userId, license }: RenewLicenseDialogProps) {
  const [newExpiryDate, setNewExpiryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const renew = useRenewLicense(userId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newExpiryDate) {
      setError('New expiry date is required.')
      return
    }

    setError(null)
    try {
      await renew.mutateAsync({
        userLicenseId: license.id,
        newExpiryDate,
        notes: notes.trim() || null,
      })
      setNewExpiryDate('')
      setNotes('')
      onOpenChange(false)
    } catch {
      setError('Failed to renew license. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Renew License</DialogTitle>
          <DialogDescription>
            Current expiry: <span className="font-medium text-text">{formatDate(license.expiry_date)}</span>.
            This date will be preserved in renewal history, not overwritten.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="renew-expiry">New Expiry Date *</Label>
            <Input id="renew-expiry" type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="renew-notes">Notes (Optional)</Label>
            <Textarea id="renew-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={renew.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={renew.isPending}>
              {renew.isPending ? 'Renewing…' : 'Confirm Renewal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
