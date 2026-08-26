import {
  connectBlobs,
  json,
  methodNotAllowed,
  ordersStore,
  readJsonList,
  requireAdmin,
} from './_backend.mjs'
import { isPaypalConfigured, paypalRequest } from './_paypal.mjs'

const KEY = 'orders'
const MAX_RESULTS = 30

function clean(value, maxLength = 180) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function diagnosticError(error) {
  const details = error?.details || {}
  const firstIssue = Array.isArray(details?.details) ? details.details[0] : {}
  return {
    ok: false,
    httpStatus: Number(error?.paypalStatus || 0) || null,
    code: clean(firstIssue?.issue || details?.name || error?.code || 'paypal_lookup_failed', 80),
    message: clean(firstIssue?.description || details?.message || '', 180),
    debugId: clean(details?.debug_id || '', 120),
  }
}

function diagnosticSummary(paypalOrder) {
  const unit = paypalOrder?.purchase_units?.[0] || {}
  const capture = unit?.payments?.captures?.[0] || {}
  return {
    ok: true,
    paypalStatus: clean(paypalOrder?.status, 40),
    intent: clean(paypalOrder?.intent, 40),
    currency: clean(unit?.amount?.currency_code, 12),
    amount: clean(unit?.amount?.value, 24),
    captureStatus: clean(capture?.status, 40),
    captureId: clean(capture?.id, 140),
    statusReason: clean(
      capture?.status_details?.reason ||
        capture?.status_details?.reason_code ||
        paypalOrder?.status_details?.reason ||
        paypalOrder?.status_details?.reason_code,
      180,
    ),
  }
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'GET') return methodNotAllowed()
  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })
  if (!isPaypalConfigured()) return json(503, { ok: false, error: 'paypal_not_configured' })

  const requestedOrderId = clean(event.queryStringParameters?.orderId, 120)
  const orders = await readJsonList(ordersStore(), KEY)
  const candidates = orders
    .filter(
      (order) =>
        order?.paymentProvider === 'paypal' &&
        order?.paymentId &&
        (!requestedOrderId || order.id === requestedOrderId),
    )
    .slice(0, MAX_RESULTS)

  try {
    const results = await Promise.all(
      candidates.map(async (order) => {
        try {
          const paypalOrder = await paypalRequest(
            `/v2/checkout/orders/${encodeURIComponent(order.paymentId)}`,
          )
          return {
            orderId: clean(order.id, 120),
            localPaymentStatus: clean(order.paymentStatus, 40),
            paypalOrderId: clean(order.paymentId, 140),
            ...diagnosticSummary(paypalOrder),
          }
        } catch (error) {
          return {
            orderId: clean(order.id, 120),
            localPaymentStatus: clean(order.paymentStatus, 40),
            paypalOrderId: clean(order.paymentId, 140),
            ...diagnosticError(error),
          }
        }
      }),
    )

    return json(200, {
      ok: true,
      checkedAt: new Date().toISOString(),
      results,
    })
  } catch {
    return json(500, { ok: false, error: 'paypal_diagnostics_failed' })
  }
}
