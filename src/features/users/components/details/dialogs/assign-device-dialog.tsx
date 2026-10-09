import { useState } from 'react'
import { Plus, Archive } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAvailableDevices } from '../../../hooks/user-details-queries'
import { useAssignDevice, useReplaceDevice } from '../../../hooks/user-details-mutations'
import { DEVICE_REPLACEMENT_REASONS } from '../details-types'
import { CreateDeviceDialog } from './create-device-dialog'
import { RetireDeviceDialog } from './retire-device-dialog'

interface AssignDeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  employeeName: string
  /** When set, this is a Replace flow: the current assignment is closed before the new one is created. */
  replacing?: {
    assignmentId: string
    deviceId: string
    deviceLabel: string
  }
}

export function AssignDeviceDialog({
  open,
  onOpenChange,
  userId,
  employeeName,
  replacing,
}: AssignDeviceDialogProps) {
  const { data: availableDevices = [], isPending } = useAvailableDevices()
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [reason, setReason] = useState<string>(DEVICE_REPLACEMENT_REASONS[0])
  const [error, setError] = useState<string | null>(null)
  const [createDeviceOpen, setCreateDeviceOpen] = useState(false)
  const [retireDialogOpen, setRetireDialogOpen] = useState(false)

  const selectedDevice = availableDevices.find((d) => d.id === selectedDeviceId)

  const assignDevice = useAssignDevice(userId)
  const replaceDevice = useReplaceDevice(userId)
  const isPendingSubmit = replacing ? replaceDevice.isPending : assignDevice.isPending

  function resetAndClose() {
    setSelectedDeviceId('')
    setNotes('')
    setReason(DEVICE_REPLACEMENT_REASONS[0])
    setError(null)
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDeviceId) {
      setError('Please select an available device.')
      return
    }

    setError(null)
    try {
      if (replacing) {
        await replaceDevice.mutateAsync({
          oldAssignmentId: replacing.assignmentId,
          oldDeviceId: replacing.deviceId,
          newDeviceId: selectedDeviceId,
          replacementReason: reason,
          notes: notes.trim() || null,
        })
      } else {
        await assignDevice.mutateAsync({
          deviceId: selectedDeviceId,
          notes: notes.trim() || null,
        })
      }
      resetAndClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign device. Please try again.')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : resetAndClose())}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{replacing ? 'Replace Physical Device' : 'Assign Physical Device'}</DialogTitle>
            <DialogDescription>
              {replacing ? (
                <>
                  Select a replacement for{' '}
                  <span className="font-medium text-text">{replacing.deviceLabel}</span>. The
                  current assignment will be closed and preserved in device history.
                </>
              ) : (
                <>
                  Select an available device from the IT asset registry for{' '}
                  <span className="font-medium text-text">{employeeName}</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {replacing && (
              <div className="space-y-1.5">
                <Label>Replacement Reason</Label>
                <Select value={reason} onValueChange={(val) => setReason(val ?? DEVICE_REPLACEMENT_REASONS[0])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_REPLACEMENT_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Select Available Device</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="gap-1 h-6 px-1.5 text-text-secondary hover:text-text"
                  onClick={() => setCreateDeviceOpen(true)}
                >
                  <Plus className="size-3" aria-hidden />
                  Register New Device
                </Button>
              </div>
              {isPending ? (
                <p className="text-xs text-text-secondary">Loading available devices…</p>
              ) : availableDevices.length === 0 ? (
                <p className="rounded border border-dashed border-border p-3 text-xs text-text-muted">
                  No available devices are currently ready for assignment. Use "Register New
                  Device" above to add a real asset to the inventory.
                </p>
              ) : (
                <Select value={selectedDeviceId} onValueChange={(val) => setSelectedDeviceId(val ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a hardware asset…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDevices.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id}>
                        {dev.brand ? `${dev.brand} ` : ''}{dev.model} ({dev.asset_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedDevice && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-text-muted">Selected: {selectedDevice.asset_id}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="gap-1 h-6 px-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setRetireDialogOpen(true)}
                  >
                    <Archive className="size-3" aria-hidden />
                    Retire Asset from Inventory
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="device-notes">{replacing ? 'Handover Notes (Optional)' : 'Assignment Notes (Optional)'}</Label>
              <Textarea
                id="device-notes"
                rows={2}
                placeholder="e.g. Upgraded configuration or replacement laptop"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-error">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetAndClose} disabled={isPendingSubmit}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPendingSubmit || !selectedDeviceId || availableDevices.length === 0}>
                {isPendingSubmit ? 'Saving…' : replacing ? 'Replace Device' : 'Assign Device'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CreateDeviceDialog
        open={createDeviceOpen}
        onOpenChange={setCreateDeviceOpen}
        onCreated={(deviceId) => setSelectedDeviceId(deviceId)}
      />

      {selectedDevice && (
        <RetireDeviceDialog
          open={retireDialogOpen}
          onOpenChange={setRetireDialogOpen}
          device={selectedDevice}
          onSuccess={() => {
            setSelectedDeviceId('')
          }}
        />
      )}
    </>
  )
}
