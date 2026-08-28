import { IMPORTED_CATALOG } from './_generated-catalog.mjs'

export const STATIC_CATALOG = [
  { id: 'scorpio-amethyst', name: '天蝎守护 · 紫水晶手链', price: 189, stock: 0, status: '下架' },
  { id: 'heart-rose-quartz', name: '心轮疗愈 · 玫瑰晶手链', price: 169, stock: 25, status: '上架' },
  { id: 'solar-citrine', name: '太阳轮 · 黄水晶勇气手链', price: 179, stock: 25, status: '上架' },
  { id: 'new-moon-set', name: '新月仪式 · 净化套装', price: 129, stock: 12, status: '上架' },
  { id: 'root-garnet', name: '海底轮 · 红石榴石扎根手链', price: 175, stock: 25, status: '上架' },
  { id: 'full-moon-necklace', name: '满月祝福 · 月光石项链', price: 149, stock: 12, status: '上架' },
]

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
