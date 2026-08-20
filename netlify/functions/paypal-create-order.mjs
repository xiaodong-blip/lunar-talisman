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
import { isPaypalConfigured, paypalRequest, siteUrl } from './_paypal.mjs'

const KEY = 'orders'

function clean(value, maxLength = 160) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()
  if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })
  if (!isPaypalConfigured()) {
    return json(503, { ok: false, error: 'paypal_not_configured' })
  }

  const rate = enforceRateLimit(event, { limit: 12, windowMs: 10 * 60 * 1000 })
  if (!rate.ok) {
    return json(
      429,
      { ok: false, error: 'rate_limited', retryAfter: rate.retryAfter },
      { 'Retry-After': String(rate.retryAfter) },
    )
  }

  try {
    const { orderId = '' } = parseJson(event)
    const safeOrderId = clean(orderId, 120)
    if (!safeOrderId) return json(400, { ok: false, error: 'invalid_order_id' })

    const store = ordersStore()
    const orders = await readJsonList(store, KEY)
    const payableOrder = orders.find((order) => order?.id === safeOrderId)

    if (!payableOrder) return json(404, { ok: false, error: 'order_not_found' })
    if (payableOrder.paymentStatus === 'paid') {
      return json(409, { ok: false, error: 'order_already_paid' })
    }
    if (payableOrder.paymentId && payableOrder.paymentStatus !== 'failed') {
      return json(409, { ok: false, error: 'payment_already_created' })
    }

    const url = siteUrl(event)
    const paypalOrder = await paypalRequest('/v2/checkout/orders', {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `create-${safeOrderId}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: safeOrderId,
            custom_id: safeOrderId,
            invoice_id: safeOrderId,
            description: clean(payableOrder.product, 127),
            amount: { currency_code: 'USD', value: money(payableOrder.amount) },
          },
        ],
        application_context: {
          brand_name: 'Lunar Talisman',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
          return_url: `${url}/cart?paypal=success`,
          cancel_url: `${url}/cart?paypal=cancel`,
        },
      }),
    })

    const approvalUrl = paypalOrder.links?.find((link) => link.rel === 'approve')?.href
    if (!paypalOrder.id || !approvalUrl) {
      return json(502, { ok: false, error: 'paypal_approval_unavailable' })
    }

    let updated = false
    await mutateJsonList(store, KEY, (orders) =>
      orders.map((order) => {
        if (
          order?.id !== safeOrderId ||
          (order.paymentId && order.paymentStatus !== 'failed')
        ) {
          return order
        }
        updated = true
        return {
          ...order,
          paymentStatus: 'pending',
          paymentProvider: 'paypal',
          paymentId: paypalOrder.id,
          paymentApprovalUrl: approvalUrl,
          paymentCreatedAt: new Date().toISOString(),
        }
      }),
    )

    if (!updated) {
      return json(409, { ok: false, error: 'payment_already_created' })
    }

    return json(201, { ok: true, paypalOrderId: paypalOrder.id, approvalUrl })
  } catch (error) {
    const status = error?.code === 'request_body_too_large' ? 413 : 502
    return json(status, { ok: false, error: error?.code || 'paypal_create_order_failed' })
  }
}
