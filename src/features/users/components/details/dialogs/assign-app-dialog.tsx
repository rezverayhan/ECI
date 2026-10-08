import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAllApplications } from '../../../hooks/user-details-queries'
import { useAssignApplication } from '../../../hooks/user-details-mutations'
import { CreateApplicationDialog } from './create-application-dialog'

interface AssignAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  employeeName: string
}

export function AssignAppDialog({
  open,
  onOpenChange,
  userId,
  employeeName,
}: AssignAppDialogProps) {
  const { data: applications = [], isPending } = useAllApplications()
  const [selectedAppId, setSelectedAppId] = useState('')
  const [version, setVersion] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [licenseStatus, setLicenseStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const assignApp = useAssignApplication(userId)

  function reset() {
    setSelectedAppId('')
    setVersion('')
    setLicenseType('')
    setLicenseStatus('')
    setNotes('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAppId) {
      setError('Please select an application.')
      return
    }

    setError(null)
    try {
      await assignApp.mutateAsync({
        applicationId: selectedAppId,
        version: version.trim() || null,
        licenseType: licenseType.trim() || null,
        licenseStatus: licenseStatus.trim() || null,
        notes: notes.trim() || null,
      })
      reset()
      onOpenChange(false)
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
        setError('This employee already has this application assigned. Edit the existing assignment instead.')
      } else {
        setError('Failed to assign software application. Please try again.')
      }
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Software Application</DialogTitle>
          <DialogDescription>
            Grant system or application license access to{' '}
            <span className="font-medium text-text">{employeeName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Application</Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="gap-1 h-6 px-1.5 text-text-secondary hover:text-text"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-3" aria-hidden />
                Register New Application
              </Button>
            </div>
            {isPending ? (
              <p className="text-xs text-text-secondary">Loading catalog…</p>
            ) : applications.length === 0 ? (
              <p className="rounded border border-dashed border-border p-3 text-xs text-text-muted">
                No active applications configured in the directory. Use "Register New
                Application" above to add a real one.
              </p>
            ) : (
              <Select value={selectedAppId} onValueChange={(val) => setSelectedAppId(val ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose software application…" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.name} {app.vendor ? `(${app.vendor})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="app-ver">Version / Release</Label>
              <Input
                id="app-ver"
                placeholder="e.g. 2026.1 / v4.2"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="app-license">License Type</Label>
              <Input
                id="app-license"
                placeholder="e.g. Enterprise / Named User"
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-license-status">License Status</Label>
            <Input
              id="app-license-status"
              placeholder="e.g. Active"
              value={licenseStatus}
              onChange={(e) => setLicenseStatus(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-notes">Notes / Seat Reference</Label>
            <Input
              id="app-notes"
              placeholder="e.g. Assigned from IT Pool B"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assignApp.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignApp.isPending || !selectedAppId || applications.length === 0}
            >
              {assignApp.isPending ? 'Provisioning…' : 'Provision Access'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <CreateApplicationDialog
      open={createOpen}
      onOpenChange={setCreateOpen}
      onCreated={(id) => setSelectedAppId(id)}
    />
    </>
  )
}
