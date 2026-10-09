import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/settings/schemas/password-schema'

/**
 * Landing page for a Supabase Auth recovery link (self-service forgot-
 * password, or an IT-Administrator-initiated reset). supabase-js parses the
 * recovery tokens out of the URL on load (detectSessionInUrl is on by
 * default) and establishes a temporary session — this page just waits for
 * that, then lets the user set a new password via the same updateUser call
 * the Settings > Password page already uses.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [sessionReady, setSessionReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  useEffect(() => {
    let isMounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSessionReady(Boolean(data.session))
      setChecking(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setSessionReady(true)
        setChecking(false)
      }
    })
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function onSubmit(values: ChangePasswordFormValues) {
    setServerError(null)
    const { error } = await supabase.auth.updateUser({ password: values.newPassword })
    if (error) {
      setServerError('Unable to set your new password. The reset link may have expired — request a new one.')
      return
    }
    setSuccess(true)
    await supabase.auth.signOut()
    setTimeout(() => navigate('/login', { replace: true }), 2000)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-text">Set a New Password</h1>
          <p className="mt-1 text-sm text-text-secondary">ECI User Management</p>
        </div>

        {checking ? (
          <p className="text-sm text-text-secondary text-center">Verifying your reset link…</p>
        ) : !sessionReady ? (
          <p className="text-sm text-error text-center">
            This reset link is invalid or has expired. Request a new one from your IT Administrator or
            the sign-in page.
          </p>
        ) : success ? (
          <p role="status" className="text-sm text-success text-center">
            Password updated. Redirecting to sign in…
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.newPassword)}
                {...register('newPassword')}
              />
              {errors.newPassword ? <p className="text-xs text-error">{errors.newPassword.message}</p> : null}
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Set Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
