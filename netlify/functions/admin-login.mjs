import {
  adminAccount,
  adminSessionCookie,
  enforceRateLimit,
  hasSecureSessionSecret,
  json,
  methodNotAllowed,
  parseJson,
  requireTrustedOrigin,
  signToken,
  verifyLogin,
} from './_backend.mjs'
import { randomUUID } from 'node:crypto'

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed()
  if (!requireTrustedOrigin(event)) {
    return json(403, { ok: false, error: 'untrusted_origin' })
  }

  try {
    const rate = enforceRateLimit(event, { limit: 5, windowMs: 15 * 60 * 1000 })
    if (!rate.ok) {
      return json(
        429,
        { ok: false, error: 'rate_limited', retryAfter: rate.retryAfter },
        { 'Retry-After': String(rate.retryAfter) },
      )
    }
    const { account = '', password = '' } = parseJson(event)
    const result = verifyLogin(account, password)

    if (result.setupRequired || !hasSecureSessionSecret()) {
      return json(503, {
        ok: false,
        error: 'admin_security_not_configured',
        message: 'Set the admin password and a distinct session secret in Netlify environment variables first.',
      })
    }

    if (!result.ok) {
      return json(401, {
        ok: false,
        error: 'invalid_credentials',
        message: 'Incorrect account or password.',
      })
    }

    const expiresAt = Date.now() + 1000 * 60 * 60
    const token = signToken({
      account: adminAccount(),
      aud: 'lunar-talisman-admin',
      sid: randomUUID(),
      exp: expiresAt,
    })
    return json(
      200,
      { ok: true, expiresAt },
      { 'Set-Cookie': adminSessionCookie(token, undefined, event) },
    )
  } catch {
    return json(400, { ok: false, error: 'bad_request' })
  }
}
