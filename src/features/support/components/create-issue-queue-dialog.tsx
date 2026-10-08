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
import { ManagerCombobox } from '@/features/users/components/manager-combobox'
import { useCreateSupportIssueAsAdmin } from '../hooks/support-mutations'
import type { SupportCategoryEnum, SupportPriorityEnum } from '../api/support-api'

const CATEGORY_OPTIONS: { value: SupportCategoryEnum; label: string }[] = [
  { value: 'laptop_computer', label: 'Laptop / Computer Hardware' },
  { value: 'software', label: 'Software / Application' },
  { value: 'network_lan', label: 'Network / LAN / Wi-Fi' },
  { value: 'internet', label: 'Internet' },
  { value: 'ip_address', label: 'IP Address / Configuration' },
  { value: 'ip_phone', label: 'IP Phone / Extension' },
  { value: 'printer_peripheral', label: 'Printer / Peripheral' },
  { value: 'access', label: 'Account / Access / Password' },
  { value: 'hardware', label: 'General Hardware' },
  { value: 'other', label: 'Other IT Inquiry' },
]

const PRIORITY_OPTIONS: { value: SupportPriorityEnum; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

interface CreateIssueQueueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateIssueQueueDialog({ open, onOpenChange }: CreateIssueQueueDialogProps) {
  const [requesterId, setRequesterId] = useState<string | undefined>(undefined)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SupportCategoryEnum>('laptop_computer')
  const [priority, setPriority] = useState<SupportPriorityEnum>('medium')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createIssue = useCreateSupportIssueAsAdmin()

  function reset() {
    setRequesterId(undefined)
    setTitle('')
    setCategory('laptop_computer')
    setPriority('medium')
    setDescription('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!requesterId) {
      setError('Select the employee this issue is being filed for.')
      return
    }
    if (!title.trim()) {
      setError('Please provide an issue title.')
      return
    }

    setError(null)
    try {
      await createIssue.mutateAsync({
        userId: requesterId,
        title: title.trim(),
        category,
        priority,
        description: description.trim() || null,
      })
      reset()
      onOpenChange(false)
    } catch {
      setError('Failed to create IT support issue. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create IT Support Issue</DialogTitle>
          <DialogDescription>File a ticket on behalf of an employee.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Requester *</Label>
            <ManagerCombobox value={requesterId} onChange={setRequesterId} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="queue-issue-title">Issue Title *</Label>
            <Input id="queue-issue-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(val) => setCategory((val as SupportCategoryEnum) ?? 'other')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority((val as SupportPriorityEnum) ?? 'medium')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((pri) => (
                    <SelectItem key={pri.value} value={pri.value}>
                      {pri.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="queue-issue-desc">Description (Optional)</Label>
            <Textarea id="queue-issue-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createIssue.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createIssue.isPending}>
              {createIssue.isPending ? 'Filing Issue…' : 'Submit Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
