import {
  connectBlobs,
  json,
  methodNotAllowed,
  mutateJsonList,
  ordersStore,
  parseJson,
  readJsonList,
} from './_backend.mjs'
import { sendOrderPaidEmails } from './_email.mjs'
import { paypalRequest, siteUrl, verifyPaypalWebhook } from './_paypal.mjs'

const KEY = 'orders'

function paypalOrderIdFromEvent(event) {
  return event?.resource?.supplementary_data?.related_ids?.order_id || ''
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

async function verifiesExpectedCapture(paypalOrderId, order, captureId) {
  const paypalOrder = await paypalRequest(
    `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
  )
  const unit = paypalOrder?.purchase_units?.[0]
  const matchingCapture = unit?.payments?.captures?.find(
    (capture) => capture?.id === captureId && capture?.status === 'COMPLETED',
  )

  return Boolean(
    paypalOrder?.status === 'COMPLETED' &&
      unit?.custom_id === order.id &&
      unit?.amount?.currency_code === 'USD' &&
      money(unit?.amount?.value) === money(order.amount) &&
      matchingCapture,
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

    const store = ordersStore()
    const order = (await readJsonList(store, KEY)).find(
      (item) =>
        item?.paymentProvider === 'paypal' &&
        item?.paymentId === paypalOrderId,
    )
    if (!order) return json(200, { ok: true, ignored: true })
    if (order.paymentStatus === 'paid') return json(200, { ok: true, duplicate: true })

    const captureId = String(webhookEvent.resource?.id || '').trim()
    const validCapture = await verifiesExpectedCapture(paypalOrderId, order, captureId)
    if (!validCapture) {
      return json(200, { ok: true, ignored: true, reason: 'payment_not_verified' })
    }

    const now = new Date().toISOString()
    let paidOrder
    await mutateJsonList(store, KEY, (orders) =>
      orders.map((order) => {
        if (
          order?.paymentProvider !== 'paypal' ||
          order?.paymentId !== paypalOrderId ||
          order.paymentStatus === 'paid'
        ) {
          return order
        }
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
