import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/page-header'
import { useAuth } from '@/features/auth/context/auth-context'
import { ACCESS_LEVEL_LABELS } from '@/features/auth/access-level-labels'
import { emptyToNull } from '@/lib/forms'
import { translateSupabaseError } from '@/lib/supabase/translate-error'
import { useUpdateUser } from '@/features/users/hooks/users-mutations'
import { selfProfileSchema, type SelfProfileFormValues } from '@/features/users/schemas/user-schema'

function ReadOnlyField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-sm text-text">{value || '—'}</dd>
    </div>
  )
}

export function ProfilePage() {
  const { appUser, accessLevel } = useAuth()
  const updateUser = useUpdateUser()
  const [isEditing, setIsEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SelfProfileFormValues>({
    resolver: zodResolver(selfProfileSchema),
    defaultValues: { fullName: appUser?.full_name ?? '', phone: appUser?.phone ?? undefined },
  })

  if (!appUser) return null

  async function onSubmit(values: SelfProfileFormValues) {
    setServerError(null)
    setSuccess(false)
    try {
      await updateUser.mutateAsync({
        id: appUser!.id,
        input: { full_name: values.fullName, phone: emptyToNull(values.phone) },
        previous: appUser!,
        auditAction: 'USER_UPDATED',
      })
      setSuccess(true)
      setIsEditing(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        setServerError(translateSupabaseError(error as never))
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="My Profile" description="Your personal and employment information." />
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="max-w-sm space-y-4 rounded-lg border border-border bg-surface p-6"
        >
          <p className="text-xs text-text-secondary">
            Only your name and phone number can be changed here. Other fields are
            organization-controlled — contact IT if they need to change.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" aria-invalid={Boolean(errors.fullName)} {...register('fullName')} />
            {errors.fullName ? <p className="text-xs text-error">{errors.fullName.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          {serverError ? <p className="text-sm text-error">{serverError}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset()
                setIsEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Profile" description="Your personal and employment information." />
      {success ? (
        <p role="status" className="rounded-lg bg-primary-soft px-3 py-2 text-sm text-primary">
          Profile updated successfully.
        </p>
      ) : null}
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Profile</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              reset({ fullName: appUser.full_name, phone: appUser.phone ?? undefined })
              setIsEditing(true)
            }}
          >
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ReadOnlyField label="Full Name" value={appUser.full_name} />
          <ReadOnlyField label="Phone" value={appUser.phone} />
          <ReadOnlyField label="Employee ID" value={appUser.employee_id} />
          <ReadOnlyField label="User ID" value={appUser.user_id} />
          <ReadOnlyField label="Official Email" value={appUser.official_email} />
          <ReadOnlyField
            label="Access Level"
            value={accessLevel ? ACCESS_LEVEL_LABELS[accessLevel] : null}
          />
          <ReadOnlyField label="Employment Status" value={appUser.employment_status} />
          <ReadOnlyField label="Join Date" value={appUser.join_date} />
        </dl>
        <p className="mt-4 text-xs text-text-muted">
          Employee ID, User ID, Official Email, Access Level and Employment Status are
          organization-controlled and can only be changed by IT.
        </p>
      </div>
    </div>
  )
}
