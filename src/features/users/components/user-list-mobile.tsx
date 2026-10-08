import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserAvatar } from '@/components/shared/user-avatar'
import { UserStatusBadge } from './status-badge'
import type { SearchedUser } from '../types'

// Mobile never squeezes the desktop table (Stage 6 §32) — each user
// collapses to a card with only identification-critical fields; everything
// else is one tap away inside User Details.
export function UserListMobile({ users }: { users: SearchedUser[] }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {users.map((user) => (
        <Link
          key={user.id}
          to={`/app/users/${user.id}`}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-canvas"
        >
          <UserAvatar fullName={user.full_name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{user.full_name}</p>
            <p className="truncate text-xs text-text-secondary">
              {user.employee_id} · {user.department_name ?? '—'}
            </p>
          </div>
          <UserStatusBadge status={user.employment_status} />
          <ChevronRight className="size-4 shrink-0 text-text-muted" aria-hidden />
        </Link>
      ))}
    </div>
  )
}
