import {
  connectBlobs,
  json,
  methodNotAllowed,
  ordersStore,
  parseJson,
  readJsonList,
  requireAdmin,
  writeJsonList,
} from './_backend.mjs'

const KEY = 'orders'

function cleanEvent(event) {
  if (!event || typeof event !== 'object') return null
  const status = String(event.status || '').trim().slice(0, 60)
  const detail = String(event.detail || '').trim().slice(0, 240)
  const at = String(event.at || '').trim().slice(0, 80)
  return status && detail && at ? { status, detail, at } : null
}

function trackingDetail(order) {
  const parts = []
  if (order.trackingCarrier) parts.push(`物流公司：${String(order.trackingCarrier).slice(0, 80)}`)
  if (order.trackingNumber) parts.push(`物流单号：${String(order.trackingNumber).slice(0, 120)}`)
  return parts.length ? parts.join(' · ') : '物流状态已更新。'
}

function mergeTrackingHistory(existingOrders, nextOrders) {
  const existingById = new Map(existingOrders.map((order) => [order.id, order]))

  return nextOrders.map((order) => {
    const previous = existingById.get(order?.id)
    const currentEvents = Array.isArray(order?.trackingEvents)
      ? order.trackingEvents.map(cleanEvent).filter(Boolean).slice(-20)
      : []

    if (!previous) return { ...order, trackingEvents: currentEvents }

    const shippingChanged =
      String(previous.shippingStatus || '') !== String(order.shippingStatus || '') ||
      String(previous.trackingCarrier || '') !== String(order.trackingCarrier || '') ||
      String(previous.trackingNumber || '') !== String(order.trackingNumber || '')

    if (!shippingChanged) return { ...order, trackingEvents: currentEvents }

    const latest = currentEvents[currentEvents.length - 1]
    const nextEvent = {
      status: String(order.shippingStatus || '待发货').slice(0, 60),
      detail: trackingDetail(order),
      at: new Date().toISOString(),
    }
    const alreadyRecorded =
      latest &&
      latest.status === nextEvent.status &&
      latest.detail === nextEvent.detail

    return {
      ...order,
      trackingEvents: alreadyRecorded ? currentEvents : [...currentEvents, nextEvent].slice(-20),
    }
  })
}

export async function handler(event) {
  connectBlobs(event)
  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })

  const store = ordersStore()

  try {
    if (event.httpMethod === 'GET') {
      const orders = await readJsonList(store, KEY)
      return json(200, { ok: true, orders })
    }

    if (event.httpMethod === 'PUT') {
      const { orders } = parseJson(event)
      if (!Array.isArray(orders)) {
        return json(400, { ok: false, error: 'orders_must_be_array' })
      }

      const existingOrders = await readJsonList(store, KEY)
      const savedOrders = mergeTrackingHistory(existingOrders, orders)
      await writeJsonList(store, KEY, savedOrders)
      return json(200, { ok: true, orders: savedOrders })
    }

    return methodNotAllowed()
  } catch (error) {
    return json(500, {
      ok: false,
      error: 'orders_store_error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
