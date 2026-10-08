import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionPanelProps {
  id?: string
  ariaLabelledby?: string
  className?: string
  children: ReactNode
}

export function SectionPanel({
  id,
  ariaLabelledby,
  className,
  children,
}: SectionPanelProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cn(
        'rounded-lg border border-border bg-surface p-5 sm:p-6 scroll-mt-20',
        className,
      )}
    >
      {children}
    </section>
  )
}

interface SectionHeaderProps {
  icon: LucideIcon
  title: string
  description?: string
  actions?: ReactNode
  headingId?: string
  className?: string
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
  actions,
  headingId,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-border pb-4 mb-6',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-canvas text-text-secondary">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2
            id={headingId}
            className="text-base font-semibold text-text truncate"
          >
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-text-secondary hidden sm:block truncate">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
