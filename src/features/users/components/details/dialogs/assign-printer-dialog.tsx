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
import { useAvailablePrinters } from '../../../hooks/user-details-queries'
import { useAssignPrinter, useReplacePrinter } from '../../../hooks/user-details-mutations'
import { CreatePrinterDialog } from './create-printer-dialog'

interface AssignPrinterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  employeeName: string
  /** When set, this is a Replace flow: the current assignment is closed before the new one is created. */
  replacing?: {
    assignmentId: string
    printerId: string
    printerLabel: string
  }
}

export function AssignPrinterDialog({
  open,
  onOpenChange,
  userId,
  employeeName,
  replacing,
}: AssignPrinterDialogProps) {
  const { data: availablePrinters = [], isPending } = useAvailablePrinters()
  const [selectedPrinterId, setSelectedPrinterId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const assignPrinter = useAssignPrinter(userId)
  const replacePrinter = useReplacePrinter(userId)
  const isPendingSubmit = replacing ? replacePrinter.isPending : assignPrinter.isPending

  function resetAndClose() {
    setSelectedPrinterId('')
    setNotes('')
    setError(null)
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPrinterId) {
      setError('Please select an available printer.')
      return
    }

    setError(null)
    try {
      if (replacing) {
        await replacePrinter.mutateAsync({
          oldAssignmentId: replacing.assignmentId,
          oldPrinterId: replacing.printerId,
          newPrinterId: selectedPrinterId,
          notes: notes.trim() || null,
        })
      } else {
        await assignPrinter.mutateAsync({
          printerId: selectedPrinterId,
          notes: notes.trim() || null,
        })
      }
      resetAndClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign printer. Please try again.')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : resetAndClose())}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{replacing ? 'Replace Printer' : 'Assign Printer Access'}</DialogTitle>
            <DialogDescription>
              {replacing ? (
                <>
                  Select a replacement for{' '}
                  <span className="font-medium text-text">{replacing.printerLabel}</span>. The
                  current assignment will be returned and preserved in history.
                </>
              ) : (
                <>
                  Assign an available printer asset for{' '}
                  <span className="font-medium text-text">{employeeName}</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Available Printer</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="gap-1 h-6 px-1.5 text-text-secondary hover:text-text"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="size-3" aria-hidden />
                  Register New Printer
                </Button>
              </div>
              {isPending ? (
                <p className="text-xs text-text-secondary">Loading available printers…</p>
              ) : availablePrinters.length === 0 ? (
                <p className="rounded border border-dashed border-border p-3 text-xs text-text-muted">
                  No available printers are currently ready for assignment. Use "Register New
                  Printer" above to add a real asset to the inventory.
                </p>
              ) : (
                <Select value={selectedPrinterId} onValueChange={(val) => setSelectedPrinterId(val ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a printer asset…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrinters.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.printer_name} ({p.asset_id}) {p.model ? `- ${p.model}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="printer-notes">{replacing ? 'Handover Notes (Optional)' : 'Notes (Optional)'}</Label>
              <Textarea
                id="printer-notes"
                rows={2}
                placeholder="e.g. Floor 3 departmental access or dedicated desktop unit"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-error">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetAndClose} disabled={isPendingSubmit}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPendingSubmit || !selectedPrinterId || availablePrinters.length === 0}>
                {isPendingSubmit ? 'Saving…' : replacing ? 'Replace Printer' : 'Assign Printer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CreatePrinterDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => setSelectedPrinterId(id)}
      />
    </>
  )
}
