// ECI User Management — minimal app-shell service worker.
//
// Scope is deliberately narrow: cache this app's own static shell only.
// Any request whose origin isn't this page's own origin (Supabase REST,
// Auth, Storage, Realtime, Edge Functions all live on a different origin)
// is never touched here — it falls straight through to the network,
// unread and uncached. Authenticated data never passes through this file.
const CACHE_NAME = 'eci-shell-v1'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Cross-origin (Supabase, fonts, anything else) — never intercept.
  if (url.origin !== self.location.origin) return
  // Only GET is safe to serve from cache.
  if (event.request.method !== 'GET') return

  // Navigations: network-first, so a deploy is picked up immediately;
  // cache is only the offline fallback, never a stale authenticated page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/').then((res) => res ?? Response.error())),
    )
    return
  }

  // Hashed build assets and the static shell: cache-first.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        }
        return response
      })
    }),
  )
})

// Dormant until a real push-delivery backend exists (none does yet — see
// the implementation report). Spec-correct so it activates with zero
// service-worker changes once VAPID + a send mechanism are added.
self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload
  try {
    payload = event.data.json()
  } catch {
    return
  }
  const title = payload.title ?? 'ECI User Management'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.message,
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: payload.url ?? '/app/notifications' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url ?? '/app/notifications'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          if ('navigate' in client && client.url !== target) {
            client.navigate(target)
          }
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target)
      }
    }),
  )
})
