import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useItAdministrators } from '../hooks/support-queries'
import { useAssignIssue } from '../hooks/support-mutations'

interface AssignIssueControlProps {
  issueId: string
  currentAssignedTo: string | null
}

export function AssignIssueControl({ issueId, currentAssignedTo }: AssignIssueControlProps) {
  const { data: admins = [], isPending } = useItAdministrators()
  const assign = useAssignIssue()
  const [error, setError] = useState<string | null>(null)

  async function handleChange(value: string | null) {
    if (!value) return
    const target = value === '__unassigned__' ? null : value
    setError(null)
    try {
      await assign.mutateAsync({ issueId, assignedTo: target })
    } catch {
      setError('Failed to update assignment. Please try again.')
    }
  }

  return (
    <div className="space-y-1">
      <Select
        value={currentAssignedTo ?? '__unassigned__'}
        onValueChange={handleChange}
        disabled={isPending || assign.isPending}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Unassigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__unassigned__">Unassigned</SelectItem>
          {admins.map((admin) => (
            <SelectItem key={admin.id} value={admin.id}>
              {admin.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
