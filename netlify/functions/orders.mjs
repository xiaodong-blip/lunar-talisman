import { json, methodNotAllowed, ordersStore, parseJson, readJsonList, writeJsonList } from './_backend.mjs'

const KEY = 'orders'

function clean(value, fallback = '') {
  return String(value ?? fallback).trim()
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed()

  try {
    const input = parseJson(event)
    const order = {
      id:
        clean(input.id) ||
        `LT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(
          -4,
        )}`,
      customer: clean(input.customer),
      email: clean(input.email),
      address: clean(input.address),
      product: clean(input.product),
      channel: clean(input.channel, '官网'),
      amount: Number(input.amount) || 0,
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
