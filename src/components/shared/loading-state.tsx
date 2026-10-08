export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  )
}
