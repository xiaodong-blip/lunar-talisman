let analyticsInitialized = false

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function getMeasurementId() {
  return import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
}

export function initAnalytics() {
  if (analyticsInitialized || typeof window === 'undefined') return
  const measurementId = getMeasurementId()
  if (!measurementId) return

  analyticsInitialized = true
  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer?.push(args)
    })
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
}

export function trackPageView(path: string) {
  const measurementId = getMeasurementId()
  if (!measurementId || typeof window === 'undefined') return
  initAnalytics()
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    send_to: measurementId,
  })
}

export function trackEvent(
  name: string,
  parameters: Record<string, string | number | boolean> = {},
) {
  if (typeof window === 'undefined' || !getMeasurementId()) return
  initAnalytics()
  window.gtag?.('event', name, parameters)
}
