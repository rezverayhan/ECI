import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ActivityItem {
  id: string
  title: ReactNode
  timestamp?: string
  actor?: string
  description?: ReactNode
}

interface ActivityListProps {
  items: ActivityItem[]
  emptyMessage?: string
  className?: string
}

export function ActivityList({
  items,
  emptyMessage = 'No activity recorded yet.',
  className,
}: ActivityListProps) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-text-secondary py-2">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ol className={cn('relative border-l border-border ml-2 space-y-4 py-1', className)}>
      {items.map((item) => (
        <li key={item.id} className="ml-3.5">
          <span
            className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full border-2 border-surface bg-primary"
            aria-hidden
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-text leading-tight">
              {item.title}
            </span>
            {item.description ? (
              <p className="text-xs text-text-secondary mt-0.5">
                {item.description}
              </p>
            ) : null}
            {(item.timestamp || item.actor) && (
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-1">
                {item.timestamp ? <span>{item.timestamp}</span> : null}
                {item.timestamp && item.actor ? <span>·</span> : null}
                {item.actor ? <span>by {item.actor}</span> : null}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
