import {
  appendJsonList,
  connectBlobs,
  enforceRateLimit,
  json,
  methodNotAllowed,
  ordersStore,
  parseJson,
  productsStore,
  readJsonList,
} from './_backend.mjs'
import { STATIC_CATALOG, catalogMap } from './_catalog.mjs'
import { randomUUID } from 'node:crypto'

const KEY = 'orders'
const MAX_ITEMS = 50
const MAX_QUANTITY = 20
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
      quantity: Math.min(
        MAX_QUANTITY,
        Math.max(1, Math.floor(Number(item?.quantity) || 0)),
      ),
    }))
    .filter((item) => item.id)
}

function getIdempotencyKey(event) {
  return cleanText(
    event?.headers?.['idempotency-key'] ||
      event?.headers?.['Idempotency-Key'] ||
      '',
    100,
  )
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()

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

    const dynamicProducts = await readJsonList(productsStore(), 'products')
    const catalog = catalogMap(dynamicProducts.length ? dynamicProducts : STATIC_CATALOG)
    const items = []
    let subtotal = 0

    for (const requested of requestedItems) {
      const product = catalog.get(requested.id)
      if (!product || product.status !== '上架') {
        return json(400, { ok: false, error: 'product_unavailable', productId: requested.id })
      }
      if (product.stock > 0 && requested.quantity > product.stock) {
        return json(409, {
          ok: false,
          error: 'insufficient_stock',
          productId: requested.id,
          available: product.stock,
        })
      }
      const lineTotal = product.price * requested.quantity
      subtotal += lineTotal
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
    const store = ordersStore()
    const existingOrders = await readJsonList(store, KEY)
    if (idempotencyKey) {
      const existing = existingOrders.find((order) => order.id === idempotencyKey)
      if (existing) return json(200, { ok: true, duplicate: true, order: existing })
    }

    const order = {
      id: `LT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8)}`,
      customer,
      email,
      phone,
      address,
      product: items.length === 1 ? items[0].name : `${items[0].name} 等 ${items.length} 件商品`,
      items,
      channel: '官网购物车',
      amount,
      shippingMethod,
      shippingRegion,
      shippingFee,
      shippingStatus: '待发货',
      trackingNumber: '',
      trackingCarrier: '',
      message,
      status: '待处理',
      createdAt: new Date().toISOString(),
    }

    await appendJsonList(store, KEY, order)
    return json(201, { ok: true, order })
  } catch (error) {
    const status = error?.code === 'request_body_too_large' ? 413 : 500
    return json(status, {
      ok: false,
      error: error?.code || 'order_create_failed',
    })
  }
}
