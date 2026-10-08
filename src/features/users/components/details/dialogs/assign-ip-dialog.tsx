import { useState } from 'react'
import { Network } from 'lucide-react'
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
import { useAvailableIpAddresses } from '../../../hooks/user-details-queries'
import { useAssignIpAddress, useReassignIpAddress } from '../../../hooks/user-details-mutations'
import { IpPoolDialog } from './ip-pool-dialog'

interface AssignIpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  employeeName: string
  /** When set, this is a Change/Reassign flow: the current assignment is closed before the new one is created. */
  reassigning?: {
    assignmentId: string
    ipAddressId: string
    ipAddressLabel: string
  }
}

export function AssignIpDialog({
  open,
  onOpenChange,
  userId,
  employeeName,
  reassigning,
}: AssignIpDialogProps) {
  const { data: availableIps = [], isPending } = useAvailableIpAddresses()
  const [selectedIpId, setSelectedIpId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [poolOpen, setPoolOpen] = useState(false)

  const assignIp = useAssignIpAddress(userId)
  const reassignIp = useReassignIpAddress(userId)
  const isPendingSubmit = reassigning ? reassignIp.isPending : assignIp.isPending

  function resetAndClose() {
    setSelectedIpId('')
    setNotes('')
    setError(null)
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedIpId) {
      setError('Please select an available IP address.')
      return
    }

    setError(null)
    try {
      if (reassigning) {
        await reassignIp.mutateAsync({
          oldAssignmentId: reassigning.assignmentId,
          oldIpAddressId: reassigning.ipAddressId,
          newIpAddressId: selectedIpId,
          notes: notes.trim() || null,
        })
      } else {
        await assignIp.mutateAsync({
          ipAddressId: selectedIpId,
          notes: notes.trim() || null,
        })
      }
      resetAndClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign IP address. Please try again.')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : resetAndClose())}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{reassigning ? 'Change Network IP' : 'Assign Network IP'}</DialogTitle>
            <DialogDescription>
              {reassigning ? (
                <>
                  Select a replacement for{' '}
                  <span className="font-medium text-text">{reassigning.ipAddressLabel}</span>. The
                  current allocation will be released and preserved in IP history.
                </>
              ) : (
                <>
                  Allocate a static IP address to{' '}
                  <span className="font-medium text-text">{employeeName}</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Available IP Address</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="gap-1 h-6 px-1.5 text-text-secondary hover:text-text"
                  onClick={() => setPoolOpen(true)}
                >
                  <Network className="size-3" aria-hidden />
                  Manage IP Pool
                </Button>
              </div>
              {isPending ? (
                <p className="text-xs text-text-secondary">Loading available IPs…</p>
              ) : availableIps.length === 0 ? (
                <p className="rounded border border-dashed border-border p-3 text-xs text-text-muted">
                  No free IP addresses are currently available for assignment. Use "Manage IP
                  Pool" above to initialize the approved range.
                </p>
              ) : (
                <Select value={selectedIpId} onValueChange={(val) => setSelectedIpId(val ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an IP address…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIps.map((ip) => (
                      <SelectItem key={ip.id} value={ip.id}>
                        {String(ip.ip_address)} {ip.notes ? `(${ip.notes})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ip-notes">{reassigning ? 'Change Notes (Optional)' : 'Assignment Notes (Optional)'}</Label>
              <Textarea
                id="ip-notes"
                rows={2}
                placeholder="e.g. Workstation subnet or dedicated dev port"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-error">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetAndClose} disabled={isPendingSubmit}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPendingSubmit || !selectedIpId || availableIps.length === 0}>
                {isPendingSubmit ? 'Saving…' : reassigning ? 'Change IP' : 'Allocate IP'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <IpPoolDialog open={poolOpen} onOpenChange={setPoolOpen} />
    </>
  )
}
