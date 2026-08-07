export type PublicOrder = {
  id: string
  customer: string
  email?: string
  address: string
  product: string
  channel: string
  amount: number
  status: '待处理' | '已付款' | '备货中' | '已发货' | '已完成'
  createdAt: string
}

const ORDER_KEY = 'lunar-talisman-admin-orders'

export function readOrders(fallback: PublicOrder[]) {
  try {
    const raw = window.localStorage.getItem(ORDER_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as PublicOrder[]
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function saveOrders(orders: PublicOrder[]) {
  window.localStorage.setItem(ORDER_KEY, JSON.stringify(orders))
}

export function appendOrder(order: PublicOrder, fallback: PublicOrder[] = []) {
  const nextOrders = [order, ...readOrders(fallback)]
  saveOrders(nextOrders)
  return nextOrders
}
