import { useState } from 'react'
import { PhoneCall, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { InfoMatrix, InfoField } from '@/components/shared/info-matrix'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate } from './details-types'
import { AssignIpPhoneDialog } from './dialogs/assign-ip-phone-dialog'
import { ReleaseIpPhoneDialog } from './dialogs/release-ip-phone-dialog'
import type { UserCurrentIpPhoneData } from '../../api/user-details-api'

interface IpPhoneSectionProps {
  userId: string
  employeeName: string
  currentIpPhone: UserCurrentIpPhoneData | null | undefined
  isItAdmin: boolean
}

export function IpPhoneSection({ userId, employeeName, currentIpPhone, isItAdmin }: IpPhoneSectionProps) {
  const [assignOpen, setAssignOpen] = useState(false)
  const [reassignOpen, setReassignOpen] = useState(false)
  const [releaseOpen, setReleaseOpen] = useState(false)

  const hasPhone = Boolean(currentIpPhone)
  const phone = currentIpPhone?.ip_phone

  return (
    <SectionPanel id="sec-ip-phone" ariaLabelledby="heading-ip-phone">
      <SectionHeader
        icon={PhoneCall}
        title="IP Phone / Extension"
        description="Voice terminal extension currently routed to this employee."
        headingId="heading-ip-phone"
        actions={
          isItAdmin ? (
            hasPhone ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setReassignOpen(true)}>
                  Change Extension
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReleaseOpen(true)}
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Release
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setAssignOpen(true)} className="gap-1.5">
                <Plus className="size-3.5" aria-hidden />
                Assign Extension
              </Button>
            )
          ) : null
        }
      />

      {!hasPhone ? (
        <EmptyState
          icon={PhoneCall}
          title="No IP Phone extension is currently assigned to this employee."
          action={
            isItAdmin ? (
              <Button size="sm" onClick={() => setAssignOpen(true)} className="gap-1.5">
                <Plus className="size-3.5" aria-hidden />
                Assign Extension
              </Button>
            ) : undefined
          }
        />
      ) : (
        <InfoMatrix columns={3}>
          <InfoField label="Extension" value={phone!.extension} mono />
          <InfoField label="Phone Type" value={phone!.phone_type} />
          <InfoField label="Status" value={<StatusBadge status="assigned" />} />
          <InfoField label="Assigned Since" value={formatDate(currentIpPhone!.assigned_at)} />
          <InfoField label="Department Routing" value={phone!.department?.name} />
          {currentIpPhone!.notes ? <InfoField label="Notes" value={currentIpPhone!.notes} /> : null}
        </InfoMatrix>
      )}

      <AssignIpPhoneDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        userId={userId}
        employeeName={employeeName}
      />

      {currentIpPhone && (
        <>
          <AssignIpPhoneDialog
            open={reassignOpen}
            onOpenChange={setReassignOpen}
            userId={userId}
            employeeName={employeeName}
            reassigning={{
              assignmentId: currentIpPhone.id,
              extensionLabel: currentIpPhone.ip_phone.extension,
            }}
          />
          <ReleaseIpPhoneDialog
            open={releaseOpen}
            onOpenChange={setReleaseOpen}
            userId={userId}
            assignmentId={currentIpPhone.id}
            extensionLabel={currentIpPhone.ip_phone.extension}
          />
        </>
      )}
    </SectionPanel>
  )
}
