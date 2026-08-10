import {
  json,
  methodNotAllowed,
  ordersStore,
  parseJson,
  readJsonList,
  requireAdmin,
  writeJsonList,
} from './_backend.mjs'

const KEY = 'orders'

export async function handler(event) {
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

      await writeJsonList(store, KEY, orders)
      return json(200, { ok: true, orders })
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
