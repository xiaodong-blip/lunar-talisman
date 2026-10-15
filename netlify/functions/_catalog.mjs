import { IMPORTED_CATALOG } from './_generated-catalog.mjs'

// The imported LT catalog is the only public checkout catalog. Legacy seed
// products remain in source code for historical migrations but are not sold.
export const STATIC_CATALOG = []

export const CHECKOUT_CATALOG = [...STATIC_CATALOG, ...IMPORTED_CATALOG]

function adjustedProductPrice(value) {
  const price = Number(value)
  return Number.isFinite(price) && price < 100 ? price + 100 : price
}

function promotionSeed(id) {
  let hash = 2166136261
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function salePricing(id, value) {
  const originalPrice = Math.max(1, Math.round(adjustedProductPrice(value)))
  const seed = promotionSeed(String(id))
  const discountPercent =
    originalPrice > 200
      ? 20 + (seed % 11)
      : 6 + (seed % 10)
  const salePrice = Math.max(
    1,
    Math.round((originalPrice * (100 - discountPercent)) / 100),
  )
  return { originalPrice, salePrice, discountPercent }
}

export function catalogMap(products = []) {
  return new Map(
    products
      .filter((product) => product && typeof product.id === 'string')
      .flatMap((product) => {
        const createEntry = (id) => {
          const pricing = salePricing(id, product.price)
          return [
            id,
            {
              id,
              name: String(product.name || product.id).trim(),
              price: pricing.salePrice,
              originalPrice: pricing.originalPrice,
              discountPercent: pricing.discountPercent,
              stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
              status: String(product.status || '草稿'),
            },
          ]
        }

        const entries = [createEntry(product.id)]
        if (!product.id.startsWith('admin-')) {
          entries.push(createEntry(`admin-${product.id}`))
        }
        return entries
      })
      .filter(([, product]) => Number.isFinite(product.price) && product.price >= 0),
  )
}
