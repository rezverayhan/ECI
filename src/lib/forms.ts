/** Converts an empty/whitespace-only form string to null for nullable DB columns. */
export function emptyToNull(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}
