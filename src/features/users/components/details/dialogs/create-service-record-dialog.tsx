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
import { useCreateServiceRecord } from '../../../hooks/user-details-mutations'
import type { ServiceStatusEnum, ServiceTypeEnum } from '../../../api/user-details-api'

const SERVICE_TYPE_OPTIONS: { value: ServiceTypeEnum; label: string }[] = [
  { value: 'repair', label: 'Repair' },
  { value: 'maintenance', label: 'Routine Maintenance' },
  { value: 'diagnostic', label: 'Diagnostic Check' },
  { value: 'upgrade', label: 'Hardware Upgrade' },
  { value: 'other', label: 'General Service' },
]

const SERVICE_STATUS_OPTIONS: { value: ServiceStatusEnum; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface CreateServiceRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  deviceId: string
  deviceLabel: string
}

export function CreateServiceRecordDialog({
  open,
  onOpenChange,
  userId,
  deviceId,
  deviceLabel,
}: CreateServiceRecordDialogProps) {
  const today = new Date().toISOString().split('T')[0]!

  const [serviceDate, setServiceDate] = useState(today)
  const [serviceType, setServiceType] = useState<ServiceTypeEnum>('repair')
  const [problem, setProblem] = useState('')
  const [description, setDescription] = useState('')
  const [provider, setProvider] = useState('')
  const [serviceCenter, setServiceCenter] = useState('')
  const [technician, setTechnician] = useState('')
  const [warrantyCovered, setWarrantyCovered] = useState<'unknown' | 'yes' | 'no'>('unknown')
  const [cost, setCost] = useState('')
  const [status, setStatus] = useState<ServiceStatusEnum>('open')
  const [resolution, setResolution] = useState('')
  const [completedDate, setCompletedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createRecord = useCreateServiceRecord(userId)

  function reset() {
    setServiceDate(today)
    setServiceType('repair')
    setProblem('')
    setDescription('')
    setProvider('')
    setServiceCenter('')
    setTechnician('')
    setWarrantyCovered('unknown')
    setCost('')
    setStatus('open')
    setResolution('')
    setCompletedDate('')
    setNotes('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!serviceDate) {
      setError('Service date is required.')
      return
    }

    setError(null)
    try {
      await createRecord.mutateAsync({
        deviceId,
        serviceDate,
        serviceType,
        problem: problem.trim() || null,
        description: description.trim() || null,
        provider: provider.trim() || null,
        serviceCenter: serviceCenter.trim() || null,
        technician: technician.trim() || null,
        warrantyCovered: warrantyCovered === 'unknown' ? null : warrantyCovered === 'yes',
        cost: cost ? Number(cost) : null,
        status,
        resolution: resolution.trim() || null,
        completedDate: completedDate || null,
        notes: notes.trim() || null,
      })
      reset()
      onOpenChange(false)
    } catch {
      setError('Failed to create service record. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Service Record</DialogTitle>
          <DialogDescription>
            Record a maintenance or repair event for{' '}
            <span className="font-medium text-text">{deviceLabel}</span>. This stays attached to
            the physical device regardless of future reassignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="service-date">Service Date *</Label>
              <Input id="service-date" type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <Select value={serviceType} onValueChange={(val) => setServiceType((val as ServiceTypeEnum) ?? 'repair')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-problem">Problem</Label>
            <Input id="service-problem" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. Screen flickering" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-description">Description (Optional)</Label>
            <Textarea id="service-description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="service-provider">Provider</Label>
              <Input id="service-provider" value={provider} onChange={(e) => setProvider(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service-center">Service Center</Label>
              <Input id="service-center" value={serviceCenter} onChange={(e) => setServiceCenter(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service-technician">Technician</Label>
              <Input id="service-technician" value={technician} onChange={(e) => setTechnician(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Warranty Covered?</Label>
              <Select value={warrantyCovered} onValueChange={(val) => setWarrantyCovered((val as typeof warrantyCovered) ?? 'unknown')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">Not Recorded</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service-cost">Cost</Label>
              <Input id="service-cost" type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(val) => setStatus((val as ServiceStatusEnum) ?? 'open')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_STATUS_OPTIONS.map((opt) => (
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
              <Label htmlFor="service-completed">Completed Date</Label>
              <Input id="service-completed" type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service-resolution">Resolution</Label>
              <Input id="service-resolution" value={resolution} onChange={(e) => setResolution(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-notes">Notes (Optional)</Label>
            <Textarea id="service-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createRecord.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRecord.isPending}>
              {createRecord.isPending ? 'Saving…' : 'Log Service Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
