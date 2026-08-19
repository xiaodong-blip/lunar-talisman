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

export type AdminOrderUpdate = {
  id: string
  status: PublicOrder['status']
  shippingStatus: NonNullable<PublicOrder['shippingStatus']>
  trackingCarrier: string
  trackingNumber: string
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

async function requestJson<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
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

export async function loginAdmin(account: string, password: string) {
  return requestJson<{ ok: true; expiresAt: number }>(
    '/.netlify/functions/admin-login',
    {
      method: 'POST',
      body: JSON.stringify({ account, password }),
    },
  )
}

export async function checkAdminSession() {
  await requestJson<{ ok: true }>('/.netlify/functions/admin-session')
  return true
}

export async function logoutAdmin() {
  await requestJson<{ ok: true }>('/.netlify/functions/admin-session', {
    method: 'POST',
  })
}

export async function fetchAdminOrders() {
  const data = await requestJson<{ ok: true; orders: PublicOrder[] }>(
    '/.netlify/functions/admin-orders',
    {
      method: 'GET',
    },
  )
  return data.orders
}

export async function saveAdminOrders(updates: AdminOrderUpdate[]) {
  const data = await requestJson<{ ok: true; orders: PublicOrder[] }>(
    '/.netlify/functions/admin-orders',
    {
      method: 'PUT',
      body: JSON.stringify({ updates }),
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
    },
  )
  return data.products
}

export async function saveAdminProducts(products: AdminProductRecord[]) {
  const data = await requestJson<{ ok: true; products: AdminProductRecord[] }>(
    '/.netlify/functions/admin-products',
    {
      method: 'PUT',
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
    credentials: 'same-origin',
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
