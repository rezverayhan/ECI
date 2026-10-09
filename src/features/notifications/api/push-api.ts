import { supabase } from '@/lib/supabase/client'

export type PushSupportState = 'unsupported' | 'denied' | 'ready' | 'subscribed'

export function getPushSupportState(): 'unsupported' | 'denied' | 'ready' {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported'
  }
  if (Notification.permission === 'denied') return 'denied'
  return 'ready'
}

/** VAPID public keys are base64url; the Push API needs a raw Uint8Array. */
function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

export class PushNotConfiguredError extends Error {
  constructor() {
    super('Push notifications are not yet configured on the server (missing VAPID public key).')
  }
}

/** Retrieves the current browser push subscription if one exists. */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (getPushSupportState() === 'unsupported') return null
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return null
    return await reg.pushManager.getSubscription()
  } catch {
    return null
  }
}

/** Checks whether push is unsupported, denied, ready, or actively subscribed on this device. */
export async function getPushStatus(userId: string): Promise<PushSupportState> {
  const base = getPushSupportState()
  if (base !== 'ready') return base

  try {
    const sub = await getCurrentPushSubscription()
    if (!sub) return 'ready'

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id, is_active')
      .eq('user_id', userId)
      .eq('endpoint', sub.endpoint)
      .maybeSingle()

    if (!error && data?.is_active) {
      return 'subscribed'
    }
    return 'ready'
  } catch {
    return 'ready'
  }
}

/**
 * Requests browser permission, registers service worker, subscribes to the push manager,
 * and upserts the active device endpoint to `push_subscriptions`.
 */
export async function enablePushNotifications(userId: string): Promise<void> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notifications are blocked. Enable them in your browser settings to use this.'
        : 'Permission was not granted.',
    )
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
  if (!vapidPublicKey || vapidPublicKey.trim() === '') {
    throw new PushNotConfiguredError()
  }

  let registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    registration = await navigator.serviceWorker.register('/sw.js')
  }
  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }

  const json = subscription.toJSON()
  if (!json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('This browser did not return a usable subscription key.')
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh_key: json.keys.p256dh,
      auth_key: json.keys.auth,
      user_agent: navigator.userAgent,
      is_active: true,
    },
    { onConflict: 'endpoint' },
  )
  if (error) throw error
}

/** Unsubscribes in the browser and marks the subscription inactive in Supabase. */
export async function disablePushNotifications(userId: string): Promise<void> {
  const sub = await getCurrentPushSubscription()
  if (sub) {
    try {
      await sub.unsubscribe()
    } catch (err) {
      console.warn('Browser push unsubscribe error:', err)
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('endpoint', sub.endpoint)
      .eq('user_id', userId)

    if (error) throw error
  }
}

export interface PushDeliveryResult {
  success: boolean
  reason?: string
  message?: string
  sentCount?: number
  failedCount?: number
  expiredCount?: number
}

/**
 * Triggers server-side push delivery for an existing notification record.
 * Best-effort: failures never disrupt the in-app notification flow.
 */
export async function sendPushForNotification(notificationId: string): Promise<PushDeliveryResult> {
  try {
    const { data, error } = await supabase.functions.invoke<PushDeliveryResult>('send-push-notification', {
      body: { notificationId },
    })
    if (error) {
      console.warn('send-push-notification invoke returned error:', error)
      return { success: false, reason: error.message }
    }
    return data ?? { success: true }
  } catch (err) {
    console.warn('send-push-notification invoke failed:', err)
    return { success: false, reason: err instanceof Error ? err.message : String(err) }
  }
}

/** Dispatches a test notification to the current user's registered devices. */
export async function sendTestPushNotification(userId: string): Promise<PushDeliveryResult> {
  const { data, error } = await supabase.functions.invoke<PushDeliveryResult>('send-push-notification', {
    body: {
      recipientUserId: userId,
      title: 'ECI Notification Test',
      message: 'Push notifications are successfully configured and active on this device!',
      url: '/app/settings/notifications',
    },
  })
  if (error) throw error
  return data ?? { success: true }
}
