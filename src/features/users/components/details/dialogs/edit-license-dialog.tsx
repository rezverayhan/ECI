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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateUserLicense } from '../../../hooks/user-details-mutations'
import type { LicenseStatusEnum, UserLicenseWithRenewals } from '../../../api/user-details-api'

const STATUS_OPTIONS: { value: LicenseStatusEnum; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'due', label: 'Due' },
  { value: 'expired', label: 'Expired' },
]

interface EditLicenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  license: UserLicenseWithRenewals
}

export function EditLicenseDialog({ open, onOpenChange, userId, license }: EditLicenseDialogProps) {
  const [licenseName, setLicenseName] = useState(license.license_name)
  const [licenseType, setLicenseType] = useState(license.license_type ?? '')
  const [status, setStatus] = useState<LicenseStatusEnum>(license.status)
  const [startDate, setStartDate] = useState(license.start_date ?? '')
  const [expiryDate, setExpiryDate] = useState(license.expiry_date ?? '')
  const [autoRenew, setAutoRenew] = useState<'yes' | 'no'>(license.auto_renew ? 'yes' : 'no')
  const [notes, setNotes] = useState(license.notes ?? '')
  const [error, setError] = useState<string | null>(null)

  const updateLicense = useUpdateUserLicense(userId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!licenseName.trim()) {
      setError('License name is required.')
      return
    }

    setError(null)
    try {
      await updateLicense.mutateAsync({
        licenseId: license.id,
        previous: license,
        input: {
          licenseName: licenseName.trim(),
          licenseType: licenseType.trim() || null,
          status,
          startDate: startDate || null,
          expiryDate: expiryDate || null,
          autoRenew: autoRenew === 'yes',
          notes: notes.trim() || null,
        },
      })
      onOpenChange(false)
    } catch {
      setError('Failed to update license. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit License</DialogTitle>
          <DialogDescription>Update the real recorded details for this license.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-license-name">License Name *</Label>
            <Input id="edit-license-name" value={licenseName} onChange={(e) => setLicenseName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-license-type">License Type</Label>
              <Input id="edit-license-type" value={licenseType} onChange={(e) => setLicenseType(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(val) => setStatus((val as LicenseStatusEnum) ?? license.status)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-license-start">Start Date</Label>
              <Input id="edit-license-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-license-expiry">Expiry Date</Label>
              <Input id="edit-license-expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Auto Renew</Label>
            <Select value={autoRenew} onValueChange={(val) => setAutoRenew((val as typeof autoRenew) ?? 'no')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-license-notes">Notes</Label>
            <Textarea id="edit-license-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateLicense.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateLicense.isPending}>
              {updateLicense.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
