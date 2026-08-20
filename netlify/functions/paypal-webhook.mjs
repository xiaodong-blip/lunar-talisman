import {
  connectBlobs,
  json,
  methodNotAllowed,
  mutateJsonList,
  ordersStore,
  parseJson,
} from './_backend.mjs'
import { sendOrderPaidEmails } from './_email.mjs'
import { siteUrl, verifyPaypalWebhook } from './_paypal.mjs'

const KEY = 'orders'

function paypalOrderIdFromEvent(event) {
  return (
    event?.resource?.supplementary_data?.related_ids?.order_id ||
    event?.resource?.id ||
    ''
  )
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()

  try {
    const webhookEvent = parseJson(event, 256 * 1024)
    const verified = await verifyPaypalWebhook(event, webhookEvent)
    if (!verified) return json(400, { ok: false, error: 'invalid_webhook_signature' })

    if (webhookEvent.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return json(200, { ok: true, ignored: true })
    }

    const paypalOrderId = paypalOrderIdFromEvent(webhookEvent)
    if (!paypalOrderId) return json(200, { ok: true, ignored: true })

    const now = new Date().toISOString()
    let paidOrder
    await mutateJsonList(ordersStore(), KEY, (orders) =>
      orders.map((order) => {
        if (order?.paymentId !== paypalOrderId || order.paymentStatus === 'paid') return order
        paidOrder = {
          ...order,
          paymentStatus: 'paid',
          paymentCapturedAt: now,
          paymentCaptureId: webhookEvent.resource?.id || '',
          status: '已付款',
          shippingStatus: '待发货',
          trackingEvents: [
            ...(Array.isArray(order.trackingEvents) ? order.trackingEvents.slice(-19) : []),
            {
              status: '已付款',
              detail: 'PayPal payment confirmed by secure webhook.',
              at: now,
            },
          ],
        }
        return paidOrder
      }),
    )

    if (paidOrder) await sendOrderPaidEmails(paidOrder, siteUrl(event))
    return json(200, { ok: true })
  } catch {
    return json(500, { ok: false, error: 'paypal_webhook_failed' })
  }
}
