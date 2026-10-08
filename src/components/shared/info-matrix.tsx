import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InfoMatrixProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function InfoMatrix({
  children,
  columns = 3,
  className,
}: InfoMatrixProps) {
  const colClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : columns === 4
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <dl className={cn('grid gap-y-5 gap-x-6', colClass, className)}>
      {children}
    </dl>
  )
}

interface InfoFieldProps {
  label: string
  value: ReactNode
  subvalue?: ReactNode
  mono?: boolean
  className?: string
}

export function InfoField({
  label,
  value,
  subvalue,
  mono,
  className,
}: InfoFieldProps) {
  return (
    <div className={cn('flex flex-col min-w-0', className)}>
      <dt className="text-xs font-medium text-text-secondary">{label}</dt>
      <dd
        className={cn(
          'mt-1 text-sm font-medium text-text truncate',
          mono && 'font-mono',
        )}
      >
        {value ?? '—'}
      </dd>
      {subvalue ? (
        <span className="mt-0.5 text-xs text-text-muted truncate">
          {subvalue}
        </span>
      ) : null}
    </div>
  )
}
