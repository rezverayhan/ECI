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
import { useReleaseIpAddress } from '../../../hooks/user-details-mutations'
import type { UserCurrentNetworkData } from '../../../api/user-details-api'

interface ReleaseIpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  currentNetwork: UserCurrentNetworkData
}

export function ReleaseIpDialog({
  open,
  onOpenChange,
  userId,
  currentNetwork,
}: ReleaseIpDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const releaseIpMutation = useReleaseIpAddress(userId)

  async function handleConfirm() {
    setError(null)
    try {
      await releaseIpMutation.mutateAsync({
        assignmentId: currentNetwork.id,
        ipAddressId: currentNetwork.ip_address_id,
      })
      onOpenChange(false)
    } catch {
      setError('Failed to release IP address. Please try again.')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Release IP Address Allocation?</AlertDialogTitle>
          <AlertDialogDescription>
            This will release <span className="font-semibold text-text">{String(currentNetwork.ip_address.ip_address)}</span> back
            to the available IP pool. Network connectivity settings for this employee will be marked unassigned.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-xs text-error">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={releaseIpMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={releaseIpMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {releaseIpMutation.isPending ? 'Releasing…' : 'Release IP'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
