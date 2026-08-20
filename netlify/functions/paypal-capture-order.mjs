import {
  connectBlobs,
  enforceRateLimit,
  json,
  methodNotAllowed,
  mutateJsonList,
  ordersStore,
  parseJson,
  readJsonList,
  requireTrustedOrigin,
} from './_backend.mjs'
import { sendOrderPaidEmails } from './_email.mjs'
import { isPaypalConfigured, paypalRequest, siteUrl } from './_paypal.mjs'

const KEY = 'orders'

function clean(value, maxLength = 160) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

function captureId(data) {
  return data?.purchase_units?.[0]?.payments?.captures?.[0]?.id || ''
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()
  if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })
  if (!isPaypalConfigured()) return json(503, { ok: false, error: 'paypal_not_configured' })

  const rate = enforceRateLimit(event, { limit: 12, windowMs: 10 * 60 * 1000 })
  if (!rate.ok) {
    return json(
      429,
      { ok: false, error: 'rate_limited', retryAfter: rate.retryAfter },
      { 'Retry-After': String(rate.retryAfter) },
    )
  }

  try {
    const { paypalOrderId = '' } = parseJson(event)
    const safePaypalOrderId = clean(paypalOrderId, 140)
    if (!safePaypalOrderId) return json(400, { ok: false, error: 'invalid_paypal_order_id' })

    const store = ordersStore()
    const order = (await readJsonList(store, KEY)).find(
      (item) => item?.paymentId === safePaypalOrderId,
    )

    if (!order) return json(404, { ok: false, error: 'payment_order_not_found' })
    if (order.paymentStatus === 'paid') return json(200, { ok: true, order, duplicate: true })

    const captured = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(safePaypalOrderId)}/capture`, {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `capture-${order.id}` },
      body: '{}',
    })
    const unit = captured?.purchase_units?.[0]
    if (
      captured?.status !== 'COMPLETED' ||
      unit?.custom_id !== order.id ||
      unit?.amount?.currency_code !== 'USD' ||
      money(unit?.amount?.value) !== money(order.amount)
    ) {
      return json(409, { ok: false, error: 'paypal_capture_not_verified' })
    }

    const now = new Date().toISOString()
    const paymentCaptureId = captureId(captured)
    let paidOrder
    await mutateJsonList(store, KEY, (orders) =>
      orders.map((item) => {
        if (item?.id !== order.id || item.paymentStatus === 'paid') return item
        paidOrder = {
          ...item,
          paymentStatus: 'paid',
          paymentCapturedAt: now,
          paymentCaptureId,
          status: '已付款',
          shippingStatus: '待发货',
          trackingEvents: [
            ...(Array.isArray(item.trackingEvents) ? item.trackingEvents.slice(-19) : []),
            {
              status: '已付款',
              detail: 'PayPal payment confirmed. The fulfilment team has been notified.',
              at: now,
            },
          ],
        }
        return paidOrder
      }),
    )

    if (!paidOrder) return json(200, { ok: true, order, duplicate: true })
    await sendOrderPaidEmails(paidOrder, siteUrl(event))
    return json(200, { ok: true, order: paidOrder })
  } catch (error) {
    const status = error?.code === 'request_body_too_large' ? 413 : 502
    return json(status, { ok: false, error: error?.code || 'paypal_capture_failed' })
  }
}
