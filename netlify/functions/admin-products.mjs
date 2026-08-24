import {
  connectBlobs,
  json,
  methodNotAllowed,
  parseJson,
  productsStore,
  readJsonList,
  requireAdmin,
  requireTrustedOrigin,
  writeJsonList,
} from './_backend.mjs'
import { submitIndexNow } from './_indexnow.mjs'

const KEY = 'products'
const MAX_PRODUCTS = 500

function clean(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function validImage(value) {
  if (!value) return true
  if (value.startsWith('https://')) return value.length <= 2048
  return /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i.test(value) && value.length <= 60_000
}

function sanitizeProducts(value) {
  if (!Array.isArray(value) || value.length > MAX_PRODUCTS) return null
  const seenIds = new Set()
  const products = []

  for (const item of value) {
    const id = clean(item?.id, 120)
    const name = clean(item?.name, 180)
    const collection = clean(item?.collection, 80)
    const image = clean(item?.image, 60_000)
    const price = Number(item?.price)
    const stock = Number(item?.stock)
    const status = clean(item?.status, 10)

    if (
      !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(id) ||
      seenIds.has(id) ||
      !name ||
      !collection ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 100_000 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      stock > 100_000 ||
      !['上架', '草稿'].includes(status) ||
      !validImage(image)
    ) {
      return null
    }

    seenIds.add(id)
    products.push({ id, name, collection, price, stock, image, status })
  }
  return products
}

function changedProductPaths(previous, next) {
  const previousById = new Map(previous.map((product) => [product.id, product]))
  const nextById = new Map(next.map((product) => [product.id, product]))
  const changedIds = new Set([...previousById.keys(), ...nextById.keys()])
  const paths = []

  for (const id of changedIds) {
    const before = previousById.get(id)
    const after = nextById.get(id)
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      paths.push(`/detail/admin-${id}`)
    }
  }

  return paths.length ? ['/', '/series/crystals', ...paths] : []
}

export async function handler(event) {
  connectBlobs(event)
  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })

  try {
    if (event.httpMethod === 'GET') {
      const store = productsStore()
      const products = await readJsonList(store, KEY)
      return json(200, { ok: true, products })
    }

    if (event.httpMethod === 'PUT') {
      if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })
      const { products } = parseJson(event)
      const sanitizedProducts = sanitizeProducts(products)
      if (!sanitizedProducts) {
        return json(400, { ok: false, error: 'invalid_products_payload' })
      }

      const store = productsStore()
      const previousProducts = await readJsonList(store, KEY)
      await writeJsonList(store, KEY, sanitizedProducts)
      const changedPaths = changedProductPaths(previousProducts, sanitizedProducts)
      let indexNow = { attempted: false, accepted: false, submitted: 0, status: 0 }
      if (changedPaths.length) {
        try {
          indexNow = await submitIndexNow(changedPaths)
        } catch {
          // Saving inventory must never fail merely because a search engine is unavailable.
        }
      }
      return json(200, { ok: true, products: sanitizedProducts, indexNow })
    }

    return methodNotAllowed()
  } catch {
    return json(500, {
      ok: false,
      error: 'products_store_error',
    })
  }
}
