import {
  cleanText,
  connectBlobs,
  enforceRateLimit,
  json,
  methodNotAllowed,
  ordersStore,
  parseJson,
  readJsonList,
} from './_backend.mjs'

const KEY = 'orders'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toPublicOrder(order) {
  return {
    id: order.id,
    product: order.product,
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        }))
      : [],
    shippingMethod: order.shippingMethod || 'standard',
    shippingRegion: order.shippingRegion || '',
    shippingCountry: order.shippingCountry || '',
    shippingStatus: order.shippingStatus || '待发货',
    trackingNumber: order.trackingNumber || '',
    trackingCarrier: order.trackingCarrier || '',
    createdAt: order.createdAt,
    trackingEvents: Array.isArray(order.trackingEvents) ? order.trackingEvents.slice(-20) : [],
  }
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()

  const rate = enforceRateLimit(event, { limit: 10, windowMs: 10 * 60 * 1000 })
  if (!rate.ok) {
    return json(
      429,
      { ok: false, error: 'rate_limited', retryAfter: rate.retryAfter },
      { 'Retry-After': String(rate.retryAfter) },
    )
  }

  try {
    const input = parseJson(event)
    const orderId = cleanText(input.orderId, 120).toUpperCase()
    const email = cleanText(input.email, 254).toLowerCase()

    if (!orderId || !EMAIL_RE.test(email)) {
      return json(400, { ok: false, error: 'invalid_tracking_lookup' })
    }

    const orders = await readJsonList(ordersStore(), KEY)
    const order = orders.find(
      (item) =>
        String(item?.id || '').toUpperCase() === orderId &&
        String(item?.email || '').trim().toLowerCase() === email,
    )

    // Keep the response deliberately small: address, phone, notes, and payment data
    // must never be exposed by a public order-lookup endpoint.
    if (!order) return json(404, { ok: false, error: 'order_not_found' })

    return json(200, { ok: true, order: toPublicOrder(order) })
  } catch (error) {
    const status = error?.code === 'request_body_too_large' ? 413 : 500
    return json(status, { ok: false, error: error?.code || 'tracking_lookup_failed' })
  }
}
