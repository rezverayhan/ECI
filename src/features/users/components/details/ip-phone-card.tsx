import { PhoneCall } from 'lucide-react'
import { SectionPanel } from '@/components/shared/section-panel'
import { StatusBadge } from '@/components/shared/status-badge'
import type { UserCurrentIpPhoneData } from '../../api/user-details-api'

interface IpPhoneCardProps {
  currentIpPhone: UserCurrentIpPhoneData | null | undefined
}

export function IpPhoneCard({ currentIpPhone }: IpPhoneCardProps) {
  const hasPhone = Boolean(currentIpPhone)
  const phone = currentIpPhone?.ip_phone

  return (
    <SectionPanel className="p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <PhoneCall className="size-3.5 text-text-muted" aria-hidden />
          IP Phone Extension
        </h3>
        {hasPhone ? (
          <StatusBadge status="active" labelOverride="Active" />
        ) : null}
      </div>

      {!hasPhone ? (
        <p className="text-xs text-text-secondary py-1">
          No dedicated IP extension currently routed to this employee.
        </p>
      ) : (
        <div className="space-y-3 text-xs">
          <div className="flex items-baseline justify-between rounded-md border border-border bg-canvas/40 px-3 py-2">
            <span className="text-xs font-medium text-text-secondary">Assigned Extension</span>
            <span className="text-base font-bold text-primary font-mono tracking-wider">
              {phone!.extension}
            </span>
          </div>

          <dl className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between text-text-secondary">
              <dt>Department Routing</dt>
              <dd className="font-medium text-text">{phone!.department?.name || 'General Corporate'}</dd>
            </div>
            <div className="flex justify-between text-text-secondary">
              <dt>Hardware Terminal</dt>
              <dd className="font-medium text-text">{phone!.phone_type || 'VoIP Desktop Phone'}</dd>
            </div>
          </dl>
        </div>
      )}
    </SectionPanel>
  )
}
