import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '../context/auth-context'
import {
  loginSchema,
  forgotPasswordSchema,
  type LoginFormValues,
  type ForgotPasswordFormValues,
} from '../schemas/login-schema'

export function LoginPage() {
  const { status, signIn } = useAuth()
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [serverError, setServerError] = useState<string | null>(null)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotSent, setForgotSent] = useState(false)

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    reset: resetForgot,
    formState: { errors: forgotErrors, isSubmitting: isSendingForgot },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  async function onLogin(values: LoginFormValues) {
    setServerError(null)
    const { error } = await signIn(values.email, values.password)
    if (error) {
      setServerError(error)
    }
  }

  async function onForgot(values: ForgotPasswordFormValues) {
    setForgotError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setForgotError(
        'Unable to send password recovery instructions. Please verify your email or contact IT Administration.',
      )
      return
    }
    setForgotSent(true)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-text">ECI User Management</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {mode === 'login'
              ? 'Sign in to continue'
              : 'Password recovery'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit(onLogin)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(loginErrors.email)}
                {...registerLogin('email')}
              />
              {loginErrors.email ? (
                <p className="text-xs text-error">{loginErrors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => {
                    setServerError(null)
                    setForgotError(null)
                    setForgotSent(false)
                    setMode('forgot')
                  }}
                  className="text-xs text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(loginErrors.password)}
                {...registerLogin('password')}
              />
              {loginErrors.password ? (
                <p className="text-xs text-error">{loginErrors.password.message}</p>
              ) : null}
            </div>

            {serverError ? (
              <p role="alert" className="text-sm text-error">
                {serverError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        ) : forgotSent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">Recovery Email Sent</h2>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                If an account is associated with that email, we have sent instructions to reset your
                password. Please check your inbox and follow the link provided.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                resetForgot()
                setForgotSent(false)
                setMode('login')
              }}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit(onForgot)} noValidate className="space-y-4">
            <p className="text-xs text-text-secondary">
              Enter your official work email address. We will send a secure link to reset your
              password.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(forgotErrors.email)}
                {...registerForgot('email')}
              />
              {forgotErrors.email ? (
                <p className="text-xs text-error">{forgotErrors.email.message}</p>
              ) : null}
            </div>

            {forgotError ? (
              <p role="alert" className="text-sm text-error">
                {forgotError}
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isSendingForgot}>
                {isSendingForgot ? 'Sending link…' : 'Send Recovery Link'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-1.5 text-xs text-text-secondary"
                onClick={() => {
                  setForgotError(null)
                  setMode('login')
                }}
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                Back to Sign In
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

