import {
  Shield,
  ShoppingBag,
  Calendar,
} from 'lucide-react'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { InfoField } from '@/components/shared/info-matrix'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { formatCurrency, formatDate } from './details-types'
import type { UserCurrentDeviceData } from '../../api/user-details-api'

interface PurchaseWarrantySectionProps {
  currentDevice: UserCurrentDeviceData | null | undefined
}

export function PurchaseWarrantySection({ currentDevice }: PurchaseWarrantySectionProps) {
  const device = currentDevice?.device

  if (!device) {
    return (
      <SectionPanel id="sec-warranty" ariaLabelledby="heading-purchase-warranty">
        <SectionHeader
          icon={Shield}
          title="Purchase & Warranty"
          description="Acquisition and manufacturer warranty terms for assigned physical asset."
          headingId="heading-purchase-warranty"
        />
        <EmptyState
          icon={Shield}
          title="No device assigned"
          description="Purchase and warranty records require an active hardware assignment."
        />
      </SectionPanel>
    )
  }

  // Warranty calculation
  const hasWarrantyDates = Boolean(device.warranty_start_date || device.warranty_end_date)
  const isWarrantyExpired = device.warranty_end_date
    ? new Date(device.warranty_end_date) < new Date()
    : false
  const isWarrantyActive = hasWarrantyDates && !isWarrantyExpired

  return (
    <SectionPanel id="sec-warranty" ariaLabelledby="heading-purchase-warranty">
      <SectionHeader
        icon={Shield}
        title="Purchase & Warranty"
        description={`Acquisition history and manufacturer coverage for ${device.brand ? device.brand + ' ' : ''}${device.model} (${device.asset_id}).`}
        headingId="heading-purchase-warranty"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Purchase Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-border pb-2">
            <ShoppingBag className="size-4 text-text-secondary" aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Acquisition Details
            </h3>
          </div>

          <dl className="grid grid-cols-2 gap-y-4 gap-x-4">
            <InfoField
              label="Purchase Date"
              value={
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5 text-text-muted" aria-hidden />
                  {formatDate(device.purchase_date)}
                </span>
              }
            />
            <InfoField
              label="Purchase Price"
              value={formatCurrency(device.purchase_price)}
              mono
            />
            <InfoField
              label="Purchased By"
              value={device.buyer?.full_name}
            />
          </dl>
        </div>

        {/* Right: Warranty Coverage */}
        <div className="space-y-4 md:border-l md:border-border md:pl-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-1.5">
              <Shield className="size-4 text-text-secondary" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Warranty Coverage
              </h3>
            </div>

            {hasWarrantyDates ? (
              <StatusBadge
                status={isWarrantyActive ? 'active' : 'expired'}
                labelOverride={isWarrantyActive ? 'Active Coverage' : 'Expired'}
              />
            ) : (
              <span className="text-xs text-text-muted">No terms logged</span>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-y-4 gap-x-4">
            <InfoField
              label="Warranty Term"
              value={
                device.warranty_duration_months
                  ? `${device.warranty_duration_months} Months`
                  : null
              }
            />
            <InfoField
              label="Warranty Start"
              value={formatDate(device.warranty_start_date)}
            />
            <InfoField
              label="Warranty Expiration"
              value={formatDate(device.warranty_end_date)}
            />
          </dl>
        </div>
      </div>
    </SectionPanel>
  )
}
