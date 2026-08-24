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

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function findPayableOrder(store, orderId) {
  // Netlify Blobs can take a brief moment to surface a write made by the
  // immediately preceding checkout function invocation. Retry the read before
  // reporting a missing order, so a buyer never has to press PayPal twice.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orders = await readJsonList(store, KEY)
    const order = orders.find((item) => item?.id === orderId)
    if (order) return order
    if (attempt < 4) await wait(180)
  }
  return null
}

function paypalFailure(error) {
  const details = error?.details || {}
  const issue = Array.isArray(details?.details) ? details.details[0]?.issue : ''
  const code = String(issue || details?.name || error?.code || 'paypal_create_order_failed')
  const messages = {
    AUTHENTICATION_FAILURE:
      'PayPal rejected the Live API credentials. Recheck the Live Client ID and Secret in Netlify.',
    INVALID_CLIENT:
      'PayPal rejected the Live API credentials. Recheck the Live Client ID and Secret in Netlify.',
    PAYEE_ACCOUNT_RESTRICTED:
      'PayPal cannot receive this payment because the merchant account is restricted or not fully verified.',
    PAYEE_NOT_ENABLED_FOR_CARD_PROCESSING:
      'PayPal payments are not enabled for this merchant account yet. Complete the account onboarding in PayPal.',
    RECEIVER_ACCOUNT_RESTRICTED:
      'PayPal cannot receive this payment because the merchant account is restricted or not fully verified.',
    CURRENCY_NOT_SUPPORTED:
      'This PayPal account is not currently enabled to receive USD payments.',
  }
  return {
    code,
    message:
      messages[code] ||
      'PayPal could not create the payment. Please retry, or check the PayPal Live account status.',
    debugId: String(details?.debug_id || '').slice(0, 120),
  }
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
    const payableOrder = await findPayableOrder(store, safeOrderId)

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
    const failure = paypalFailure(error)
    return json(status, {
      ok: false,
      error: failure.code,
      message: failure.message,
      debugId: failure.debugId,
    })
  }
}
