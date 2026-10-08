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
import { useSaveMachineProfile } from '../../../hooks/user-details-mutations'
import type { MachineProfileRow } from '../../../api/user-details-api'

interface EditMachineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  employeeName: string
  currentMachine: MachineProfileRow | null | undefined
}

function EditMachineForm({
  userId,
  currentMachine,
  onClose,
}: {
  userId: string
  currentMachine: MachineProfileRow | null | undefined
  onClose: () => void
}) {
  const [machineName, setMachineName] = useState(
    currentMachine?.machine_name || `ECI-${userId.slice(0, 8).toUpperCase()}`,
  )
  const [os, setOs] = useState(
    currentMachine?.operating_system || 'Windows 11 Enterprise',
  )
  const [status, setStatus] = useState(currentMachine?.status || 'active')
  const [notes, setNotes] = useState(currentMachine?.notes || '')
  const [error, setError] = useState<string | null>(null)

  const saveMachine = useSaveMachineProfile(userId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!machineName.trim()) {
      setError('Machine Name is required.')
      return
    }

    setError(null)
    try {
      await saveMachine.mutateAsync({
        machineName: machineName.trim(),
        operatingSystem: os.trim() || null,
        status,
        notes: notes.trim() || null,
      })
      onClose()
    } catch {
      setError('Failed to update machine profile. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="machine-name">Machine Hostname / Identifier</Label>
        <Input
          id="machine-name"
          placeholder="e.g. ECI-LT-Y37311"
          value={machineName}
          onChange={(e) => setMachineName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="machine-os">Operating System</Label>
          <Input
            id="machine-os"
            placeholder="e.g. Windows 11 Enterprise, macOS Sonoma"
            value={os}
            onChange={(e) => setOs(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Machine Status</Label>
          <Select value={status} onValueChange={(val) => setStatus(val ?? 'active')}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="provisioning">Provisioning</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="machine-notes">Configuration Notes (Optional)</Label>
        <Textarea
          id="machine-notes"
          rows={2}
          placeholder="e.g. Domain joined to ECI-CORP, BitLocker enabled"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={saveMachine.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saveMachine.isPending}>
          {saveMachine.isPending ? 'Saving…' : 'Save Machine Identity'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function EditMachineDialog({
  open,
  onOpenChange,
  userId,
  employeeName,
  currentMachine,
}: EditMachineDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{currentMachine ? 'Edit Machine Profile' : 'Configure Machine Identity'}</DialogTitle>
          <DialogDescription>
            Configure the logical machine identity for{' '}
            <span className="font-medium text-text">{employeeName}</span>. This is independent of the physical hardware asset.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <EditMachineForm
            userId={userId}
            currentMachine={currentMachine}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
