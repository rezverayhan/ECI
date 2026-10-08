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
import { useReleaseIpPhone } from '../../../hooks/user-details-mutations'

interface ReleaseIpPhoneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  assignmentId: string
  extensionLabel: string
}

export function ReleaseIpPhoneDialog({
  open,
  onOpenChange,
  userId,
  assignmentId,
  extensionLabel,
}: ReleaseIpPhoneDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const releasePhone = useReleaseIpPhone(userId)

  async function handleConfirm() {
    setError(null)
    try {
      await releasePhone.mutateAsync({ assignmentId })
      onOpenChange(false)
    } catch {
      setError('Failed to release this extension. Please try again.')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Release IP Phone Extension?</AlertDialogTitle>
          <AlertDialogDescription>
            This will release <span className="font-semibold text-text">Ext {extensionLabel}</span>{' '}
            back to the available pool. The assignment history will be preserved.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-xs text-error">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={releasePhone.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={releasePhone.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {releasePhone.isPending ? 'Releasing…' : 'Release Extension'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
