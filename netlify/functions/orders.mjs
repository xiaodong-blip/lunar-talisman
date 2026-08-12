import {
  connectBlobs,
  json,
  methodNotAllowed,
  ordersStore,
  parseJson,
  readJsonList,
  writeJsonList,
} from './_backend.mjs'

const KEY = 'orders'

function clean(value, fallback = '') {
  return String(value ?? fallback).trim()
}

function cleanItems(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => ({
      id: clean(item?.id),
      name: clean(item?.name),
      price: Number(item?.price) || 0,
      quantity: Math.max(1, Math.floor(Number(item?.quantity) || 1)),
    }))
    .filter((item) => item.id && item.name)
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()

  try {
    const input = parseJson(event)
    const items = cleanItems(input.items)
    const product =
      clean(input.product) ||
      (items.length === 1
        ? items[0].name
        : items.length > 1
          ? `${items[0].name} 等 ${items.reduce((sum, item) => sum + item.quantity, 0)} 件商品`
          : '')
    const order = {
      id:
        clean(input.id) ||
        `LT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(
          -4,
        )}`,
      customer: clean(input.customer),
      email: clean(input.email),
      phone: clean(input.phone),
      address: clean(input.address),
      product,
      items,
      channel: clean(input.channel, '官网购物车'),
      amount: Number(input.amount) || 0,
      shippingMethod: clean(input.shippingMethod, 'standard'),
      shippingFee: Number(input.shippingFee) || 0,
      shippingStatus: clean(input.shippingStatus, '待发货'),
      trackingNumber: clean(input.trackingNumber),
      trackingCarrier: clean(input.trackingCarrier),
      message: clean(input.message),
      status: clean(input.status, '待处理'),
      createdAt:
        clean(input.createdAt) ||
        new Date().toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
    }

    if (!order.customer || !order.email || !order.address || !order.product) {
      return json(400, { ok: false, error: 'missing_required_order_fields' })
    }

    const store = ordersStore()
    const orders = await readJsonList(store, KEY)
    const nextOrders = [order, ...orders]
    await writeJsonList(store, KEY, nextOrders)
    return json(201, { ok: true, order })
  } catch (error) {
    return json(500, {
      ok: false,
      error: 'order_create_failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
