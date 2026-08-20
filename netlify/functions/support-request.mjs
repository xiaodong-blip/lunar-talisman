import {
  appendJsonList,
  connectBlobs,
  enforceRateLimit,
  json,
  methodNotAllowed,
  parseJson,
  requireTrustedOrigin,
  supportStore,
} from './_backend.mjs'
import { sendSupportRequestEmails } from './_email.mjs'
import { randomUUID } from 'node:crypto'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function text(value, limit) {
  return String(value ?? '').trim().slice(0, limit)
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()
  if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })

  const rate = enforceRateLimit(event, { limit: 5, windowMs: 30 * 60 * 1000 })
  if (!rate.ok) {
    return json(
      429,
      { ok: false, error: 'rate_limited', retryAfter: rate.retryAfter },
      { 'Retry-After': String(rate.retryAfter) },
    )
  }

  try {
    const input = parseJson(event)
    const type = text(input.type, 20)
    const name = text(input.name, 120)
    const email = text(input.email, 254).toLowerCase()
    const orderId = text(input.orderId, 120)
    const message = text(input.message, 2000)
    if (!['contact', 'refund'].includes(type) || !name || !EMAIL_RE.test(email) || !message) {
      return json(400, { ok: false, error: 'invalid_support_request' })
    }

    const request = {
      id: `LT-SUPPORT-${randomUUID().slice(0, 8).toUpperCase()}`,
      type,
      name,
      email,
      orderId,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    await appendJsonList(supportStore(), 'requests', request)
    await sendSupportRequestEmails(request)
    return json(201, { ok: true, requestId: request.id })
  } catch (error) {
    const status = error?.code === 'request_body_too_large' ? 413 : 500
    return json(status, { ok: false, error: error?.code || 'support_request_failed' })
  }
}
