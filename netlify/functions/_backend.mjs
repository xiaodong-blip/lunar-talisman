import { getStore } from '@netlify/blobs'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
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

export function parseJson(event) {
  if (!event.body) return {}
  return JSON.parse(event.body)
}

export function ordersStore() {
  return getStore('lunar-talisman-orders')
}

export function productsStore() {
  return getStore('lunar-talisman-products')
}

export async function readJsonList(store, key) {
  const data = await store.get(key, { type: 'json' })
  return Array.isArray(data) ? data : []
}

export async function writeJsonList(store, key, value) {
  await store.setJSON(key, value)
  return value
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
  return process.env.LUNAR_ADMIN_SESSION_SECRET || process.env.LUNAR_ADMIN_PASSWORD || ''
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

  const accountOk =
    normalizeAccount(account) === normalizeAccount(adminAccount()) ||
    normalizeAccount(account) === normalizeAccount('月之护符')
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

export function escapeCsvCell(value) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}
