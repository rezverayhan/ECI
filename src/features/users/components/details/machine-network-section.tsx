import { useState } from 'react'
import {
  Cpu,
  Globe,
  Pencil,
  ArrowRight,
  User as UserIcon,
  Laptop,
  AlertCircle,
  Copy,
  Check,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { InfoField } from '@/components/shared/info-matrix'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate } from './details-types'
import { EditMachineDialog } from './dialogs/edit-machine-dialog'
import { AssignIpDialog } from './dialogs/assign-ip-dialog'
import { ReleaseIpDialog } from './dialogs/release-ip-dialog'
import type {
  MachineProfileRow,
  UserCurrentDeviceData,
  UserCurrentNetworkData,
} from '../../api/user-details-api'
import type { UserDetail } from '../../api/users-api'

interface MachineNetworkSectionProps {
  user: UserDetail
  machine: MachineProfileRow | null | undefined
  currentNetwork: UserCurrentNetworkData | null | undefined
  currentDevice: UserCurrentDeviceData | null | undefined
  isItAdmin: boolean
}

export function MachineNetworkSection({
  user,
  machine,
  currentNetwork,
  currentDevice,
  isItAdmin,
}: MachineNetworkSectionProps) {
  const [copiedIp, setCopiedIp] = useState(false)
  const [machineDialogOpen, setMachineDialogOpen] = useState(false)
  const [assignIpDialogOpen, setAssignIpDialogOpen] = useState(false)
  const [reassignIpDialogOpen, setReassignIpDialogOpen] = useState(false)
  const [releaseIpDialogOpen, setReleaseIpDialogOpen] = useState(false)

  const machineName = machine?.machine_name || `ECI-${user.user_id}`
  const ipAddressString = currentNetwork ? String(currentNetwork.ip_address.ip_address) : null

  function copyIpToClipboard() {
    if (!ipAddressString) return
    navigator.clipboard.writeText(ipAddressString)
    setCopiedIp(true)
    setTimeout(() => setCopiedIp(false), 2000)
  }

  return (
    <SectionPanel id="sec-machine-network" ariaLabelledby="heading-machine-network">
      <SectionHeader
        icon={Cpu}
        title="Machine & Network Identity"
        description="Host identity and network layer addressing, managed independently of physical hardware."
        headingId="heading-machine-network"
        actions={
          isItAdmin ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMachineDialogOpen(true)}
              className="gap-1.5"
            >
              <Pencil className="size-3.5" aria-hidden />
              {machine ? 'Edit Machine' : 'Configure Machine'}
            </Button>
          ) : null
        }
      />

      {/* Identity Hierarchy Visual Strip with Subtle Glass Accents */}
      <div className="rounded-lg border border-border/80 bg-canvas/70 backdrop-blur-xs px-3.5 py-2.5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <UserIcon className="size-3.5 text-text-muted" aria-hidden />
            <span className="text-text-secondary">Employee:</span>
            <span className="font-medium text-text">{user.full_name} ({user.user_id})</span>
          </div>

          <ArrowRight className="size-3.5 text-text-muted hidden sm:block" aria-hidden />

          <div className="flex items-center gap-2">
            <Cpu className="size-3.5 text-primary" aria-hidden />
            <span className="text-text-secondary">Machine:</span>
            <span className="font-semibold text-primary font-mono bg-primary/[0.08] px-2 py-0.5 rounded text-xs">
              {machineName}
            </span>
          </div>

          <ArrowRight className="size-3.5 text-text-muted hidden sm:block" aria-hidden />

          <div className="flex items-center gap-2">
            <Laptop className="size-3.5 text-text-muted" aria-hidden />
            <span className="text-text-secondary">Physical Asset:</span>
            <span className="font-medium text-text">
              {currentDevice ? `${currentDevice.device.model} (${currentDevice.device.asset_id})` : 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Host Profile & Network Addressing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Host Machine Profile */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-border pb-2">
            <Cpu className="size-4 text-text-secondary" aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Host Machine Profile
            </h3>
          </div>

          <dl className="grid grid-cols-2 gap-y-4 gap-x-4">
            <InfoField label="Machine Name" value={machineName} mono />
            <InfoField
              label="Machine Status"
              value={machine ? <StatusBadge status={machine.status} /> : null}
            />
            <div className="col-span-2">
              <InfoField
                label="Operating System"
                value={machine?.operating_system}
              />
            </div>
            {machine?.notes ? (
              <div className="col-span-2">
                <InfoField label="Host Notes" value={machine.notes} />
              </div>
            ) : null}
          </dl>
        </div>

        {/* Network Allocation */}
        <div className="space-y-4 md:border-l md:border-border md:pl-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-1.5">
              <Globe className="size-4 text-text-secondary" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Network Allocation
              </h3>
            </div>
            {isItAdmin && (
              currentNetwork ? (
                <div className="flex items-center gap-1">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setReassignIpDialogOpen(true)}
                  >
                    Change IP
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setReleaseIpDialogOpen(true)}
                    className="text-error hover:text-error hover:bg-destructive/10"
                  >
                    Release IP
                  </Button>
                </div>
              ) : (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setAssignIpDialogOpen(true)}
                  className="gap-1"
                >
                  <Plus className="size-3" aria-hidden />
                  Assign IP
                </Button>
              )
            )}
          </div>

          <dl className="grid grid-cols-2 gap-y-4 gap-x-4">
            <div className="col-span-2">
              <dt className="text-xs font-medium text-text-secondary">Assigned IPv4 Address</dt>
              <dd className="mt-1 flex items-center gap-2">
                {ipAddressString ? (
                  <>
                    <span className="text-sm font-semibold text-text font-mono">
                      {ipAddressString}
                    </span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={copyIpToClipboard}
                      title="Copy IP"
                    >
                      {copiedIp ? (
                        <Check className="size-3 text-success" />
                      ) : (
                        <Copy className="size-3 text-text-muted" />
                      )}
                    </Button>
                    <StatusBadge status="assigned" />
                  </>
                ) : (
                  <span className="text-xs text-text-secondary italic flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 text-warning" aria-hidden />
                    No static IP allocated
                  </span>
                )}
              </dd>
            </div>

            <InfoField
              label="Allocation Date"
              value={currentNetwork ? formatDate(currentNetwork.assigned_at) : '—'}
            />
            <InfoField
              label="Addressing Mode"
              value={currentNetwork ? 'Static Reserved' : null}
            />
            {currentNetwork?.notes ? (
              <div className="col-span-2">
                <InfoField label="Network Notes" value={currentNetwork.notes} />
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      {/* Edit Machine Dialog */}
      <EditMachineDialog
        open={machineDialogOpen}
        onOpenChange={setMachineDialogOpen}
        userId={user.id}
        employeeName={user.full_name}
        currentMachine={machine}
      />

      {/* Assign IP Dialog (no current IP) */}
      <AssignIpDialog
        open={assignIpDialogOpen}
        onOpenChange={setAssignIpDialogOpen}
        userId={user.id}
        employeeName={user.full_name}
      />

      {/* Change/Reassign IP Dialog (releases current allocation, then assigns the replacement) */}
      {currentNetwork && (
        <AssignIpDialog
          open={reassignIpDialogOpen}
          onOpenChange={setReassignIpDialogOpen}
          userId={user.id}
          employeeName={user.full_name}
          reassigning={{
            assignmentId: currentNetwork.id,
            ipAddressId: currentNetwork.ip_address_id,
            ipAddressLabel: String(currentNetwork.ip_address.ip_address),
          }}
        />
      )}

      {/* Release IP Dialog */}
      {currentNetwork && (
        <ReleaseIpDialog
          open={releaseIpDialogOpen}
          onOpenChange={setReleaseIpDialogOpen}
          userId={user.id}
          currentNetwork={currentNetwork}
        />
      )}
    </SectionPanel>
  )
}
