import { Settings, LogOut, User, KeyRound, BellRing } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/shared/user-avatar'
import { useAuth } from '@/features/auth/context/auth-context'
import { ACCESS_LEVEL_LABELS } from '@/features/auth/access-level-labels'

export function ProfileMenu() {
  const { appUser, accessLevel, signOut } = useAuth()

  if (!appUser) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Account menu"
          >
            <UserAvatar fullName={appUser.full_name} size="sm" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
            <span className="text-sm font-medium text-text">{appUser.full_name}</span>
            <span className="text-xs text-text-secondary">
              {accessLevel ? ACCESS_LEVEL_LABELS[accessLevel] : null}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/app/settings/profile" />}>
          <User className="size-4" aria-hidden />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/app/settings/password" />}>
          <KeyRound className="size-4" aria-hidden />
          Password
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/app/settings/notifications" />}>
          <BellRing className="size-4" aria-hidden />
          Notification Preferences
        </DropdownMenuItem>
        {accessLevel === 'it_administrator' ? (
          <DropdownMenuItem render={<Link to="/app/settings/system" />}>
            <Settings className="size-4" aria-hidden />
            System Configuration
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="size-4" aria-hidden />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
