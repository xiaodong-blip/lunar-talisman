import {
  cleanText,
  connectBlobs,
  enforceRateLimit,
  json,
  methodNotAllowed,
  mutateJsonList,
  parseJson,
  requireTrustedOrigin,
  supportStore,
} from './_backend.mjs'

const ALLOWED_EVENTS = new Set([
  'page_view',
  'view_item',
  'add_to_cart',
  'begin_checkout',
  'payment_started',
  'purchase',
])

function dayKey() {
  return new Date().toISOString().slice(0, 10)
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()
  if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })

  const rate = enforceRateLimit(event, { limit: 80, windowMs: 10 * 60 * 1000 })
  if (!rate.ok) return json(429, { ok: false, error: 'rate_limited' })

  try {
    const input = parseJson(event, 8 * 1024)
    const name = cleanText(input.name, 60)
    if (!ALLOWED_EVENTS.has(name)) return json(400, { ok: false, error: 'invalid_analytics_event' })

    const key = dayKey()
    await mutateJsonList(supportStore(), 'analytics', (days) => {
      const current = days.find((item) => item?.date === key) || {
        date: key,
        pageViews: 0,
        productViews: 0,
        addToCart: 0,
        checkoutStarts: 0,
        paymentStarts: 0,
        purchases: 0,
        revenue: 0,
      }
      const next = { ...current }
      if (name === 'page_view') next.pageViews += 1
      if (name === 'view_item') next.productViews += 1
      if (name === 'add_to_cart') next.addToCart += 1
      if (name === 'begin_checkout') next.checkoutStarts += 1
      if (name === 'payment_started') next.paymentStarts += 1
      if (name === 'purchase') {
        next.purchases += 1
        next.revenue += Math.max(0, Number(input.value) || 0)
      }
      return [next, ...days.filter((item) => item?.date !== key)].slice(0, 90)
    })
    return json(202, { ok: true })
  } catch {
    return json(400, { ok: false, error: 'analytics_event_failed' })
  }
}
