import { User, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { InfoMatrix, InfoField } from '@/components/shared/info-matrix'
import { StatusBadge } from '@/components/shared/status-badge'
import { ACCESS_LEVEL_LABELS } from '@/features/auth/access-level-labels'
import { formatDate } from './details-types'
import type { UserDetail } from '../../api/users-api'

interface EmployeeInfoSectionProps {
  user: UserDetail
  canEdit: boolean
  onEdit: () => void
}

export function EmployeeInfoSection({ user, canEdit, onEdit }: EmployeeInfoSectionProps) {
  return (
    <SectionPanel id="sec-employee" ariaLabelledby="heading-employee-info">
      <SectionHeader
        icon={User}
        title="Employee Information"
        description="Core organizational identity, HR placement, and reporting hierarchy."
        headingId="heading-employee-info"
        actions={
          canEdit ? (
            <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5 shrink-0">
              <Pencil className="size-3.5" aria-hidden />
              Edit details
            </Button>
          ) : null
        }
      />

      <InfoMatrix columns={3}>
        <InfoField label="Full Name" value={user.full_name} />
        <InfoField label="Employee ID" value={user.employee_id} mono />
        <InfoField label="User ID" value={user.user_id} mono />
        <InfoField label="Designation" value={user.designation_name} />
        <InfoField label="Department" value={user.department_name} />
        <InfoField label="Reporting Manager" value={user.manager_name} />
        <InfoField
          label="Official Email"
          value={
            <a
              href={`mailto:${user.official_email}`}
              className="hover:text-primary transition-colors underline decoration-border hover:decoration-primary"
            >
              {user.official_email}
            </a>
          }
        />
        <InfoField
          label="Phone Number"
          value={
            user.phone ? (
              <a href={`tel:${user.phone}`} className="hover:text-primary transition-colors">
                {user.phone}
              </a>
            ) : null
          }
        />
        <InfoField
          label="Employment Status"
          value={<StatusBadge status={user.employment_status} />}
          subvalue={user.is_active ? 'Active directory access' : 'Account suspended'}
        />
        <InfoField label="Join Date" value={formatDate(user.join_date)} />
        <InfoField label="Access Level" value={ACCESS_LEVEL_LABELS[user.access_level]} />
        <InfoField label="Record Created" value={formatDate(user.created_at)} />
      </InfoMatrix>
    </SectionPanel>
  )
}
