interface StatCardProps {
  label: string
  value: number | null
  isLoading?: boolean
  isError?: boolean
}

export function StatCard({ label, value, isLoading, isError }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3.5">
      <span className="text-xs font-medium text-text-secondary block">{label}</span>
      <span className="text-xl font-semibold text-text">
        {isLoading ? '—' : isError ? 'Unavailable' : value}
      </span>
    </div>
  )
}
