import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { isNavGroup, visibleNavEntries } from '@/app/layouts/nav-config'
import { useAuth } from '@/features/auth/context/auth-context'

const linkBaseClass =
  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50'

function linkClassName(isActive: boolean) {
  return cn(
    linkBaseClass,
    isActive
      ? 'bg-primary-soft text-primary'
      : 'text-text-secondary hover:bg-canvas hover:text-text',
  )
}

export function SidebarNav() {
  const { accessLevel } = useAuth()
  const entries = visibleNavEntries(accessLevel)

  return (
    <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Main navigation">
      {entries.map((entry) => {
        if (isNavGroup(entry)) {
          const Icon = entry.icon
          return (
            <div key={entry.label} className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-text-secondary">
                <Icon className="size-4.5 shrink-0" aria-hidden />
                {entry.label}
              </div>
              <div className="ml-7 flex flex-col gap-0.5 border-l border-border pl-3">
                {entry.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                        isActive
                          ? 'bg-primary-soft text-primary font-medium'
                          : 'text-text-secondary hover:bg-canvas hover:text-text',
                      )
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        }

        const Icon = entry.icon
        return (
          <NavLink
            key={entry.path}
            to={entry.path}
            className={({ isActive }) => linkClassName(isActive)}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden />
            {entry.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col sticky top-0 h-screen self-start">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-sm font-semibold text-text">ECI User Management</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  )
}
