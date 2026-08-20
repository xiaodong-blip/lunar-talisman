import {
  connectBlobs,
  json,
  methodNotAllowed,
  mutateJsonList,
  ordersStore,
  parseJson,
  readJsonList,
  requireTrustedOrigin,
} from './_backend.mjs'

const KEY = 'orders'

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()
  if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })

  try {
    const { paypalOrderId = '' } = parseJson(event)
    const safePaypalOrderId = String(paypalOrderId).trim().slice(0, 140)
    if (!safePaypalOrderId) return json(400, { ok: false, error: 'invalid_paypal_order_id' })

    const existing = (await readJsonList(ordersStore(), KEY)).find(
      (order) => order?.paymentId === safePaypalOrderId,
    )
    if (existing?.paymentStatus === 'paid') {
      return json(409, { ok: false, error: 'payment_already_completed' })
    }

    let updated = false
    await mutateJsonList(ordersStore(), KEY, (orders) =>
      orders.map((order) => {
        if (order?.paymentId !== safePaypalOrderId || order.paymentStatus !== 'pending') return order
        updated = true
        return {
          ...order,
          paymentStatus: 'failed',
          paymentCancelledAt: new Date().toISOString(),
          trackingEvents: [
            ...(Array.isArray(order.trackingEvents) ? order.trackingEvents.slice(-19) : []),
            {
              status: 'Payment cancelled',
              detail: 'The customer returned from PayPal without completing payment.',
              at: new Date().toISOString(),
            },
          ],
        }
      }),
    )
    return json(200, { ok: true, updated })
  } catch {
    return json(400, { ok: false, error: 'paypal_cancel_failed' })
  }
}
