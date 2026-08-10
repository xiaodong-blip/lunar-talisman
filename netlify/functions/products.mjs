import { json, methodNotAllowed, productsStore, readJsonList } from './_backend.mjs'

const KEY = 'products'

export async function handler(event) {
  if (event.httpMethod !== 'GET') return methodNotAllowed()

  try {
    const products = await readJsonList(productsStore(), KEY)
    const published = products.filter((product) => product.status === '上架')
    return json(200, { ok: true, products: published })
  } catch (error) {
    return json(500, {
      ok: false,
      error: 'products_read_failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
