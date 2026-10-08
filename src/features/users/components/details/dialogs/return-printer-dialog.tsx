import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useReturnPrinter } from '../../../hooks/user-details-mutations'
import type { UserCurrentPrinterData } from '../../../api/user-details-api'

interface ReturnPrinterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  currentPrinter: UserCurrentPrinterData
}

export function ReturnPrinterDialog({
  open,
  onOpenChange,
  userId,
  currentPrinter,
}: ReturnPrinterDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const returnPrinterMutation = useReturnPrinter(userId)

  async function handleConfirm() {
    setError(null)
    try {
      await returnPrinterMutation.mutateAsync({
        assignmentId: currentPrinter.id,
        printerId: currentPrinter.printer_id,
      })
      onOpenChange(false)
    } catch {
      setError('Failed to return printer. Please try again.')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Return Printer Assignment?</AlertDialogTitle>
          <AlertDialogDescription>
            This will release <span className="font-semibold text-text">{currentPrinter.printer.printer_name} ({currentPrinter.printer.asset_id})</span> back
            to the available inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-xs text-error">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={returnPrinterMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={returnPrinterMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {returnPrinterMutation.isPending ? 'Processing…' : 'Confirm Return'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
