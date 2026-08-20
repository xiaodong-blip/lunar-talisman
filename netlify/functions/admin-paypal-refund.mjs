import {
  connectBlobs,
  json,
  methodNotAllowed,
  mutateJsonList,
  ordersStore,
  parseJson,
  readJsonList,
  requireAdmin,
  requireTrustedOrigin,
} from './_backend.mjs'
import { sendRefundEmail } from './_email.mjs'
import { isPaypalConfigured, paypalRequest } from './_paypal.mjs'

const KEY = 'orders'

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()
  if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })
  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })
  if (!isPaypalConfigured()) return json(503, { ok: false, error: 'paypal_not_configured' })

  try {
    const { orderId = '' } = parseJson(event)
    const safeOrderId = String(orderId).trim().slice(0, 120)
    if (!safeOrderId) return json(400, { ok: false, error: 'invalid_order_id' })

    const store = ordersStore()
    const order = (await readJsonList(store, KEY)).find((item) => item?.id === safeOrderId)

    if (!order) return json(404, { ok: false, error: 'order_not_found' })
    if (order.paymentProvider !== 'paypal' || !order.paymentCaptureId) {
      return json(409, { ok: false, error: 'paypal_refund_unavailable' })
    }
    if (order.paymentStatus === 'refunded') {
      return json(200, { ok: true, order, duplicate: true })
    }

    const refund = await paypalRequest(
      `/v2/payments/captures/${encodeURIComponent(order.paymentCaptureId)}/refund`,
      {
        method: 'POST',
        headers: { 'PayPal-Request-Id': `refund-${safeOrderId}` },
        body: '{}',
      },
    )

    if (!['COMPLETED', 'PENDING'].includes(refund.status)) {
      return json(409, { ok: false, error: 'paypal_refund_not_verified' })
    }

    const now = new Date().toISOString()
    let refundedOrder
    await mutateJsonList(store, KEY, (orders) =>
      orders.map((item) => {
        if (item?.id !== safeOrderId) return item
        refundedOrder = {
          ...item,
          paymentStatus: 'refunded',
          refundId: refund.id || '',
          refundedAt: now,
          status: '已完成',
          trackingEvents: [
            ...(Array.isArray(item.trackingEvents) ? item.trackingEvents.slice(-19) : []),
            {
              status: 'Refund processed',
              detail: 'A PayPal refund has been submitted for this order.',
              at: now,
            },
          ],
        }
        return refundedOrder
      }),
    )

    await sendRefundEmail(refundedOrder)
    return json(200, { ok: true, order: refundedOrder })
  } catch {
    return json(502, { ok: false, error: 'paypal_refund_failed' })
  }
}
