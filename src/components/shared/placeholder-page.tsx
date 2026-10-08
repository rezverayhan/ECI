import { PageHeader } from './page-header'
import { EmptyState } from './empty-state'

interface PlaceholderPageProps {
  title: string
  description?: string
}

// Used for routes that exist (so navigation and deep links work) but whose
// feature work belongs to a later implementation stage. No fake data, no
// invented UI beyond an honest "not built yet" state.
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        title="This section hasn't been built yet"
        description="It will be available in an upcoming update."
      />
    </div>
  )
}
