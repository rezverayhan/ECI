import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ACCESS_LEVEL_LABELS } from '@/features/auth/access-level-labels'
import { useDepartments, useDesignations } from '../hooks/users-queries'
import { userFormSchema, type UserFormValues } from '../schemas/user-schema'
import { ManagerCombobox } from './manager-combobox'

interface UserFormProps {
  defaultValues: Partial<UserFormValues>
  onSubmit: (values: UserFormValues) => Promise<void>
  submitLabel: string
  submittingLabel: string
  serverError: string | null
  excludeUserId?: string
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-error">{message}</p>
}

export function UserForm({
  defaultValues,
  onSubmit,
  submitLabel,
  submittingLabel,
  serverError,
  excludeUserId,
}: UserFormProps) {
  const departmentsQuery = useDepartments()
  const designationsQuery = useDesignations()

  // Base UI's Select.Value renders the raw value by default (unlike
  // Radix, it does not mirror the matched SelectItem's children), so each
  // select needs an explicit label-lookup render function.
  const departmentLabel = (value: string) =>
    departmentsQuery.data?.find((d) => d.id === value)?.name ?? 'Select department'
  const designationLabel = (value: string) =>
    designationsQuery.data?.find((d) => d.id === value)?.name ?? 'Select designation'
  const employmentStatusLabel = (value: string) =>
    ({ active: 'Active', inactive: 'Inactive', resigned: 'Resigned' })[value] ?? value
  const accessLevelLabel = (value: string) =>
    ACCESS_LEVEL_LABELS[value as keyof typeof ACCESS_LEVEL_LABELS] ?? value

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    // Base UI's Select must stay controlled from the first render — an
    // initially `undefined` value flips it from uncontrolled to controlled
    // the moment a selection is made, which Base UI warns against.
    defaultValues: {
      departmentId: '',
      designationId: '',
      employmentStatus: 'active',
      accessLevel: 'general_user',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">Identity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" aria-invalid={Boolean(errors.fullName)} {...register('fullName')} />
            <FieldError message={errors.fullName?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="officialEmail">Official Email</Label>
            <Input
              id="officialEmail"
              type="email"
              aria-invalid={Boolean(errors.officialEmail)}
              {...register('officialEmail')}
            />
            <FieldError message={errors.officialEmail?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input id="employeeId" aria-invalid={Boolean(errors.employeeId)} {...register('employeeId')} />
            <FieldError message={errors.employeeId?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="userId">User ID</Label>
            <Input id="userId" aria-invalid={Boolean(errors.userId)} {...register('userId')} />
            <FieldError message={errors.userId?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">Employment</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="departmentId">Department</Label>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="departmentId" aria-invalid={Boolean(errors.departmentId)}>
                    <SelectValue>{departmentLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsQuery.data?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.departmentId?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="designationId">Designation</Label>
            <Controller
              name="designationId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="designationId" aria-invalid={Boolean(errors.designationId)}>
                    <SelectValue>{designationLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {designationsQuery.data?.map((designation) => (
                      <SelectItem key={designation.id} value={designation.id}>
                        {designation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.designationId?.message} />
          </div>

          <div className="space-y-1.5">
            <Label>Manager</Label>
            <Controller
              name="managerId"
              control={control}
              render={({ field }) => (
                <ManagerCombobox
                  value={field.value}
                  onChange={field.onChange}
                  excludeUserId={excludeUserId}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="joinDate">Join Date</Label>
            <Input id="joinDate" type="date" {...register('joinDate')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="employmentStatus">Employment Status</Label>
            <Controller
              name="employmentStatus"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="employmentStatus">
                    <SelectValue>{employmentStatusLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="resigned">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-1 text-sm font-semibold text-text">Access Level</h2>
        <p className="mb-4 text-xs text-text-secondary">
          Application access classification — separate from designation (job title). Only
          IT Administrators can set this.
        </p>
        <div className="max-w-xs space-y-1.5">
          <Controller
            name="accessLevel"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="accessLevel">
                  <SelectValue>{accessLevelLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ACCESS_LEVEL_LABELS) as (keyof typeof ACCESS_LEVEL_LABELS)[]).map(
                    (level) => (
                      <SelectItem key={level} value={level}>
                        {ACCESS_LEVEL_LABELS[level]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </section>

      {serverError ? (
        <p role="alert" className="text-sm text-error">
          {serverError}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}
