import { SectionPanel } from '@/components/shared/section-panel'
import type {
  UserApplicationData,
  UserCurrentDeviceData,
  UserCurrentNetworkData,
  UserSupportIssueData,
} from '../../api/user-details-api'
import type { UserDetail } from '../../api/users-api'

interface QuickContextCardProps {
  user: UserDetail
  currentDevice: UserCurrentDeviceData | null | undefined
  currentNetwork: UserCurrentNetworkData | null | undefined
  applications: UserApplicationData[]
  supportIssues: UserSupportIssueData[]
}

export function QuickContextCard({
  user,
  currentDevice,
  currentNetwork,
  applications,
  supportIssues,
}: QuickContextCardProps) {
  const openCount = supportIssues.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed',
  ).length

  return (
    <SectionPanel className="p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-border/80">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Quick Context
        </h3>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
        <div>
          <dt className="text-[11px] font-medium text-text-secondary">User ID</dt>
          <dd className="mt-0.5 font-mono font-semibold text-text truncate" title={user.user_id}>
            {user.user_id}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-medium text-text-secondary">Employee ID</dt>
          <dd className="mt-0.5 font-mono font-semibold text-text truncate" title={user.employee_id ?? undefined}>
            {user.employee_id ?? '—'}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-medium text-text-secondary">Current Asset</dt>
          <dd className="mt-0.5 font-semibold text-text truncate" title={currentDevice?.device.asset_id ?? 'None'}>
            {currentDevice?.device.asset_id ?? 'None'}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-medium text-text-secondary">Active IPv4</dt>
          <dd className="mt-0.5 font-mono text-xs truncate">
            {currentNetwork ? (
              <span className="font-semibold text-primary bg-primary/[0.08] px-1.5 py-0.5 rounded">
                {String(currentNetwork.ip_address.ip_address)}
              </span>
            ) : (
              <span className="text-text-muted font-medium">None</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-medium text-text-secondary">Software Apps</dt>
          <dd className="mt-0.5 font-semibold text-text truncate">
            {applications.length} assigned
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-medium text-text-secondary">Open Tickets</dt>
          <dd className="mt-0.5 truncate">
            {openCount > 0 ? (
              <span className="inline-flex items-center font-semibold text-warning bg-warning/[0.1] px-1.5 py-0.5 rounded text-[11px] backdrop-blur-xs">
                {openCount} active
              </span>
            ) : (
              <span className="font-medium text-text-secondary text-xs">
                0 active
              </span>
            )}
          </dd>
        </div>
      </dl>
    </SectionPanel>
  )
}
