import { useMatches } from 'react-router-dom'
import { MobileNav } from './mobile-nav'
import { NotificationButton } from './notification-button'
import { ProfileMenu } from './profile-menu'

interface RouteHandle {
  title?: string
}

function useCurrentPageTitle(): string {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const handle = matches[i]?.handle as RouteHandle | undefined
    if (handle?.title) return handle.title
  }
  return 'ECI User Management'
}

export function TopBar() {
  const title = useCurrentPageTitle()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <h2 className="text-sm font-semibold text-text">{title}</h2>
      </div>
      <div className="flex items-center gap-1.5">
        <NotificationButton />
        <ProfileMenu />
      </div>
    </header>
  )
}
