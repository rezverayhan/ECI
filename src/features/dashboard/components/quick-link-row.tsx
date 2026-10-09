import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

interface QuickLinkRowProps {
  to: string
  icon: LucideIcon
  label: string
  description?: string
}

export function QuickLinkRow({ to, icon: Icon, label, description }: QuickLinkRowProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 outline-none transition-colors hover:bg-canvas focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{label}</p>
        {description ? <p className="truncate text-xs text-text-secondary">{description}</p> : null}
      </div>
      <ChevronRight className="size-4 shrink-0 text-text-muted" aria-hidden />
    </Link>
  )
}
