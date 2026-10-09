import { PageHeader } from '@/components/shared/page-header'
import { useAuth } from '@/features/auth/context/auth-context'
import type { AccessLevel } from '@/features/auth/types'
import { ItAdminOverview } from '../components/it-admin-overview'
import { GeneralManagerOverview } from '../components/general-manager-overview'
import { AdminOverview } from '../components/admin-overview'
import { GeneralUserOverview } from '../components/general-user-overview'

// Role-aware dashboard identity (App Flow §1.1). The real operational
// summary for each role is built in a later stage — this establishes the
// routing/shell contract each one will render into.
const DASHBOARD_TITLES: Record<AccessLevel, { title: string; description: string }> = {
  it_administrator: {
    title: 'IT Operations Dashboard',
    description: "Here's what needs your attention today.",
  },
  general_manager: {
    title: 'IT Overview',
    description: 'A management view of current IT operations.',
  },
  admin: {
    title: 'Admin Dashboard',
    description: 'Booking operations and relevant administrative activity.',
  },
  general_user: {
    title: 'My Overview',
    description: 'Your profile, device, support and bookings at a glance.',
  },
}

export function DashboardPage() {
  const { accessLevel } = useAuth()
  const copy = accessLevel ? DASHBOARD_TITLES[accessLevel] : DASHBOARD_TITLES.general_user

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={copy.title} description={copy.description} />
      {accessLevel === 'it_administrator' && <ItAdminOverview />}
      {accessLevel === 'general_manager' && <GeneralManagerOverview />}
      {accessLevel === 'admin' && <AdminOverview />}
      {(accessLevel === 'general_user' || !accessLevel) && <GeneralUserOverview />}
    </div>
  )
}
