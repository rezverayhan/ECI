import { useState } from 'react'
import {
  Wrench,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { InfoField } from '@/components/shared/info-matrix'
import { formatCurrency, formatDate } from './details-types'
import { CreateServiceRecordDialog } from './dialogs/create-service-record-dialog'
import type { DeviceServiceRecordRow } from '../../api/user-details-api'

interface ServiceHistorySectionProps {
  serviceHistory: DeviceServiceRecordRow[]
  userId: string
  currentDeviceId: string | null | undefined
  currentDeviceLabel: string | null
  isItAdmin: boolean
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  repair: 'Repair',
  maintenance: 'Routine Maintenance',
  diagnostic: 'Diagnostic Check',
  upgrade: 'Hardware Upgrade',
  other: 'General Service',
}

export function ServiceHistorySection({
  serviceHistory,
  userId,
  currentDeviceId,
  currentDeviceLabel,
  isItAdmin,
}: ServiceHistorySectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const canLogService = isItAdmin && Boolean(currentDeviceId)

  return (
    <SectionPanel id="sec-service-history" ariaLabelledby="heading-service-history">
      <SectionHeader
        icon={Wrench}
        title="Service & Maintenance History"
        description="Maintenance events, hardware repairs, and diagnostics performed on assigned equipment."
        headingId="heading-service-history"
        actions={
          canLogService ? (
            <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1.5 shrink-0">
              <Plus className="size-3.5" aria-hidden />
              Log Service Record
            </Button>
          ) : null
        }
      />

      {serviceHistory.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No service records yet"
          description={
            currentDeviceId
              ? "This employee's current device has no recorded service tickets or repairs."
              : "This employee has no device assigned, so there is no service context to log against."
          }
          action={
            canLogService ? (
              <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1.5">
                <Plus className="size-3.5" aria-hidden />
                Log Service Record
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface divide-y divide-border">
          {serviceHistory.map((item) => {
            const isExpanded = expandedId === item.id
            const typeLabel = SERVICE_TYPE_LABELS[item.service_type] || item.service_type

            return (
              <div key={item.id} className="transition-colors">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleExpand(item.id)
                  }}
                  className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-canvas select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs text-text-muted font-mono shrink-0">
                      {formatDate(item.service_date)}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-text truncate">
                          {item.problem || typeLabel}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-secondary">{typeLabel}</span>
                      </div>

                      {item.description && (
                        <p className="mt-0.5 text-xs text-text-secondary line-clamp-1 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge
                      status={item.status === 'completed' ? 'resolved' : 'in_progress'}
                      labelOverride={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    />

                    {isExpanded ? (
                      <ChevronUp className="size-4 text-text-muted" aria-hidden />
                    ) : (
                      <ChevronDown className="size-4 text-text-muted" aria-hidden />
                    )}
                  </div>
                </div>

                {/* Expandable Details Pane */}
                {isExpanded && (
                  <div className="border-t border-border bg-canvas/40 p-4 text-xs space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <InfoField
                        label="Service Center"
                        value={item.service_center}
                      />
                      <InfoField
                        label="Warranty Covered"
                        value={item.warranty_covered ? 'Yes (OEM Warranty)' : 'No (Direct Expense)'}
                      />
                      <InfoField
                        label="Completed Date"
                        value={formatDate(item.completed_date)}
                      />
                      <InfoField
                        label="Final Expense"
                        value={formatCurrency(item.cost)}
                        mono
                      />
                    </div>

                    {item.resolution && (
                      <div className="rounded-md border border-border bg-surface p-3">
                        <span className="text-xs font-medium text-text-secondary block mb-1">
                          Resolution Summary
                        </span>
                        <p className="text-xs text-text">{item.resolution}</p>
                      </div>
                    )}

                    {item.notes && (
                      <div className="text-xs text-text-secondary">
                        <span className="font-medium text-text-secondary">Internal Notes: </span>
                        <span>{item.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {currentDeviceId && (
        <CreateServiceRecordDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          userId={userId}
          deviceId={currentDeviceId}
          deviceLabel={currentDeviceLabel ?? 'this device'}
        />
      )}
    </SectionPanel>
  )
}
