import { connectLambda, getStore } from '@netlify/blobs'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

export function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...jsonHeaders, ...extraHeaders },
    body: JSON.stringify(body),
  }
}

export function methodNotAllowed() {
  return json(405, { ok: false, error: 'method_not_allowed' })
}

export function parseJson(event, maxBytes = 64 * 1024) {
  if (!event.body) return {}
  if (Buffer.byteLength(event.body, 'utf8') > maxBytes) {
    const error = new Error('request_body_too_large')
    error.code = 'request_body_too_large'
    throw error
  }
  return JSON.parse(event.body)
}

export function ordersStore() {
  return getStore('lunar-talisman-orders')
}

export function productsStore() {
  return getStore('lunar-talisman-products')
}

export function connectBlobs(event) {
  if (!event?.blobs) return
  connectLambda(event)
}

export async function readJsonList(store, key) {
  const data = await store.get(key, { type: 'json' })
  return Array.isArray(data) ? data : []
}

export async function writeJsonList(store, key, value) {
  await store.setJSON(key, value)
  return value
}

export async function appendJsonList(store, key, item, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const current = await store.getWithMetadata(key, { type: 'json' })
    const list = Array.isArray(current?.data) ? current.data : []
    const next = [item, ...list]
    const result = await store.setJSON(
      key,
      next,
      current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true },
    )
    if (result.modified !== false) return next
  }
  const error = new Error('orders_write_conflict')
  error.code = 'orders_write_conflict'
  throw error
}

export function adminAccount() {
  return process.env.LUNAR_ADMIN_ACCOUNT || 'Lunar Talisman'
}

export function normalizeAccount(value = '') {
  return String(value).trim().replace(/\s+/g, '').toLowerCase()
}

export function getAdminPassword() {
  return process.env.LUNAR_ADMIN_PASSWORD || ''
}

export function getSessionSecret() {
  return process.env.LUNAR_ADMIN_SESSION_SECRET || ''
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function verifyLogin(account, password) {
  const expectedPassword = getAdminPassword()
  if (!expectedPassword) {
    return { ok: false, setupRequired: true }
  }

  const accountOk = normalizeAccount(account) === normalizeAccount(adminAccount())
  const passwordOk = safeEqual(password, expectedPassword)
  return { ok: accountOk && passwordOk, setupRequired: false }
}

export function signToken(payload) {
  const secret = getSessionSecret()
  if (!secret) throw new Error('Missing LUNAR_ADMIN_SESSION_SECRET')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encodedPayload).digest('base64url')
  return `${encodedPayload}.${signature}`
}

export function verifyToken(token) {
  const secret = getSessionSecret()
  if (!secret || !token || !token.includes('.')) return false

  const [encodedPayload, signature] = token.split('.')
  const expected = createHmac('sha256', secret).update(encodedPayload).digest('base64url')
  if (!safeEqual(signature, expected)) return false

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
    return payload.account === adminAccount() && Number(payload.exp) > Date.now()
  } catch {
    return false
  }
}

export function requireAdmin(event) {
  const auth = event.headers.authorization || event.headers.Authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  return verifyToken(token)
}

const requestBuckets = new Map()

export function getClientIp(event) {
  return String(
    event?.headers?.['x-nf-client-connection-ip'] ||
      event?.headers?.['x-forwarded-for'] ||
      event?.headers?.['client-ip'] ||
      'unknown',
  )
    .split(',')[0]
    .trim()
}

export function enforceRateLimit(event, { limit = 20, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now()
  const key = `${getClientIp(event)}:${event?.path || 'function'}`
  const bucket = requestBuckets.get(key)
  if (!bucket || now - bucket.startedAt >= windowMs) {
    requestBuckets.set(key, { startedAt: now, count: 1 })
    return { ok: true, retryAfter: 0 }
  }
  bucket.count += 1
  if (bucket.count <= limit) return { ok: true, retryAfter: 0 }
  return {
    ok: false,
    retryAfter: Math.max(1, Math.ceil((windowMs - (now - bucket.startedAt)) / 1000)),
  }
}

export function escapeCsvCell(value) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}
