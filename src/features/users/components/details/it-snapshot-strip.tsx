import {
  Cpu,
  Globe,
  Laptop,
  Barcode,
  CheckCircle2,
  PhoneCall,
  KeyRound,
} from 'lucide-react'
import type {
  MachineProfileRow,
  UserCurrentDeviceData,
  UserCurrentIpPhoneData,
  UserCurrentNetworkData,
  UserLicenseWithRenewals,
} from '../../api/user-details-api'

interface ItSnapshotStripProps {
  machine: MachineProfileRow | null | undefined
  currentDevice: UserCurrentDeviceData | null | undefined
  currentNetwork: UserCurrentNetworkData | null | undefined
  currentIpPhone: UserCurrentIpPhoneData | null | undefined
  licenses: UserLicenseWithRenewals[]
  userIdFallback: string
}

export function ItSnapshotStrip({
  machine,
  currentDevice,
  currentNetwork,
  currentIpPhone,
  licenses,
  userIdFallback,
}: ItSnapshotStripProps) {
  const machineName = machine?.machine_name || `ECI-${userIdFallback}`
  const ipAddress = currentNetwork ? String(currentNetwork.ip_address.ip_address) : 'Not Assigned'
  const deviceName = currentDevice
    ? `${currentDevice.device.brand ? currentDevice.device.brand + ' ' : ''}${currentDevice.device.model}`
    : 'No Device'
  const assetId = currentDevice?.device.asset_id ?? '—'
  const deviceStatus = currentDevice ? 'Assigned' : 'Unassigned'
  const activeLicense = licenses.find((l) => l.status === 'active') || licenses[0]
  const licenseText = activeLicense ? activeLicense.license_name : (licenses[0]?.license_name || 'No License')
  const phoneExtension = currentIpPhone ? `Ext ${currentIpPhone.ip_phone.extension}` : 'No Extension'

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="grid grid-cols-2 divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x lg:grid-cols-7">
        {/* 1. Machine */}
        <div className="flex flex-col gap-1 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <div className="flex size-5 items-center justify-center rounded bg-primary/[0.08] text-primary shrink-0">
              <Cpu className="size-3" aria-hidden />
            </div>
            <span>Machine</span>
          </div>
          <span className="text-sm font-medium text-text truncate font-mono" title={machineName}>
            {machineName}
          </span>
          <span className="text-xs text-text-muted truncate">
            {machine?.operating_system || '—'}
          </span>
        </div>

        {/* 2. IP Address */}
        <div className="flex flex-col gap-1 p-3.5 sm:p-4 border-l border-border sm:border-l-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <div className="flex size-5 items-center justify-center rounded bg-primary/[0.08] text-primary shrink-0">
              <Globe className="size-3" aria-hidden />
            </div>
            <span>IP Address</span>
          </div>
          <span className="text-sm font-medium text-text truncate font-mono" title={ipAddress}>
            {ipAddress}
          </span>
          <span className="text-xs text-text-muted truncate">
            {currentNetwork ? 'Static IPv4' : 'Awaiting Allocation'}
          </span>
        </div>

        {/* 3. Current Device */}
        <div className="flex flex-col gap-1 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <div className="flex size-5 items-center justify-center rounded bg-primary/[0.08] text-primary shrink-0">
              <Laptop className="size-3" aria-hidden />
            </div>
            <span>Device</span>
          </div>
          <span className="text-sm font-medium text-text truncate" title={deviceName}>
            {deviceName}
          </span>
          <span className="text-xs text-text-muted truncate">
            {currentDevice?.device.device_type ? currentDevice.device.device_type.toUpperCase() : 'Hardware'}
          </span>
        </div>

        {/* 4. Asset ID */}
        <div className="flex flex-col gap-1 p-3.5 sm:p-4 border-l border-border sm:border-l-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <div className="flex size-5 items-center justify-center rounded bg-primary/[0.08] text-primary shrink-0">
              <Barcode className="size-3" aria-hidden />
            </div>
            <span>Asset ID</span>
          </div>
          <span className="text-sm font-medium text-text truncate font-mono" title={assetId}>
            {assetId}
          </span>
          <span className="text-xs text-text-muted truncate">
            {currentDevice?.device.serial_number ? `SN: ${currentDevice.device.serial_number}` : 'Physical Tag'}
          </span>
        </div>

        {/* 5. Device Status */}
        <div className="flex flex-col gap-1 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <div className="flex size-5 items-center justify-center rounded bg-success/[0.1] text-success shrink-0">
              <CheckCircle2 className="size-3" aria-hidden />
            </div>
            <span>Asset State</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`size-1.5 rounded-full shrink-0 ${
                currentDevice ? 'bg-success' : 'bg-text-muted'
              }`}
              aria-hidden
            />
            <span className="text-sm font-medium text-text truncate">
              {deviceStatus}
            </span>
          </div>
          <span className="text-xs text-text-muted truncate">
            {currentDevice?.assigned_at ? 'Active Custody' : 'No Hardware'}
          </span>
        </div>

        {/* 6. License */}
        <div className="flex flex-col gap-1 p-3.5 sm:p-4 border-l border-border sm:border-l-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <div className="flex size-5 items-center justify-center rounded bg-primary/[0.08] text-primary shrink-0">
              <KeyRound className="size-3" aria-hidden />
            </div>
            <span>License</span>
          </div>
          <span className="text-sm font-medium text-text truncate" title={licenseText}>
            {licenseText}
          </span>
          <span className="text-xs text-text-muted truncate">
            {activeLicense?.license_type ?? '—'}
          </span>
        </div>

        {/* 7. IP Phone */}
        <div className="col-span-2 sm:col-span-1 flex flex-col gap-1 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <div className="flex size-5 items-center justify-center rounded bg-primary/[0.08] text-primary shrink-0">
              <PhoneCall className="size-3" aria-hidden />
            </div>
            <span>IP Phone</span>
          </div>
          <span className="text-sm font-medium text-text truncate font-mono" title={phoneExtension}>
            {phoneExtension}
          </span>
          <span className="text-xs text-text-muted truncate">
            {currentIpPhone?.ip_phone.department?.name || '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
