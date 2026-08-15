export const STATIC_CATALOG = [
  { id: 'scorpio-amethyst', name: '天蝎守护 · 紫水晶手链', price: 89, stock: 0, status: '下架' },
  { id: 'heart-rose-quartz', name: '心轮疗愈 · 玫瑰晶手链', price: 69, stock: 25, status: '上架' },
  { id: 'solar-citrine', name: '太阳轮 · 黄水晶勇气手链', price: 79, stock: 25, status: '上架' },
  { id: 'new-moon-set', name: '新月仪式 · 净化套装', price: 129, stock: 12, status: '上架' },
  { id: 'root-garnet', name: '海底轮 · 红石榴石扎根手链', price: 75, stock: 25, status: '上架' },
  { id: 'full-moon-necklace', name: '满月祝福 · 月光石项链', price: 149, stock: 12, status: '上架' },
]

export function catalogMap(products = []) {
  return new Map(
    products
      .filter((product) => product && typeof product.id === 'string')
      .map((product) => [
        product.id,
        {
          id: product.id,
          name: String(product.name || product.id).trim(),
          price: Number(product.price),
          stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
          status: String(product.status || '草稿'),
        },
      ])
      .filter(([, product]) => Number.isFinite(product.price) && product.price >= 0),
  )
}
