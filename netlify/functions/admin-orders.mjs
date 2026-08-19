import {
  connectBlobs,
  json,
  methodNotAllowed,
  ordersStore,
  parseJson,
  readJsonList,
  requireAdmin,
  requireTrustedOrigin,
  writeJsonList,
} from './_backend.mjs'

const KEY = 'orders'
const MAX_UPDATES = 500
const ORDER_STATUSES = new Set(['待处理', '已付款', '备货中', '已发货', '已完成'])
const SHIPPING_STATUSES = new Set(['待发货', '备货中', '已发货', '运输中', '已签收'])

function cleanEvent(event) {
  if (!event || typeof event !== 'object') return null
  const status = String(event.status || '').trim().slice(0, 60)
  const detail = String(event.detail || '').trim().slice(0, 240)
  const at = String(event.at || '').trim().slice(0, 80)
  return status && detail && at ? { status, detail, at } : null
}

function clean(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function trackingDetail(order) {
  const parts = []
  if (order.trackingCarrier) parts.push(`物流公司：${String(order.trackingCarrier).slice(0, 80)}`)
  if (order.trackingNumber) parts.push(`物流单号：${String(order.trackingNumber).slice(0, 120)}`)
  return parts.length ? parts.join(' · ') : '物流状态已更新。'
}

function sanitizeUpdates(value) {
  if (!Array.isArray(value) || value.length > MAX_UPDATES) return null
  const ids = new Set()
  const updates = []

  for (const entry of value) {
    const id = clean(entry?.id, 120)
    const status = clean(entry?.status, 20)
    const shippingStatus = clean(entry?.shippingStatus, 20)
    const trackingCarrier = clean(entry?.trackingCarrier, 80)
    const trackingNumber = clean(entry?.trackingNumber, 120)

    if (
      !id ||
      ids.has(id) ||
      !ORDER_STATUSES.has(status) ||
      !SHIPPING_STATUSES.has(shippingStatus)
    ) {
      return null
    }

    ids.add(id)
    updates.push({ id, status, shippingStatus, trackingCarrier, trackingNumber })
  }

  return updates
}

function mergeOrderUpdates(existingOrders, updates) {
  const existingById = new Map(existingOrders.map((order) => [order.id, order]))
  const updatesById = new Map(updates.map((update) => [update.id, update]))

  if (updates.some((update) => !existingById.has(update.id))) return null

  return existingOrders.map((previous) => {
    const update = updatesById.get(previous.id)
    if (!update) return previous
    const currentEvents = Array.isArray(previous.trackingEvents)
      ? previous.trackingEvents.map(cleanEvent).filter(Boolean).slice(-20)
      : []

    const shippingChanged =
      String(previous.shippingStatus || '') !== update.shippingStatus ||
      String(previous.trackingCarrier || '') !== update.trackingCarrier ||
      String(previous.trackingNumber || '') !== update.trackingNumber

    const nextOrder = {
      ...previous,
      status: update.status,
      shippingStatus: update.shippingStatus,
      trackingCarrier: update.trackingCarrier,
      trackingNumber: update.trackingNumber,
    }

    if (!shippingChanged) return { ...nextOrder, trackingEvents: currentEvents }

    const latest = currentEvents[currentEvents.length - 1]
    const nextEvent = {
      status: update.shippingStatus,
      detail: trackingDetail(nextOrder),
      at: new Date().toISOString(),
    }
    const alreadyRecorded =
      latest &&
      latest.status === nextEvent.status &&
      latest.detail === nextEvent.detail

    return {
      ...nextOrder,
      trackingEvents: alreadyRecorded ? currentEvents : [...currentEvents, nextEvent].slice(-20),
    }
  })
}

export async function handler(event) {
  connectBlobs(event)
  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })

  try {
    if (event.httpMethod === 'GET') {
      const store = ordersStore()
      const orders = await readJsonList(store, KEY)
      return json(200, { ok: true, orders })
    }

    if (event.httpMethod === 'PUT') {
      if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })
      const { updates } = parseJson(event)
      const sanitizedUpdates = sanitizeUpdates(updates)
      if (!sanitizedUpdates) {
        return json(400, { ok: false, error: 'invalid_order_updates' })
      }

      const store = ordersStore()
      const existingOrders = await readJsonList(store, KEY)
      const savedOrders = mergeOrderUpdates(existingOrders, sanitizedUpdates)
      if (!savedOrders) {
        return json(400, { ok: false, error: 'unknown_order' })
      }
      await writeJsonList(store, KEY, savedOrders)
      return json(200, { ok: true, orders: savedOrders })
    }

    return methodNotAllowed()
  } catch {
    return json(500, {
      ok: false,
      error: 'orders_store_error',
    })
  }
}
