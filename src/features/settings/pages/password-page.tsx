import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/page-header'
import { supabase } from '@/lib/supabase/client'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../schemas/password-schema'

export function PasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setServerError(null)
    setSuccess(false)
    const { error } = await supabase.auth.updateUser({ password: values.newPassword })
    if (error) {
      setServerError('Unable to update your password. Please try again.')
      return
    }
    setSuccess(true)
    reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Password" description="Change your account password." />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="max-w-sm space-y-4 rounded-lg border border-border bg-surface p-6"
      >
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.newPassword)}
            {...register('newPassword')}
          />
          {errors.newPassword ? (
            <p className="text-xs text-error">{errors.newPassword.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-error">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        {serverError ? (
          <p role="alert" className="text-sm text-error">
            {serverError}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="text-sm text-success">
            Password changed successfully.
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
