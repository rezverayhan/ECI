import { useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  formatFileSize,
  MAX_ATTACHMENTS_PER_TICKET,
  validateAttachmentFile,
} from '../lib/support-attachments'

interface TicketAttachmentPickerProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
}

export function TicketAttachmentPicker({
  files,
  onFilesChange,
  disabled = false,
}: TicketAttachmentPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    if (files.length + selected.length > MAX_ATTACHMENTS_PER_TICKET) {
      setError(
        `You can attach at most ${MAX_ATTACHMENTS_PER_TICKET} files per ticket (currently selected: ${files.length}).`,
      )
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const accepted: File[] = []
    const rejectedErrors: string[] = []

    for (const file of selected) {
      // Check for duplicate names already staged
      if (files.some((f) => f.name === file.name && f.size === file.size)) {
        rejectedErrors.push(`"${file.name}" is already selected.`)
        continue
      }

      const validation = validateAttachmentFile(file)
      if (!validation.valid && validation.error) {
        rejectedErrors.push(validation.error)
      } else {
        accepted.push(file)
      }
    }

    if (rejectedErrors[0]) {
      setError(rejectedErrors[0])
    }

    if (accepted.length > 0) {
      onFilesChange([...files, ...accepted])
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleRemove(index: number) {
    setError(null)
    const next = [...files]
    next.splice(index, 1)
    onFilesChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">
          Attachments (Optional)
        </span>
        <span className="text-[11px] text-text-muted">
          {files.length}/{MAX_ATTACHMENTS_PER_TICKET} files
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_ATTACHMENT_EXTENSIONS.join(',')}
        className="hidden"
        onChange={handleFileSelection}
        disabled={disabled || files.length >= MAX_ATTACHMENTS_PER_TICKET}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || files.length >= MAX_ATTACHMENTS_PER_TICKET}
          className="gap-1.5"
        >
          <Paperclip className="size-3.5" aria-hidden />
          Attach Files
        </Button>
        <span className="text-[11px] text-text-muted">
          Max 10 MB each (images, PDF, documents, logs, ZIP)
        </span>
      </div>

      {files.length > 0 && (
        <ul className="space-y-1.5 pt-1">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-canvas/60 px-2.5 py-1.5 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="size-3.5 text-text-muted shrink-0" aria-hidden />
                <span className="truncate text-text font-medium">{file.name}</span>
                <span className="text-text-muted shrink-0 text-[11px]">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => handleRemove(idx)}
                disabled={disabled}
                title={`Remove ${file.name}`}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 text-text-muted hover:text-error"
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
