import { useRef, useState } from 'react'
import { Paperclip, Download, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSupportIssueAttachments } from '../hooks/support-queries'
import { useDeleteAttachment, useUploadAttachment } from '../hooks/support-mutations'
import { getAttachmentSignedUrl } from '../api/support-api'

interface AttachmentsPanelProps {
  issueId: string
  isItAdmin: boolean
  canUpload: boolean
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentsPanel({ issueId, isItAdmin, canUpload }: AttachmentsPanelProps) {
  const { data: attachments = [], isPending } = useSupportIssueAttachments(issueId)
  const upload = useUploadAttachment(issueId)
  const remove = useDeleteAttachment(issueId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      await upload.mutateAsync(file)
    } catch {
      setError('Failed to upload attachment. Please try again.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDownload(storagePath: string, attachmentId: string) {
    setDownloadingId(attachmentId)
    try {
      const url = await getAttachmentSignedUrl(storagePath)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Failed to generate a download link. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleDelete(attachmentId: string, storagePath: string, fileName: string) {
    setError(null)
    try {
      await remove.mutateAsync({ attachmentId, storagePath, fileName })
    } catch {
      setError('Failed to remove attachment. Please try again.')
    }
  }

  if (isPending) {
    return <p className="text-xs text-text-secondary">Loading attachments…</p>
  }

  return (
    <div className="space-y-2">
      {attachments.length === 0 ? (
        <p className="text-xs text-text-secondary">No attachments on this issue.</p>
      ) : (
        <ul className="space-y-1.5">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-canvas/40 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="size-3.5 text-text-muted shrink-0" aria-hidden />
                <span className="truncate text-text font-medium">{att.file_name}</span>
                <span className="text-text-muted shrink-0">{formatFileSize(att.file_size)}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => handleDownload(att.storage_path, att.id)}
                  disabled={downloadingId === att.id}
                  title="Download"
                >
                  <Download className="size-3.5" aria-hidden />
                </Button>
                {isItAdmin && (
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => handleDelete(att.id, att.storage_path, att.file_name)}
                    disabled={remove.isPending}
                    className="text-text-muted hover:text-error"
                    title="Remove"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canUpload && (
        <div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
            className="gap-1.5"
          >
            <Upload className="size-3.5" aria-hidden />
            {upload.isPending ? 'Uploading…' : 'Attach File'}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
