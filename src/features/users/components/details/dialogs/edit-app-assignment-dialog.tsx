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
import { useUpdateUserApplication } from '../../../hooks/user-details-mutations'
import type { UserApplicationData } from '../../../api/user-details-api'

interface EditAppAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  assignment: UserApplicationData
}

export function EditAppAssignmentDialog({ open, onOpenChange, userId, assignment }: EditAppAssignmentDialogProps) {
  const [version, setVersion] = useState(assignment.version ?? '')
  const [licenseType, setLicenseType] = useState(assignment.license_type ?? '')
  const [licenseStatus, setLicenseStatus] = useState(assignment.license_status ?? '')
  const [renewalDate, setRenewalDate] = useState(assignment.renewal_date ?? '')
  const [notes, setNotes] = useState(assignment.notes ?? '')
  const [error, setError] = useState<string | null>(null)

  const updateAssignment = useUpdateUserApplication(userId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await updateAssignment.mutateAsync({
        userAppId: assignment.id,
        previous: assignment,
        input: {
          version: version.trim() || null,
          licenseType: licenseType.trim() || null,
          licenseStatus: licenseStatus.trim() || null,
          renewalDate: renewalDate || null,
          notes: notes.trim() || null,
        },
      })
      onOpenChange(false)
    } catch {
      setError('Failed to update application assignment. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {assignment.application.name} Assignment</DialogTitle>
          <DialogDescription>Update the real license details for this application seat.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-app-ver">Version / Release</Label>
              <Input id="edit-app-ver" value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-app-license">License Type</Label>
              <Input id="edit-app-license" value={licenseType} onChange={(e) => setLicenseType(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-app-status">License Status</Label>
              <Input id="edit-app-status" value={licenseStatus} onChange={(e) => setLicenseStatus(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-app-renewal">Renewal Date</Label>
              <Input id="edit-app-renewal" type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-app-notes">Notes</Label>
            <Textarea id="edit-app-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateAssignment.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateAssignment.isPending}>
              {updateAssignment.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
