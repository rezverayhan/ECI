import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  Phone,
  RefreshCcw,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { AccessLevel } from '@/features/auth/types'

export interface NavLeaf {
  label: string
  path: string
  icon: LucideIcon
  allow?: AccessLevel[]
}

export interface NavGroup {
  label: string
  icon: LucideIcon
  children: Omit<NavLeaf, 'icon'>[]
  allow?: AccessLevel[]
}

export type NavEntry = NavLeaf | NavGroup

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry
}

// Mirrors App Flow §2 exactly. Device/IP/Printer/Applications/Warranty are
// deliberately absent — those live inside User Details, never as primary
// navigation (App Flow §56.3).
export const NAV_ENTRIES: NavEntry[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  // Only IT Administrator has "search and filter users" in the approved
  // role capability list (PRD §4.1) — hidden rather than shown disabled
  // (Content Guidelines §54).
  { label: 'Users', path: '/app/users', icon: Users, allow: ['it_administrator'] },
  {
    label: 'Bookings',
    icon: CalendarDays,
    children: [
      { label: 'Meeting Rooms', path: '/app/bookings/meeting-rooms' },
      { label: 'Cars', path: '/app/bookings/cars' },
    ],
  },
  { label: 'IP Phone Directory', path: '/app/ip-phone-directory', icon: Phone },
  // Org-wide support queue is IT Admin / General Manager operational tooling;
  // General Users create/view their own issues from their own Employee 360 page.
  { label: 'IT Support', path: '/app/support', icon: LifeBuoy, allow: ['it_administrator', 'general_manager'] },
  // user_licenses RLS grants org-wide visibility only to IT Administrator —
  // other roles see only their own license (already shown in Employee 360).
  { label: 'Renewals', path: '/app/renewals', icon: RefreshCcw, allow: ['it_administrator'] },
  { label: 'Notifications', path: '/app/notifications', icon: Bell },
  { label: 'Settings', path: '/app/settings/profile', icon: Settings },
]

export function visibleNavEntries(accessLevel: AccessLevel | null): NavEntry[] {
  return NAV_ENTRIES.filter((entry) => !entry.allow || (accessLevel && entry.allow.includes(accessLevel)))
}
