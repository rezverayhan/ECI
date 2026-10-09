import { useState } from 'react'
import { AlertTriangle, Archive } from 'lucide-react'
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
import { useRetirePrinter } from '../../../hooks/user-details-mutations'
import { PRINTER_RETIREMENT_REASONS } from '../details-types'

interface RetirePrinterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  assignmentId: string
  printerId: string
  printerLabel: string
  employeeName: string
}

export function RetirePrinterDialog({
  open,
  onOpenChange,
  userId,
  assignmentId,
  printerId,
  printerLabel,
  employeeName,
}: RetirePrinterDialogProps) {
  const [reason, setReason] = useState<string>(PRINTER_RETIREMENT_REASONS[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const retirePrinterMutation = useRetirePrinter(userId)

  function resetAndClose() {
    setReason(PRINTER_RETIREMENT_REASONS[0])
    setNotes('')
    setError(null)
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await retirePrinterMutation.mutateAsync({
        assignmentId,
        printerId,
        reason,
        notes: notes.trim() || null,
      })
      resetAndClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retire printer. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : resetAndClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Archive className="size-5" aria-hidden />
            <DialogTitle>Retire Printer</DialogTitle>
          </div>
          <DialogDescription>
            Permanently transition <span className="font-semibold text-text">{printerLabel}</span> to
            retired status.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-md border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-text">
          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" aria-hidden />
          <div className="space-y-1">
            <span className="font-semibold text-text block">Consequence & Lifecycle Impact</span>
            <p className="text-text-secondary leading-relaxed">
              This asset is currently assigned to <strong className="text-text">{employeeName}</strong>.
              Retiring will end the assignment, preserve the full assignment history, and remove the
              printer from operational availability — it can never be reassigned afterward.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="printer-retire-reason">Retirement Reason</Label>
            <Select value={reason} onValueChange={(val) => setReason(val ?? PRINTER_RETIREMENT_REASONS[0])}>
              <SelectTrigger id="printer-retire-reason" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRINTER_RETIREMENT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="printer-retire-notes">Decommissioning Notes (Optional)</Label>
            <Textarea
              id="printer-retire-notes"
              rows={2}
              placeholder="e.g. Fuser assembly failure, not cost-effective to repair"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={retirePrinterMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={retirePrinterMutation.isPending}>
              {retirePrinterMutation.isPending ? 'Processing…' : 'Confirm Retirement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
