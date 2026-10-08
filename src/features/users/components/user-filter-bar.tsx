import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useDepartments, useDesignations } from '../hooks/users-queries'
import type { UserRow } from '../types'

const STATUS_OPTIONS: { value: UserRow['employment_status']; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'resigned', label: 'Resigned' },
]

const ALL = '__all__'

interface UserFilterBarProps {
  departmentId: string | null
  designationId: string | null
  employmentStatus: UserRow['employment_status'] | null
  onDepartmentChange: (value: string | null) => void
  onDesignationChange: (value: string | null) => void
  onStatusChange: (value: UserRow['employment_status'] | null) => void
  onClearAll: () => void
}

// Department, Designation and Status are the filters the current schema
// actually supports. Device status / IP status / License renewal status
// (PRD §19) are intentionally absent until those modules exist — showing
// them now would mean filtering against data that doesn't exist anywhere
// yet (Stage 6 §9: "do not fabricate values").
export function UserFilterBar({
  departmentId,
  designationId,
  employmentStatus,
  onDepartmentChange,
  onDesignationChange,
  onStatusChange,
  onClearAll,
}: UserFilterBarProps) {
  const departmentsQuery = useDepartments()
  const designationsQuery = useDesignations()

  const hasActiveFilters = Boolean(departmentId || designationId || employmentStatus)

  // Base UI's Select.Value renders the raw value by default — unlike Radix,
  // it does not automatically mirror the matched SelectItem's children — so
  // each one needs an explicit label-lookup render function.
  const departmentLabel = (value: string) =>
    value === ALL ? 'All departments' : (departmentsQuery.data?.find((d) => d.id === value)?.name ?? value)
  const designationLabel = (value: string) =>
    value === ALL
      ? 'All designations'
      : (designationsQuery.data?.find((d) => d.id === value)?.name ?? value)
  const statusLabel = (value: string) =>
    value === ALL ? 'All statuses' : (STATUS_OPTIONS.find((s) => s.value === value)?.label ?? value)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={departmentId ?? ALL}
        onValueChange={(v) => onDepartmentChange(v === ALL ? null : v)}
      >
        <SelectTrigger className="w-40" aria-label="Filter by department">
          <SelectValue>{departmentLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All departments</SelectItem>
          {departmentsQuery.data?.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={designationId ?? ALL}
        onValueChange={(v) => onDesignationChange(v === ALL ? null : v)}
      >
        <SelectTrigger className="w-44" aria-label="Filter by designation">
          <SelectValue>{designationLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All designations</SelectItem>
          {designationsQuery.data?.map((designation) => (
            <SelectItem key={designation.id} value={designation.id}>
              {designation.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={employmentStatus ?? ALL}
        onValueChange={(v) =>
          onStatusChange(v === ALL ? null : (v as UserRow['employment_status']))
        }
      >
        <SelectTrigger className="w-36" aria-label="Filter by status">
          <SelectValue>{statusLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}
