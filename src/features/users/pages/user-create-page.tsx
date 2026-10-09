import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/page-header'
import { emptyToNull } from '@/lib/forms'
import { translateSupabaseError } from '@/lib/supabase/translate-error'
import { UserForm } from '../components/user-form'
import { useCreateUser } from '../hooks/users-mutations'
import type { UserFormValues } from '../schemas/user-schema'

export function UserCreatePage() {
  const navigate = useNavigate()
  const createUser = useCreateUser()
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSubmit(values: UserFormValues) {
    setServerError(null)
    try {
      const result = await createUser.mutateAsync({
        full_name: values.fullName,
        employee_id: emptyToNull(values.employeeId),
        user_id: values.userId,
        official_email: values.officialEmail,
        phone: emptyToNull(values.phone),
        department_id: values.departmentId,
        designation_id: emptyToNull(values.designationId),
        manager_id: emptyToNull(values.managerId),
        join_date: emptyToNull(values.joinDate),
        employment_status: values.employmentStatus,
        access_level: values.accessLevel,
      })
      navigate(`/app/users/${result.user.id}`, {
        state: {
          toast: result.accountProvisioned
            ? 'User created successfully. A secure account-setup email has been sent.'
            : `User record created, but the login account could not be provisioned automatically (${result.provisionError}). Use "Provision Login Account" on their profile to retry.`,
        },
      })
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        setServerError(translateSupabaseError(error as never))
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Add User" description="Create a new employee IT record." />
      <UserForm
        defaultValues={{}}
        onSubmit={handleSubmit}
        submitLabel="Create User"
        submittingLabel="Creating…"
        serverError={serverError}
      />
    </div>
  )
}
