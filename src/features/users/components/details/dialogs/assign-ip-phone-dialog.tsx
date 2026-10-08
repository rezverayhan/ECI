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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAvailableIpPhones } from '../../../hooks/user-details-queries'
import { useAssignIpPhone, useReassignIpPhone } from '../../../hooks/user-details-mutations'
import { CreateIpPhoneDialog } from './create-ip-phone-dialog'

interface AssignIpPhoneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  employeeName: string
  /** When set, this is a Change/Reassign flow: the current assignment is closed before the new one is created. */
  reassigning?: {
    assignmentId: string
    extensionLabel: string
  }
}

export function AssignIpPhoneDialog({
  open,
  onOpenChange,
  userId,
  employeeName,
  reassigning,
}: AssignIpPhoneDialogProps) {
  const { data: availablePhones = [], isPending } = useAvailableIpPhones()
  const [selectedPhoneId, setSelectedPhoneId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const assignPhone = useAssignIpPhone(userId)
  const reassignPhone = useReassignIpPhone(userId)
  const isPendingSubmit = reassigning ? reassignPhone.isPending : assignPhone.isPending

  function resetAndClose() {
    setSelectedPhoneId('')
    setNotes('')
    setError(null)
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPhoneId) {
      setError('Please select an available extension.')
      return
    }

    setError(null)
    try {
      if (reassigning) {
        await reassignPhone.mutateAsync({
          oldAssignmentId: reassigning.assignmentId,
          newIpPhoneId: selectedPhoneId,
          notes: notes.trim() || null,
        })
      } else {
        await assignPhone.mutateAsync({
          ipPhoneId: selectedPhoneId,
          notes: notes.trim() || null,
        })
      }
      resetAndClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign extension. Please try again.')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : resetAndClose())}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{reassigning ? 'Change IP Phone Extension' : 'Assign IP Phone Extension'}</DialogTitle>
            <DialogDescription>
              {reassigning ? (
                <>
                  Select a replacement for{' '}
                  <span className="font-medium text-text">{reassigning.extensionLabel}</span>. The
                  current assignment will be released and preserved in history.
                </>
              ) : (
                <>
                  Allocate an extension to{' '}
                  <span className="font-medium text-text">{employeeName}</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Available Extension</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="gap-1 h-6 px-1.5 text-text-secondary hover:text-text"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="size-3" aria-hidden />
                  Register New Extension
                </Button>
              </div>
              {isPending ? (
                <p className="text-xs text-text-secondary">Loading available extensions…</p>
              ) : availablePhones.length === 0 ? (
                <p className="rounded border border-dashed border-border p-3 text-xs text-text-muted">
                  No available IP Phone extensions are currently ready for assignment. Use
                  "Register New Extension" above if a real, unregistered extension exists.
                </p>
              ) : (
                <Select value={selectedPhoneId} onValueChange={(val) => setSelectedPhoneId(val ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an extension…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePhones.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        Ext {p.extension} {p.department ? `(${p.department.name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone-assign-notes">{reassigning ? 'Change Notes (Optional)' : 'Assignment Notes (Optional)'}</Label>
              <Textarea
                id="phone-assign-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-error">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetAndClose} disabled={isPendingSubmit}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPendingSubmit || !selectedPhoneId || availablePhones.length === 0}>
                {isPendingSubmit ? 'Saving…' : reassigning ? 'Change Extension' : 'Assign Extension'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CreateIpPhoneDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => setSelectedPhoneId(id)}
      />
    </>
  )
}
