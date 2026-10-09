/**
 * Registers the app-shell service worker. Production only — in dev, Vite's
 * own server already handles fast reloads, and a caching SW there just
 * fights HMR. Safe to call from any page; does nothing if unsupported.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed', error)
    })
  }

  if (document.readyState === 'complete') {
    register()
  } else {
    window.addEventListener('load', register)
  }
}
