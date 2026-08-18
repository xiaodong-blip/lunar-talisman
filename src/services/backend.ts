import type { PublicOrder, TrackingEvent } from './orders'

export type AdminProductRecord = {
  id: string
  name: string
  collection: string
  price: number
  stock: number
  image: string
  status: '上架' | '草稿'
}

export type PublicTrackingOrder = Pick<
  PublicOrder,
  | 'id'
  | 'product'
  | 'items'
  | 'shippingMethod'
  | 'shippingRegion'
  | 'shippingCountry'
  | 'shippingStatus'
  | 'trackingNumber'
  | 'trackingCarrier'
  | 'createdAt'
> & {
  trackingEvents: TrackingEvent[]
}

const ADMIN_TOKEN_KEY = 'lunar-talisman-admin-token'

async function requestJson<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string
    error?: string
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed: ${response.status}`)
  }

  return data
}

export function getAdminToken() {
  return window.sessionStorage.getItem(ADMIN_TOKEN_KEY) || ''
}

export function setAdminToken(token: string) {
  window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken() {
  window.sessionStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function hasAdminToken() {
  return Boolean(getAdminToken())
}

function authHeaders(): Record<string, string> {
  const token = getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function loginAdmin(account: string, password: string) {
  const data = await requestJson<{ ok: true; token: string; expiresAt: number }>(
    '/.netlify/functions/admin-login',
    {
      method: 'POST',
      body: JSON.stringify({ account, password }),
    },
  )
  setAdminToken(data.token)
  return data
}

export async function fetchAdminOrders() {
  const data = await requestJson<{ ok: true; orders: PublicOrder[] }>(
    '/.netlify/functions/admin-orders',
    {
      method: 'GET',
      headers: authHeaders(),
    },
  )
  return data.orders
}

export async function saveAdminOrders(orders: PublicOrder[]) {
  const data = await requestJson<{ ok: true; orders: PublicOrder[] }>(
    '/.netlify/functions/admin-orders',
    {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ orders }),
    },
  )
  return data.orders
}

export async function createPublicOrder(order: PublicOrder) {
  const idempotencyKey = order.id
  const data = await requestJson<{ ok: true; order: PublicOrder }>('/.netlify/functions/orders', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(order),
  })
  return data.order
}

export async function trackPublicOrder(orderId: string, email: string) {
  const data = await requestJson<{ ok: true; order: PublicTrackingOrder }>(
    '/.netlify/functions/order-tracking',
    {
      method: 'POST',
      body: JSON.stringify({ orderId, email }),
    },
  )
  return data.order
}

export async function fetchAdminProducts() {
  const data = await requestJson<{ ok: true; products: AdminProductRecord[] }>(
    '/.netlify/functions/admin-products',
    {
      method: 'GET',
      headers: authHeaders(),
    },
  )
  return data.products
}

export async function saveAdminProducts(products: AdminProductRecord[]) {
  const data = await requestJson<{ ok: true; products: AdminProductRecord[] }>(
    '/.netlify/functions/admin-products',
    {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ products }),
    },
  )
  return data.products
}

export async function fetchPublishedProducts() {
  const data = await requestJson<{ ok: true; products: AdminProductRecord[] }>(
    '/.netlify/functions/products',
  )
  return data.products
}

export async function downloadOrdersCsv() {
  const response = await fetch('/.netlify/functions/admin-orders-download', {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') || ''
  const filename =
    disposition.match(/filename="([^"]+)"/)?.[1] ||
    `lunar-talisman-orders-${new Date().toISOString().slice(0, 10)}.csv`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
