import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ExternalLink } from 'lucide-react'
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
import { useAuth } from '@/features/auth/context/auth-context'
import { logAuditEvent } from '@/lib/supabase/audit'
import { ManagerCombobox } from '@/features/users/components/manager-combobox'
import { useCreateSupportIssueAsAdmin } from '../hooks/support-mutations'
import {
  uploadSupportAttachment,
  type SupportCategoryEnum,
  type SupportPriorityEnum,
  type SupportIssueRow,
} from '../api/support-api'
import { TicketAttachmentPicker } from './ticket-attachment-picker'

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { appUser, accessLevel } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  const [requesterId, setRequesterId] = useState<string | undefined>(undefined)
  const [selectedRequesterName, setSelectedRequesterName] = useState<string | undefined>(undefined)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SupportCategoryEnum>('laptop_computer')
  const [priority, setPriority] = useState<SupportPriorityEnum>('medium')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<{
    step: 'idle' | 'creating' | 'uploading'
    progress?: string
  }>({ step: 'idle' })
  const [partialFailure, setPartialFailure] = useState<{
    message: string
    issueId: string
    issueNumber: string
  } | null>(null)

  const effectiveRequesterId = isItAdmin ? (requesterId ?? appUser?.id) : appUser?.id
  const effectiveRequesterName = isItAdmin ? (selectedRequesterName ?? (requesterId ? undefined : appUser?.full_name)) : appUser?.full_name

  const createIssue = useCreateSupportIssueAsAdmin()
  const isSubmitting = uploadState.step !== 'idle'

  function reset() {
    setRequesterId(undefined)
    setSelectedRequesterName(undefined)
    setTitle('')
    setCategory('laptop_computer')
    setPriority('medium')
    setDescription('')
    setFiles([])
    setError(null)
    setPartialFailure(null)
    setUploadState({ step: 'idle' })
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (isSubmitting) return
      reset()
    }
    onOpenChange(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const targetUserId = effectiveRequesterId
    if (!targetUserId) {
      setError('Select the employee this issue is being filed for.')
      return
    }
    if (!title.trim()) {
      setError('Please provide an issue title.')
      return
    }

    setError(null)
    setPartialFailure(null)
    setUploadState({ step: 'creating' })

    let created: SupportIssueRow
    try {
      created = await createIssue.mutateAsync({
        userId: targetUserId,
        title: title.trim(),
        category,
        priority,
        description: description.trim() || null,
      })
    } catch {
      setError('Failed to create IT support issue. Please try again.')
      setUploadState({ step: 'idle' })
      return
    }

    if (files.length > 0) {
      setUploadState({ step: 'uploading', progress: `1/${files.length}` })
      const failedFiles: string[] = []
      const uploaderId = appUser?.id ?? targetUserId

      let i = 0
      for (const file of files) {
        i++
        setUploadState({ step: 'uploading', progress: `${i}/${files.length}` })
        try {
          const att = await uploadSupportAttachment({
            issueId: created.id,
            file,
            uploadedBy: uploaderId,
          })
          if (appUser && isItAdmin) {
            await logAuditEvent({
              actorUserId: appUser.id,
              action: 'ISSUE_ATTACHMENT_ADDED',
              entityType: 'support_issue_attachments',
              entityId: att.id,
              metadata: { issue_id: created.id, file_name: file.name },
            })
          }
        } catch {
          failedFiles.push(file.name)
        }
      }

      queryClient.invalidateQueries({ queryKey: ['support', 'attachments', created.id] })
      queryClient.invalidateQueries({ queryKey: ['users', 'support-issues', created.user_id] })
      queryClient.invalidateQueries({ queryKey: ['support', 'queue'] })

      if (failedFiles.length > 0) {
        setPartialFailure({
          issueId: created.id,
          issueNumber: created.issue_number,
          message: `Ticket ${created.issue_number} was created, but failed to upload: ${failedFiles.join(', ')}. You can retry attaching them from the ticket detail page.`,
        })
        setUploadState({ step: 'idle' })
        return
      }
    }

    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create IT Support Issue</DialogTitle>
          <DialogDescription>
            {isItAdmin
              ? 'File a support ticket on behalf of an employee or for yourself.'
              : 'Submit an IT support ticket associated with your account.'}
          </DialogDescription>
        </DialogHeader>

        {partialFailure ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-xs text-text">
              <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-semibold text-text">Issue Filed with Attachment Warning</p>
                <p className="mt-1 text-text-secondary leading-relaxed">
                  {partialFailure.message}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset()
                  onOpenChange(false)
                }}
              >
                Close
              </Button>
              <Button
                type="button"
                className="gap-1.5"
                onClick={() => {
                  const issueId = partialFailure.issueId
                  reset()
                  onOpenChange(false)
                  navigate(`/app/support/${issueId}`, {
                    state: { from: '/app/support', fromLabel: 'IT Support' },
                  })
                }}
              >
                <ExternalLink className="size-3.5" aria-hidden />
                View Ticket
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Requester *</Label>
              {isItAdmin ? (
                <ManagerCombobox
                  value={effectiveRequesterId}
                  onChange={(newId) => {
                    setRequesterId(newId)
                    setSelectedRequesterName(undefined)
                  }}
                  emptyLabel="Select an employee…"
                  selectedFallbackLabel="Selected employee"
                  ariaLabel="Select requester"
                  selectedName={effectiveRequesterId === appUser?.id ? appUser?.full_name : effectiveRequesterName}
                  disabled={isSubmitting}
                />
              ) : (
                <Input
                  value={
                    appUser
                      ? `${appUser.full_name}${appUser.employee_id ? ` (${appUser.employee_id})` : ''}`
                      : 'Authenticated employee'
                  }
                  disabled
                  readOnly
                  className="bg-canvas text-text font-medium cursor-not-allowed"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="queue-issue-title">Issue Title *</Label>
              <Input
                id="queue-issue-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory((val as SupportCategoryEnum) ?? 'other')}
                  disabled={isSubmitting}
                >
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
                <Select
                  value={priority}
                  onValueChange={(val) => setPriority((val as SupportPriorityEnum) ?? 'medium')}
                  disabled={isSubmitting}
                >
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
              <Textarea
                id="queue-issue-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <TicketAttachmentPicker
              files={files}
              onFilesChange={setFiles}
              disabled={isSubmitting}
            />

            {error && <p className="text-xs text-error">{error}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {uploadState.step === 'creating'
                  ? 'Filing Issue…'
                  : uploadState.step === 'uploading'
                  ? `Uploading (${uploadState.progress})…`
                  : 'Submit Ticket'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

