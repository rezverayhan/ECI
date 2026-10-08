import { Badge } from '@/components/ui/badge'
import type { UserRow } from '../types'

const STATUS_CONFIG: Record<
  UserRow['employment_status'],
  { label: string; className: string }
> = {
  active: { label: 'Active', className: 'bg-primary-soft text-success border-transparent' },
  inactive: { label: 'Inactive', className: 'bg-canvas text-text-secondary border-border' },
  resigned: { label: 'Resigned', className: 'bg-canvas text-text-muted border-border' },
}

// Never color-only: the label text itself always communicates the status
// (Content Guidelines, accessibility requirements across every task).
export function UserStatusBadge({ status }: { status: UserRow['employment_status'] }) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={config.className}>
      <span
        className={
          status === 'active'
            ? 'size-1.5 rounded-full bg-success'
            : status === 'inactive'
              ? 'size-1.5 rounded-full bg-warning'
              : 'size-1.5 rounded-full bg-text-muted'
        }
        aria-hidden
      />
      {config.label}
    </Badge>
  )
}
