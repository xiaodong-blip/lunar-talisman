import {
  connectBlobs,
  enforceRateLimit,
  json,
  methodNotAllowed,
  ordersStore,
  parseJson,
  productsStore,
  readJsonList,
  requireTrustedOrigin,
} from './_backend.mjs'
import { CHECKOUT_CATALOG, catalogMap } from './_catalog.mjs'
import { randomUUID } from 'node:crypto'

const KEY = 'orders'
const MAX_ITEMS = 50
const MAX_QUANTITY = 20
const DEFAULT_STOCK = 20
const PAYMENT_RESERVATION_WINDOW_MS = 30 * 60 * 1000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SHIPPING_RATES = {
  Americas: { standard: 8, express: 18 },
  Europe: { standard: 14, express: 28 },
  'Southeast Asia': { standard: 12, express: 24 },
}

function clean(value, fallback = '') {
  return String(value ?? fallback).trim()
}

function cleanText(value, maxLength) {
  return clean(value).slice(0, maxLength)
}

function parseItems(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_ITEMS) return []
  return value
    .map((item) => ({
      id: cleanText(item?.id, 120),
      quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(item?.quantity) || 0))),
    }))
    .filter((item) => item.id)
}

function getIdempotencyKey(event) {
  return cleanText(
    event?.headers?.['idempotency-key'] || event?.headers?.['Idempotency-Key'] || '',
    100,
  )
}

function normalizedStock(product) {
  const stock = Math.floor(Number(product?.stock))
  return Number.isFinite(stock) && stock >= 0 ? stock : DEFAULT_STOCK
}

function activeReservedQuantity(orders, productId) {
  const now = Date.now()
  return orders.reduce((total, order) => {
    if (!['pending', 'paid'].includes(order?.paymentStatus)) return total
    if (
      order.paymentStatus === 'pending' &&
      now - new Date(order.createdAt).getTime() > PAYMENT_RESERVATION_WINDOW_MS
    ) {
      return total
    }
    const quantity = Array.isArray(order.items)
      ? order.items
          .filter((item) => item?.id === productId)
          .reduce((sum, item) => sum + Math.max(0, Number(item.quantity) || 0), 0)
      : 0
    return total + quantity
  }, 0)
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()
  if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })

  const rate = enforceRateLimit(event, { limit: 12, windowMs: 10 * 60 * 1000 })
  if (!rate.ok) {
    return json(
      429,
      { ok: false, error: 'rate_limited', retryAfter: rate.retryAfter },
      { 'Retry-After': String(rate.retryAfter) },
    )
  }

  try {
    const input = parseJson(event)
    const customer = cleanText(input.customer, 120)
    const email = cleanText(input.email, 254).toLowerCase()
    const phone = cleanText(input.phone, 40)
    const address = cleanText(input.address, 500)
    const message = cleanText(input.message, 1000)
    const shippingMethod = clean(input.shippingMethod, 'standard')
    const shippingRegion = clean(input.shippingRegion, 'Americas')
    const shippingCountry = cleanText(input.shippingCountry, 120) || shippingRegion

    if (!customer || !EMAIL_RE.test(email) || !address) {
      return json(400, { ok: false, error: 'invalid_customer_details' })
    }
    if (!['standard', 'express'].includes(shippingMethod)) {
      return json(400, { ok: false, error: 'invalid_shipping_method' })
    }
    if (!Object.hasOwn(SHIPPING_RATES, shippingRegion)) {
      return json(400, { ok: false, error: 'invalid_shipping_region' })
    }

    const requestedItems = parseItems(input.items)
    if (!requestedItems.length) {
      return json(400, { ok: false, error: 'items_must_be_non_empty' })
    }

    const store = ordersStore()
    const existingOrders = await readJsonList(store, KEY)
    const dynamicProducts = await readJsonList(productsStore(), 'products')
    const catalog = catalogMap([...CHECKOUT_CATALOG, ...dynamicProducts])
    const items = []
    let subtotal = 0

    for (const requested of requestedItems) {
      const product = catalog.get(requested.id)
      if (!product || product.status !== '上架') {
        return json(400, { ok: false, error: 'product_unavailable', productId: requested.id })
      }
      const available = Math.max(
        0,
        normalizedStock(product) - activeReservedQuantity(existingOrders, product.id),
      )
      if (requested.quantity > available) {
        return json(409, {
          ok: false,
          error: 'insufficient_stock',
          productId: requested.id,
          available,
        })
      }
      subtotal += product.price * requested.quantity
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: requested.quantity,
      })
    }

    const shippingFee = SHIPPING_RATES[shippingRegion][shippingMethod]
    const amount = subtotal + shippingFee
    const idempotencyKey = getIdempotencyKey(event)
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const current = await store.getWithMetadata(KEY, { type: 'json' })
      const existingOrders = Array.isArray(current?.data) ? current.data : []
      const duplicate = idempotencyKey
        ? existingOrders.find((order) => order.idempotencyKey === idempotencyKey)
        : null
      if (duplicate) return json(200, { ok: true, duplicate: true, order: duplicate })

      const order = {
        id: `LT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8)}`,
        idempotencyKey,
        customer,
        email,
        phone,
        address,
        product:
          items.length === 1 ? items[0].name : `${items[0].name} and ${items.length - 1} more`,
        items,
        channel: 'Website checkout',
        amount,
        shippingMethod,
        shippingRegion,
        shippingCountry,
        shippingFee,
        shippingStatus: '待支付',
        trackingNumber: '',
        trackingCarrier: '',
        trackingEvents: [
          {
            status: '待支付',
            detail: 'Checkout created. Awaiting secure payment confirmation.',
            at: new Date().toISOString(),
          },
        ],
        message,
        status: '待处理',
        paymentStatus: 'pending',
        paymentProvider: '',
        paymentId: '',
        paymentCapturedAt: '',
        createdAt: new Date().toISOString(),
      }

      const result = await store.setJSON(
        KEY,
        [order, ...existingOrders],
        current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true },
      )
      if (result.modified !== false) return json(201, { ok: true, order })
    }

    return json(409, { ok: false, error: 'order_write_conflict' })
  } catch (error) {
    const status = error?.code === 'request_body_too_large' ? 413 : 500
    return json(status, { ok: false, error: error?.code || 'order_create_failed' })
  }
}
