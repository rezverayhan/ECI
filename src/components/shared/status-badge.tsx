import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type EntityStatusType =
  // User statuses
  | 'active'
  | 'inactive'
  | 'resigned'
  // Device statuses
  | 'assigned'
  | 'available'
  | 'under_service'
  | 'returned'
  | 'retired'
  // Support statuses
  | 'submitted'
  | 'acknowledged'
  | 'in_progress'
  | 'waiting_on_hold'
  | 'resolved'
  | 'closed'
  // Support priorities
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  // License & Warranty
  | 'upcoming'
  | 'due'
  | 'expired'
  // Booking statuses
  | 'confirmed'
  | 'pending'
  | 'paused'
  | 'cancelled'
  | 'denied'
  | 'completed'
  // IP address statuses
  | 'free'
  | 'reserved'
  | 'unavailable'

interface StatusMeta {
  label: string
  dotClass: string
  badgeClass: string
}

const STATUS_MAP: Record<string, StatusMeta> = {
  // User
  active: {
    label: 'Active',
    dotClass: 'bg-success',
    badgeClass: 'bg-primary-soft text-success border-transparent',
  },
  inactive: {
    label: 'Inactive',
    dotClass: 'bg-warning',
    badgeClass: 'bg-canvas text-text-secondary border-border',
  },
  resigned: {
    label: 'Resigned',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-muted border-border',
  },

  // Device
  assigned: {
    label: 'Assigned',
    dotClass: 'bg-success',
    badgeClass: 'bg-primary-soft text-success border-transparent',
  },
  available: {
    label: 'Available',
    dotClass: 'bg-primary',
    badgeClass: 'bg-primary-soft text-primary border-transparent',
  },
  under_service: {
    label: 'Under Service',
    dotClass: 'bg-warning',
    badgeClass: 'bg-canvas text-warning border-border',
  },
  returned: {
    label: 'Returned',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-secondary border-border',
  },
  retired: {
    label: 'Retired',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-muted border-border',
  },

  // Support Statuses
  submitted: {
    label: 'Submitted',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-secondary border-border',
  },
  acknowledged: {
    label: 'Acknowledged',
    dotClass: 'bg-primary',
    badgeClass: 'bg-primary-soft text-primary border-transparent',
  },
  in_progress: {
    label: 'In Progress',
    dotClass: 'bg-warning',
    badgeClass: 'bg-canvas text-warning border-border',
  },
  waiting_on_hold: {
    label: 'Waiting / On Hold',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-muted border-border',
  },
  resolved: {
    label: 'Resolved',
    dotClass: 'bg-success',
    badgeClass: 'bg-primary-soft text-success border-transparent',
  },
  closed: {
    label: 'Closed',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-secondary border-border',
  },

  // Priorities
  low: {
    label: 'Low',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-secondary border-border',
  },
  medium: {
    label: 'Medium',
    dotClass: 'bg-primary',
    badgeClass: 'bg-primary-soft text-primary border-transparent',
  },
  high: {
    label: 'High',
    dotClass: 'bg-warning',
    badgeClass: 'bg-canvas text-warning border-border',
  },
  urgent: {
    label: 'Urgent',
    dotClass: 'bg-error',
    badgeClass: 'bg-canvas text-error border-border',
  },

  // License / Warranty
  upcoming: {
    label: 'Upcoming',
    dotClass: 'bg-primary',
    badgeClass: 'bg-primary-soft text-primary border-transparent',
  },
  due: {
    label: 'Due',
    dotClass: 'bg-warning',
    badgeClass: 'bg-canvas text-warning border-border',
  },
  expired: {
    label: 'Expired',
    dotClass: 'bg-error',
    badgeClass: 'bg-canvas text-error border-border',
  },

  // Booking
  confirmed: {
    label: 'Confirmed',
    dotClass: 'bg-success',
    badgeClass: 'bg-primary-soft text-success border-transparent',
  },
  pending: {
    label: 'Pending',
    dotClass: 'bg-warning',
    badgeClass: 'bg-canvas text-warning border-border',
  },
  paused: {
    label: 'Paused',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-muted border-border',
  },
  cancelled: {
    label: 'Cancelled',
    dotClass: 'bg-error',
    badgeClass: 'bg-canvas text-error border-border',
  },
  denied: {
    label: 'Denied',
    dotClass: 'bg-error',
    badgeClass: 'bg-canvas text-error border-border',
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-success',
    badgeClass: 'bg-primary-soft text-success border-transparent',
  },

  // IP address
  free: {
    label: 'Free',
    dotClass: 'bg-primary',
    badgeClass: 'bg-primary-soft text-primary border-transparent',
  },
  reserved: {
    label: 'Reserved',
    dotClass: 'bg-warning',
    badgeClass: 'bg-canvas text-warning border-border',
  },
  unavailable: {
    label: 'Unavailable',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-muted border-border',
  },
}

interface StatusBadgeProps {
  status: string
  labelOverride?: string
  className?: string
  showDot?: boolean
}

export function StatusBadge({
  status,
  labelOverride,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase().replace(/[\s-]/g, '_')
  const meta = STATUS_MAP[normalizedKey] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-canvas text-text-secondary border-border',
  }

  const label = labelOverride ?? meta.label

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs gap-1.5 px-2 py-0.5',
        meta.badgeClass,
        className,
      )}
    >
      {showDot && (
        <span
          className={cn('size-1.5 shrink-0 rounded-full', meta.dotClass)}
          aria-hidden
        />
      )}
      <span>{label}</span>
    </Badge>
  )
}
