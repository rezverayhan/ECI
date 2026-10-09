// ECI bookings are always Dhaka wall-clock time, regardless of where the
// browser/device making the request happens to be. Bangladesh Standard Time
// is a fixed UTC+6 offset with no DST, so a literal offset suffix is correct
// and avoids relying on the browser's own timezone for interpretation.
const DHAKA_OFFSET = '+06:00'

/** Combines a <input type="date"> value and <input type="time"> value, both
 * understood as Dhaka wall-clock time, into a correct UTC ISO timestamp. */
export function dhakaInputsToIso(dateStr: string, timeStr: string): string {
  const d = new Date(`${dateStr}T${timeStr}:00${DHAKA_OFFSET}`)
  return d.toISOString()
}

export function formatDhakaDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' })
}

export function formatDhakaTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' })
}

export function formatDhakaDateTime(iso: string): string {
  return `${formatDhakaDate(iso)}, ${formatDhakaTime(iso)}`
}

export function formatDhakaRange(startIso: string, endIso: string): string {
  const sameDay = formatDhakaDate(startIso) === formatDhakaDate(endIso)
  if (sameDay) {
    return `${formatDhakaDate(startIso)} · ${formatDhakaTime(startIso)} – ${formatDhakaTime(endIso)}`
  }
  return `${formatDhakaDateTime(startIso)} – ${formatDhakaDateTime(endIso)}`
}

/** For prefilling <input type="date"/"time"> with the current Dhaka wall-clock time. */
export function nowInDhaka(): { date: string; time: string } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}
