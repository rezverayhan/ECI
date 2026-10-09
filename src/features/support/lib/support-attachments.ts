export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB per file
export const MAX_ATTACHMENTS_PER_TICKET = 5

export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.pdf',
  '.txt',
  '.csv',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.zip',
] as const

export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateAttachmentFile(file: File): { valid: boolean; error?: string } {
  if (file.size === 0) {
    return { valid: false, error: `"${file.name}" is empty (0 bytes).` }
  }
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" (${formatFileSize(file.size)}) exceeds the maximum allowed size of 10 MB.`,
    }
  }

  const dotIndex = file.name.lastIndexOf('.')
  const extension = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : ''
  const isAllowed = ALLOWED_ATTACHMENT_EXTENSIONS.includes(
    extension as (typeof ALLOWED_ATTACHMENT_EXTENSIONS)[number],
  )

  if (!isAllowed) {
    return {
      valid: false,
      error: `"${file.name}" has an unsupported format. Allowed: images (PNG, JPG, WEBP, GIF), documents (PDF, DOCX, XLSX, TXT, CSV), and ZIP archives.`,
    }
  }

  return { valid: true }
}
