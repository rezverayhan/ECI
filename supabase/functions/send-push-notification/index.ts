// Supabase Edge Function: send-push-notification
// Secure server-side Web Push sender using VAPID and RFC 8291 / 8292.
//
// VAPID private key and service role key never leave this server-side execution environment.
// Automatically deactivates expired (404/410) subscriptions in public.push_subscriptions.
// Handles missing VAPID configuration, webhooks, and direct client invocations honestly.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory deduplication cache: prevents duplicate pushes when both direct trigger
// and database webhook fire for the same notification row.
const recentNotificationDispatches = new Map<string, number>()

function readKey(newEnvVar: string, legacyEnvVar: string): string {
  const dict = Deno.env.get(newEnvVar)
  if (dict) {
    try {
      const parsed = JSON.parse(dict)
      if (typeof parsed?.default === 'string' && parsed.default) return parsed.default
    } catch {
      // fall through to legacy
    }
  }
  return Deno.env.get(legacyEnvVar) ?? ''
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const publishableKey = readKey('SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY')
  const serviceRoleKey = readKey('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY')

  // Verify caller identity: must be authenticated with Supabase JWT or service role key
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Not authenticated.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.replace(/^Bearer\s+/i, '')
  const isServiceRoleCaller = serviceRoleKey && token === serviceRoleKey

  if (!isServiceRoleCaller) {
    const callerClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await callerClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  // Parse payload (supports DB webhook payload, { notificationId }, or direct { recipientUserId, title, message, url })
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Check VAPID configuration early
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:support@eci.com'

  if (!vapidPublicKey || !vapidPrivateKey) {
    return new Response(
      JSON.stringify({
        success: false,
        reason: 'VAPID_NOT_CONFIGURED',
        message: 'Server-side VAPID keys (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY) are not configured in Supabase secrets.',
        sentCount: 0,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  let notificationId: string | undefined
  let recipientUserId: string | undefined
  let title: string | undefined
  let message: string | undefined
  let relatedEntityType: string | undefined
  let relatedEntityId: string | undefined
  let targetUrl: string | undefined

  if (body.type === 'INSERT' && body.table === 'notifications' && body.record && typeof body.record === 'object') {
    const record = body.record as Record<string, unknown>
    notificationId = typeof record.id === 'string' ? record.id : undefined
    recipientUserId = typeof record.recipient_user_id === 'string' ? record.recipient_user_id : undefined
    title = typeof record.title === 'string' ? record.title : undefined
    message = typeof record.message === 'string' ? record.message : undefined
    relatedEntityType = typeof record.related_entity_type === 'string' ? record.related_entity_type : undefined
    relatedEntityId = typeof record.related_entity_id === 'string' ? record.related_entity_id : undefined
  } else if (typeof body.notificationId === 'string') {
    notificationId = body.notificationId
    const { data: notif, error: notifError } = await adminClient
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .maybeSingle()

    if (notifError || !notif) {
      return new Response(JSON.stringify({ error: 'Notification not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    recipientUserId = notif.recipient_user_id
    title = notif.title
    message = notif.message ?? undefined
    relatedEntityType = notif.related_entity_type ?? undefined
    relatedEntityId = notif.related_entity_id ?? undefined
  } else if (typeof body.recipientUserId === 'string' && typeof body.title === 'string') {
    recipientUserId = body.recipientUserId
    title = body.title
    message = typeof body.message === 'string' ? body.message : undefined
    targetUrl = typeof body.url === 'string' ? body.url : undefined
  }

  if (!recipientUserId || !title) {
    return new Response(JSON.stringify({ error: 'Missing required recipientUserId or title.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Deduplication check: suppress duplicate pushes within 60 seconds for the same notificationId
  if (notificationId) {
    const now = Date.now()
    const lastDispatched = recentNotificationDispatches.get(notificationId)
    if (lastDispatched && now - lastDispatched < 60_000) {
      return new Response(
        JSON.stringify({
          success: true,
          reason: 'DUPLICATE_SUPPRESSED',
          message: 'Duplicate push dispatch suppressed.',
          sentCount: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    recentNotificationDispatches.set(notificationId, now)
    // Clean up older cache entries
    for (const [key, timestamp] of recentNotificationDispatches.entries()) {
      if (now - timestamp > 120_000) recentNotificationDispatches.delete(key)
    }
  }

  // Derive destination URL if not explicitly set
  if (!targetUrl) {
    if (relatedEntityType === 'support_issues' && relatedEntityId) {
      targetUrl = `/app/support/${relatedEntityId}`
    } else if (relatedEntityType === 'meeting_room_bookings') {
      targetUrl = `/app/bookings/meeting-rooms`
    } else if (relatedEntityType === 'car_bookings') {
      targetUrl = `/app/bookings/cars`
    } else {
      targetUrl = '/app/notifications'
    }
  }

  // Check recipient's notification preferences if configured
  const { data: prefs } = await adminClient
    .from('notification_preferences')
    .select('notify_support, notify_bookings, push_enabled')
    .eq('user_id', recipientUserId)
    .maybeSingle()

  if (prefs) {
    if (prefs.push_enabled === false) {
      return new Response(
        JSON.stringify({
          success: true,
          reason: 'PUSH_DISABLED_BY_PREFERENCE',
          message: 'Recipient has disabled push notifications in preferences.',
          sentCount: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (relatedEntityType === 'support_issues' && prefs.notify_support === false) {
      return new Response(
        JSON.stringify({
          success: true,
          reason: 'SUPPORT_NOTIFICATIONS_DISABLED',
          message: 'Recipient has disabled support notifications in preferences.',
          sentCount: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (
      (relatedEntityType === 'meeting_room_bookings' || relatedEntityType === 'car_bookings') &&
      prefs.notify_bookings === false
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          reason: 'BOOKING_NOTIFICATIONS_DISABLED',
          message: 'Recipient has disabled booking notifications in preferences.',
          sentCount: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
  }

  // Query active subscriptions for recipient
  const { data: subscriptions, error: subsError } = await adminClient
    .from('push_subscriptions')
    .select('id, endpoint, p256dh_key, auth_key')
    .eq('user_id', recipientUserId)
    .eq('is_active', true)

  if (subsError) {
    console.error('Failed to query push_subscriptions:', subsError)
    return new Response(JSON.stringify({ error: 'Database error reading push subscriptions.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!subscriptions || subscriptions.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        reason: 'NO_ACTIVE_SUBSCRIPTIONS',
        message: 'No active push subscriptions registered for this user.',
        sentCount: 0,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  // Configure VAPID details
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  } catch (err) {
    console.error('Invalid VAPID configuration:', err)
    return new Response(
      JSON.stringify({
        success: false,
        reason: 'INVALID_VAPID_KEYS',
        message: 'VAPID keys could not be loaded by web-push library.',
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const pushPayload = JSON.stringify({
    title,
    message: message || '',
    url: targetUrl,
  })

  let sentCount = 0
  let failedCount = 0
  let expiredCount = 0
  const expiredIds: string[] = []

  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh_key,
        auth: sub.auth_key,
      },
    }

    try {
      await webpush.sendNotification(pushSubscription, pushPayload, {
        TTL: 86400, // 24 hours
        urgency: 'normal',
      })
      sentCount++
    } catch (err: unknown) {
      failedCount++
      const statusCode = (err as { statusCode?: number })?.statusCode
      // 404 or 410 indicates the push service unregistered or expired this subscription
      if (statusCode === 404 || statusCode === 410) {
        expiredCount++
        expiredIds.push(sub.id)
      } else {
        console.error(`Web push error on subscription ${sub.id}:`, err)
      }
    }
  }

  // Deactivate expired subscriptions so future sends do not waste resources
  if (expiredIds.length > 0) {
    const { error: deactivateError } = await adminClient
      .from('push_subscriptions')
      .update({ is_active: false })
      .in('id', expiredIds)

    if (deactivateError) {
      console.warn('Failed to deactivate expired push subscriptions:', deactivateError)
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      sentCount,
      failedCount,
      expiredCount,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
