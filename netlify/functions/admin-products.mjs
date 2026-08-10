import {
  json,
  methodNotAllowed,
  parseJson,
  productsStore,
  readJsonList,
  requireAdmin,
  writeJsonList,
} from './_backend.mjs'

const KEY = 'products'

export async function handler(event) {
  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })

  const store = productsStore()

  try {
    if (event.httpMethod === 'GET') {
      const products = await readJsonList(store, KEY)
      return json(200, { ok: true, products })
    }

    if (event.httpMethod === 'PUT') {
      const { products } = parseJson(event)
      if (!Array.isArray(products)) {
        return json(400, { ok: false, error: 'products_must_be_array' })
      }

      await writeJsonList(store, KEY, products)
      return json(200, { ok: true, products })
    }

    return methodNotAllowed()
  } catch (error) {
    return json(500, {
      ok: false,
      error: 'products_store_error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
