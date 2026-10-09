import { useState, useEffect } from 'react'
import { Bell, LifeBuoy, CalendarDays, BellRing, CheckCircle2, Send, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { LoadingState } from '@/components/shared/loading-state'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/context/auth-context'
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushStatus,
  getPushSupportState,
  sendTestPushNotification,
  PushNotConfiguredError,
  type PushSupportState,
} from '../../notifications/api/push-api'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../hooks/use-notification-preferences'
import type { NotificationPreferencesRow } from '../api/notification-preferences-api'

interface NotificationPreferencesFormProps {
  initialPreferences: NotificationPreferencesRow
  isPendingMigration: boolean
}

function NotificationPreferencesForm({ initialPreferences, isPendingMigration }: NotificationPreferencesFormProps) {
  const { appUser } = useAuth()
  const updatePrefs = useUpdateNotificationPreferences()

  const [pushState, setPushState] = useState<PushSupportState>(() => getPushSupportState())
  const [pushMessage, setPushMessage] = useState<string | null>(null)
  const [pushError, setPushError] = useState<string | null>(null)
  const [isEnabling, setIsEnabling] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const [notifySupport, setNotifySupport] = useState(initialPreferences.notify_support)
  const [notifyBookings, setNotifyBookings] = useState(initialPreferences.notify_bookings)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!appUser) return

    getPushStatus(appUser.id).then((status) => {
      if (!cancelled) setPushState(status)
    })

    return () => {
      cancelled = true
    }
  }, [appUser])

  async function handleEnablePush() {
    if (!appUser) return
    setIsEnabling(true)
    setPushError(null)
    setPushMessage(null)
    try {
      await enablePushNotifications(appUser.id)
      setPushMessage('Push notifications are now enabled on this device.')
      setPushState('subscribed')
      // Also update push_enabled in user preferences
      await updatePrefs.mutateAsync({ push_enabled: true })
    } catch (err) {
      if (err instanceof PushNotConfiguredError) {
        setPushMessage(
          'Your browser is ready for push — notification permission was granted. Server-side delivery is not configured yet (missing VAPID public key), so nothing will be sent until that is finished.',
        )
      } else {
        setPushError(err instanceof Error ? err.message : 'Unable to enable push notifications.')
      }
      const current = await getPushStatus(appUser.id)
      setPushState(current)
    } finally {
      setIsEnabling(false)
    }
  }

  async function handleDisablePush() {
    if (!appUser) return
    setIsDisabling(true)
    setPushError(null)
    setPushMessage(null)
    try {
      await disablePushNotifications(appUser.id)
      setPushState('ready')
      setPushMessage('Push notifications have been disabled on this device.')
      // Also update push_enabled in user preferences
      await updatePrefs.mutateAsync({ push_enabled: false })
    } catch (err) {
      setPushError(err instanceof Error ? err.message : 'Unable to disable push notifications.')
    } finally {
      setIsDisabling(false)
    }
  }

  async function handleTestPush() {
    if (!appUser) return
    setIsTesting(true)
    setPushError(null)
    setPushMessage(null)
    try {
      const result = await sendTestPushNotification(appUser.id)
      if (result.reason === 'VAPID_NOT_CONFIGURED') {
        setPushMessage(
          'Your device is registered, but server-side VAPID keys are not configured in Supabase secrets yet.',
        )
      } else if (result.success && (result.sentCount ?? 0) > 0) {
        setPushMessage('Test push notification dispatched! Check your device for the notification.')
      } else if (result.reason === 'NO_ACTIVE_SUBSCRIPTIONS') {
        setPushMessage('No active subscription found on server. Try re-enabling push notifications.')
        setPushState('ready')
      } else {
        setPushMessage(result.message || 'Push dispatch completed.')
      }
    } catch (err) {
      setPushError(err instanceof Error ? err.message : 'Failed to send test push notification.')
    } finally {
      setIsTesting(false)
    }
  }

  async function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await updatePrefs.mutateAsync({
        notify_support: notifySupport,
        notify_bookings: notifyBookings,
        push_enabled: pushState === 'subscribed',
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save notification preferences.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isPendingMigration && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="font-semibold">Pending Database Migration (0047)</p>
              <p className="mt-1 leading-relaxed">
                Table <code className="font-mono text-xs">public.notification_preferences</code> does not exist on the database yet. Migration <code className="font-mono text-xs">20261009123000_0047_system_configuration_and_notification_preferences.sql</code> has been prepared. Preferences will persist once migration 0047 is applied.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Preferences Form */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <SectionPanel>
          <SectionHeader
            icon={Bell}
            title="Notification Categories"
            description="Choose which categories of updates you want to be notified about."
          />

          <div className="mt-4 space-y-4">
            <div className="rounded-md border border-border p-3.5 space-y-1">
              <div className="flex items-center gap-2">
                <input
                  id="notify-support"
                  type="checkbox"
                  checked={notifySupport}
                  onChange={(e) => setNotifySupport(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="notify-support" className="cursor-pointer font-medium text-sm flex items-center gap-1.5">
                  <LifeBuoy className="size-3.5 text-text-muted" aria-hidden />
                  IT Support Issues
                </Label>
              </div>
              <p className="text-xs text-text-secondary pl-6">
                Receive notifications when your support requests are acknowledged, in progress, on hold, or resolved.
              </p>
            </div>

            <div className="rounded-md border border-border p-3.5 space-y-1">
              <div className="flex items-center gap-2">
                <input
                  id="notify-bookings"
                  type="checkbox"
                  checked={notifyBookings}
                  onChange={(e) => setNotifyBookings(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="notify-bookings" className="cursor-pointer font-medium text-sm flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-text-muted" aria-hidden />
                  Resource Bookings
                </Label>
              </div>
              <p className="text-xs text-text-secondary pl-6">
                Receive notifications when your meeting room and company car bookings are confirmed, paused, or cancelled.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div>
              {saveSuccess && (
                <p className="flex items-center gap-1.5 text-xs text-success font-medium">
                  <CheckCircle2 className="size-4" aria-hidden />
                  Notification preferences saved.
                </p>
              )}
              {saveError && (
                <p className="flex items-center gap-1.5 text-xs text-error font-medium">
                  <AlertCircle className="size-4" aria-hidden />
                  {saveError}
                </p>
              )}
            </div>

            <Button type="submit" size="sm" disabled={updatePrefs.isPending}>
              {updatePrefs.isPending ? 'Saving…' : 'Save Preferences'}
            </Button>
          </div>
        </SectionPanel>
      </form>

      {/* Delivery Channels */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Delivery Channels</h2>

        {/* In-App Notifications */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Bell className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-text">In-app notifications — always on</p>
              <p className="mt-1 text-sm text-text-secondary">
                All notifications are delivered to the bell icon and your Notifications page. Critical administrative updates (e.g. ticket closed or booking denied) always appear here.
              </p>
            </div>
          </div>
        </div>

        {/* Browser Push Notifications */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <BellRing className="size-4" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text">Browser push notifications</p>
              <p className="mt-1 text-sm text-text-secondary">
                Get notified on this device even when ECI User Management isn't open in a tab.
              </p>

              {pushState === 'unsupported' && (
                <p className="mt-3 text-xs text-text-muted">Not supported in this browser.</p>
              )}
              {pushState === 'denied' && (
                <p className="mt-3 text-xs text-error">
                  Notifications are blocked for this site. Enable them in your browser's site settings.
                </p>
              )}
              {pushState === 'ready' && (
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleEnablePush}
                    disabled={isEnabling}
                  >
                    <BellRing className="size-3.5" aria-hidden />
                    {isEnabling ? 'Requesting…' : 'Enable Push Notifications'}
                  </Button>
                </div>
              )}
              {pushState === 'subscribed' && (
                <div className="mt-3 space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
                    <CheckCircle2 className="size-3.5" aria-hidden />
                    <span>Active on this device</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={handleTestPush}
                      disabled={isTesting}
                    >
                      <Send className="size-3.5" aria-hidden />
                      {isTesting ? 'Sending…' : 'Send Test Notification'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-text-muted hover:text-error"
                      onClick={handleDisablePush}
                      disabled={isDisabling}
                    >
                      {isDisabling ? 'Disabling…' : 'Disable on this device'}
                    </Button>
                  </div>
                </div>
              )}
              {pushMessage && <p className="mt-3 text-xs text-text-secondary">{pushMessage}</p>}
              {pushError && <p className="mt-3 text-xs text-error">{pushError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationPreferencesPage() {
  const { data: prefData, isPending: isPrefsPending, isError: isPrefsError } = useNotificationPreferences()

  if (isPrefsPending) {
    return <LoadingState label="Loading notification preferences…" />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notification Preferences"
        description="Configure your personal notification delivery channels and category settings."
      />

      {isPrefsError && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-xs text-error font-medium">
          Unable to load your saved preferences. Showing standard defaults.
        </div>
      )}

      {prefData && (
        <NotificationPreferencesForm
          key={prefData.preferences.id + prefData.preferences.updated_at}
          initialPreferences={prefData.preferences}
          isPendingMigration={prefData.isPendingMigration}
        />
      )}
    </div>
  )
}
