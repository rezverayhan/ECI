import { useState } from 'react'
import {
  Laptop,
  Monitor,
  Tablet,
  HelpCircle,
  RotateCcw,
  Plus,
  Calendar,
  Barcode,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { InfoMatrix, InfoField } from '@/components/shared/info-matrix'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate } from './details-types'
import { AssignDeviceDialog } from './dialogs/assign-device-dialog'
import { ReturnDeviceDialog } from './dialogs/return-device-dialog'
import type { UserCurrentDeviceData } from '../../api/user-details-api'
import type { UserDetail } from '../../api/users-api'

interface CurrentDeviceSectionProps {
  user: UserDetail
  currentDevice: UserCurrentDeviceData | null | undefined
  isItAdmin: boolean
}

function getDeviceIcon(type: string) {
  switch (type) {
    case 'laptop':
      return <Laptop className="size-4" aria-hidden />
    case 'desktop':
      return <Monitor className="size-4" aria-hidden />
    case 'tablet':
      return <Tablet className="size-4" aria-hidden />
    default:
      return <HelpCircle className="size-4" aria-hidden />
  }
}

export function CurrentDeviceSection({
  user,
  currentDevice,
  isItAdmin,
}: CurrentDeviceSectionProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)

  const hasDevice = Boolean(currentDevice)
  const device = currentDevice?.device

  // Warranty status calculation
  const hasWarranty = Boolean(device?.warranty_end_date)
  const isWarrantyExpired = hasWarranty && new Date(device!.warranty_end_date!) < new Date()

  return (
    <SectionPanel id="sec-device" ariaLabelledby="heading-current-device">
      <SectionHeader
        icon={Laptop}
        title="Current Device"
        description="Physical hardware asset currently assigned into employee custody."
        headingId="heading-current-device"
        actions={
          isItAdmin ? (
            <div className="flex items-center gap-2">
              {hasDevice ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReturnDialogOpen(true)}
                    className="gap-1.5"
                  >
                    <RotateCcw className="size-3.5" aria-hidden />
                    Return Device
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReplaceDialogOpen(true)}
                    className="gap-1.5"
                  >
                    Replace Device
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setAssignDialogOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" aria-hidden />
                  Assign Device
                </Button>
              )}
            </div>
          ) : null
        }
      />

      {!hasDevice ? (
        <EmptyState
          icon={Laptop}
          title="No physical device currently assigned"
          description="This employee does not currently have an active hardware assignment recorded in the inventory."
          action={
            isItAdmin ? (
              <Button
                size="sm"
                onClick={() => setAssignDialogOpen(true)}
                className="gap-1.5"
              >
                <Plus className="size-3.5" aria-hidden />
                Assign Hardware Now
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Prominent Device Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-canvas px-4 py-3.5">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-md bg-surface border border-border text-primary shrink-0">
                {getDeviceIcon(device!.device_type)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-text truncate">
                    {device!.brand ? `${device!.brand} ` : ''}{device!.model}
                  </h3>
                  <StatusBadge status="assigned" />
                </div>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-secondary mt-0.5">
                  <span className="font-mono">{device!.asset_id}</span>
                  <span className="text-text-muted">·</span>
                  <span className="capitalize">{device!.device_type}</span>
                  {device!.serial_number && (
                    <>
                      <span className="text-text-muted">·</span>
                      <span className="font-mono">SN: {device!.serial_number}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Warranty Badge summary */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {hasWarranty ? (
                <StatusBadge
                  status={isWarrantyExpired ? 'expired' : 'active'}
                  labelOverride={
                    isWarrantyExpired
                      ? `Warranty Expired (${formatDate(device!.warranty_end_date)})`
                      : `Warranty Active (${formatDate(device!.warranty_end_date)})`
                  }
                />
              ) : (
                <span className="text-xs text-text-muted">No warranty record</span>
              )}
            </div>
          </div>

          {/* Device Lifecycle Flow Representation */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-text-secondary">
              Asset Lifecycle Progress
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex flex-col items-center rounded-md border border-border bg-surface p-2.5 text-center">
                <div className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-success mb-1">
                  <CheckCircle2 className="size-3" aria-hidden />
                </div>
                <span className="text-xs font-semibold text-text">Purchased</span>
                <span className="text-[11px] text-text-muted">{formatDate(device!.purchase_date)}</span>
              </div>

              <div className="flex flex-col items-center rounded-md border border-border bg-surface p-2.5 text-center">
                <div className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-success mb-1">
                  <CheckCircle2 className="size-3" aria-hidden />
                </div>
                <span className="text-xs font-semibold text-text">Inventory In</span>
                <span className="text-[11px] text-text-muted">Stocked</span>
              </div>

              <div className="flex flex-col items-center rounded-md border border-border bg-surface p-2.5 text-center">
                <div className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-success mb-1">
                  <CheckCircle2 className="size-3" aria-hidden />
                </div>
                <span className="text-xs font-semibold text-text">Assigned</span>
                <span className="text-[11px] text-text-muted">{formatDate(currentDevice!.assigned_at)}</span>
              </div>

              <div className="flex flex-col items-center rounded-md border border-primary/20 bg-primary-soft p-2.5 text-center">
                <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground mb-1">
                  <Clock className="size-3" aria-hidden />
                </div>
                <span className="text-xs font-semibold text-primary">In Use</span>
                <span className="text-[11px] text-primary">Current Custody</span>
              </div>
            </div>
          </div>

          {/* Information Matrix */}
          <InfoMatrix columns={3}>
            <InfoField
              label="Hardware Asset ID"
              value={
                <span className="flex items-center gap-1.5 font-mono">
                  <Barcode className="size-3.5 text-text-muted" aria-hidden />
                  {device!.asset_id}
                </span>
              }
            />
            <InfoField label="Serial Number" value={device!.serial_number || '—'} mono />
            <InfoField label="Device Classification" value={device!.device_type} />
            <InfoField label="Brand & Manufacturer" value={device!.brand || '—'} />
            <InfoField
              label="Current Assignment Date"
              value={
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-text-muted" aria-hidden />
                  {formatDate(currentDevice!.assigned_at)}
                </span>
              }
            />
            <InfoField
              label="Hardware Custody State"
              value={<StatusBadge status="assigned" labelOverride="Active Custody" />}
            />
            {currentDevice!.notes ? (
              <div className="col-span-full">
                <InfoField label="Assignment Custody Notes" value={currentDevice!.notes} />
              </div>
            ) : null}
          </InfoMatrix>
        </div>
      )}

      {/* Assign Dialog (no current device) */}
      <AssignDeviceDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        userId={user.id}
        employeeName={user.full_name}
      />

      {/* Replace Dialog (closes current assignment, then assigns the replacement) */}
      {currentDevice && (
        <AssignDeviceDialog
          open={replaceDialogOpen}
          onOpenChange={setReplaceDialogOpen}
          userId={user.id}
          employeeName={user.full_name}
          replacing={{
            assignmentId: currentDevice.id,
            deviceId: currentDevice.device_id,
            deviceLabel: `${currentDevice.device.brand ? currentDevice.device.brand + ' ' : ''}${currentDevice.device.model} (${currentDevice.device.asset_id})`,
          }}
        />
      )}

      {/* Return Dialog */}
      {currentDevice && (
        <ReturnDeviceDialog
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          userId={user.id}
          currentDevice={currentDevice}
        />
      )}
    </SectionPanel>
  )
}
