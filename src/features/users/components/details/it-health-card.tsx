import { CheckCircle2, AlertTriangle, Laptop, Globe, Layers, LifeBuoy } from 'lucide-react'
import { SectionPanel } from '@/components/shared/section-panel'
import { StatusBadge } from '@/components/shared/status-badge'
import type {
  UserApplicationData,
  UserCurrentDeviceData,
  UserCurrentNetworkData,
  UserSupportIssueData,
} from '../../api/user-details-api'

interface ItHealthCardProps {
  currentDevice: UserCurrentDeviceData | null | undefined
  currentNetwork: UserCurrentNetworkData | null | undefined
  applications: UserApplicationData[]
  supportIssues: UserSupportIssueData[]
}

export function ItHealthCard({
  currentDevice,
  currentNetwork,
  applications,
  supportIssues,
}: ItHealthCardProps) {
  const openIssues = supportIssues.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed',
  )
  const isHealthy = Boolean(currentDevice && currentNetwork && openIssues.length === 0)

  return (
    <SectionPanel className="p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          IT Profile Health
        </h3>
        <StatusBadge
          status={isHealthy ? 'active' : 'inactive'}
          labelOverride={isHealthy ? 'IT Setup Healthy' : 'Needs Attention'}
        />
      </div>

      <div className="rounded-md border border-border bg-canvas/40 p-2.5">
        <div className="flex items-start gap-2">
          {isHealthy ? (
            <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" aria-hidden />
          ) : (
            <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" aria-hidden />
          )}
          <div className="text-xs">
            <span className="font-semibold text-text block">
              {isHealthy ? 'IT setup healthy' : 'Configuration incomplete'}
            </span>
            <p className="text-text-secondary mt-0.5 text-[11px]">
              {isHealthy
                ? 'All primary IT records are configured and active.'
                : 'One or more required hardware or network allocations are missing.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs divide-y divide-border/60">
        {/* Device checklist */}
        <div className="flex items-center justify-between pt-1.5 first:pt-0">
          <div className="flex items-center gap-2 text-text-secondary">
            <Laptop className="size-3.5 text-text-muted" aria-hidden />
            <span>Hardware Asset</span>
          </div>
          <span className={`font-semibold ${currentDevice ? 'text-success' : 'text-warning'}`}>
            {currentDevice ? 'Assigned' : 'Missing'}
          </span>
        </div>

        {/* Network checklist */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <Globe className="size-3.5 text-text-muted" aria-hidden />
            <span>Static IP Address</span>
          </div>
          <span className={`font-semibold ${currentNetwork ? 'text-success' : 'text-warning'}`}>
            {currentNetwork ? 'Configured' : 'Unallocated'}
          </span>
        </div>

        {/* Applications checklist */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <Layers className="size-3.5 text-text-muted" aria-hidden />
            <span>Applications</span>
          </div>
          <span className="font-semibold text-text">
            {applications.length} provisioned
          </span>
        </div>

        {/* Open tickets */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <LifeBuoy className="size-3.5 text-text-muted" aria-hidden />
            <span>Open Tickets</span>
          </div>
          <span className={`font-semibold ${openIssues.length > 0 ? 'text-warning' : 'text-text-secondary'}`}>
            {openIssues.length} {openIssues.length === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>
      </div>
    </SectionPanel>
  )
}
