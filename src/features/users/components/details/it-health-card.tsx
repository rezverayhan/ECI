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

      {/* Importance-Based Soft Glass Banner */}
      <div
        className={
          isHealthy
            ? 'rounded-md border border-success/20 bg-success/[0.06] backdrop-blur-xs p-3 transition-colors'
            : 'rounded-md border border-warning/25 bg-warning/[0.07] backdrop-blur-xs p-3 transition-colors'
        }
      >
        <div className="flex items-start gap-2.5">
          {isHealthy ? (
            <div className="flex size-5 items-center justify-center rounded bg-success/15 text-success shrink-0 mt-0.5">
              <CheckCircle2 className="size-3.5" aria-hidden />
            </div>
          ) : (
            <div className="flex size-5 items-center justify-center rounded bg-warning/15 text-warning shrink-0 mt-0.5">
              <AlertTriangle className="size-3.5" aria-hidden />
            </div>
          )}
          <div className="text-xs">
            <span
              className={
                isHealthy
                  ? 'font-semibold text-success block'
                  : 'font-semibold text-warning block'
              }
            >
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
          <span
            className={
              currentDevice
                ? 'font-semibold text-success bg-success/[0.08] px-2 py-0.5 rounded text-[11px]'
                : 'font-semibold text-warning bg-warning/[0.08] px-2 py-0.5 rounded text-[11px]'
            }
          >
            {currentDevice ? 'Assigned' : 'Missing'}
          </span>
        </div>

        {/* Network checklist */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <Globe className="size-3.5 text-text-muted" aria-hidden />
            <span>Static IP Address</span>
          </div>
          <span
            className={
              currentNetwork
                ? 'font-semibold text-success bg-success/[0.08] px-2 py-0.5 rounded text-[11px]'
                : 'font-semibold text-warning bg-warning/[0.08] px-2 py-0.5 rounded text-[11px]'
            }
          >
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
          {openIssues.length > 0 ? (
            <span className="font-semibold text-warning bg-warning/[0.1] px-2 py-0.5 rounded text-[11px]">
              {openIssues.length} {openIssues.length === 1 ? 'ticket' : 'tickets'}
            </span>
          ) : (
            <span className="font-semibold text-text-secondary">
              0 tickets
            </span>
          )}
        </div>
      </div>
    </SectionPanel>
  )
}
