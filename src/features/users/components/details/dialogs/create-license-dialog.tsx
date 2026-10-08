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
import { useCreateUserLicense } from '../../../hooks/user-details-mutations'
import type { LicenseStatusEnum } from '../../../api/user-details-api'

const STATUS_OPTIONS: { value: LicenseStatusEnum; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'due', label: 'Due' },
  { value: 'expired', label: 'Expired' },
]

interface CreateLicenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  employeeName: string
}

export function CreateLicenseDialog({ open, onOpenChange, userId, employeeName }: CreateLicenseDialogProps) {
  const [licenseName, setLicenseName] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [status, setStatus] = useState<LicenseStatusEnum>('active')
  const [startDate, setStartDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [autoRenew, setAutoRenew] = useState<'yes' | 'no'>('no')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createLicense = useCreateUserLicense(userId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!licenseName.trim()) {
      setError('License name is required.')
      return
    }

    setError(null)
    try {
      await createLicense.mutateAsync({
        licenseName: licenseName.trim(),
        licenseType: licenseType.trim() || null,
        status,
        startDate: startDate || null,
        expiryDate: expiryDate || null,
        autoRenew: autoRenew === 'yes',
        notes: notes.trim() || null,
      })
      onOpenChange(false)
    } catch {
      setError('Failed to create license record. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Account License</DialogTitle>
          <DialogDescription>
            Record a real account-level license for{' '}
            <span className="font-medium text-text">{employeeName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="license-name">License Name *</Label>
            <Input id="license-name" value={licenseName} onChange={(e) => setLicenseName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="license-type">License Type</Label>
              <Input id="license-type" value={licenseType} onChange={(e) => setLicenseType(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(val) => setStatus((val as LicenseStatusEnum) ?? 'active')}>
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
              <Label htmlFor="license-start">Start Date</Label>
              <Input id="license-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="license-expiry">Expiry Date</Label>
              <Input id="license-expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
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
            <Label htmlFor="license-notes">Notes (Optional)</Label>
            <Textarea id="license-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createLicense.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLicense.isPending}>
              {createLicense.isPending ? 'Creating…' : 'Create License'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
