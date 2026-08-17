export type PublicOrder = {
  id: string
  customer: string
  email?: string
  phone?: string
  address: string
  product: string
  items?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  channel: string
  amount: number
  shippingMethod?: string
  shippingRegion?: 'Americas' | 'Europe' | 'Southeast Asia'
  shippingFee?: number
  shippingStatus?: '待发货' | '备货中' | '已发货' | '运输中' | '已签收'
  trackingNumber?: string
  trackingCarrier?: string
  trackingEvents?: TrackingEvent[]
  message?: string
  status: '待处理' | '已付款' | '备货中' | '已发货' | '已完成'
  createdAt: string
}

export type TrackingEvent = {
  status: string
  detail: string
  at: string
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
