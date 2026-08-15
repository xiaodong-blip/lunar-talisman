import {
  adminAccount,
  enforceRateLimit,
  getSessionSecret,
  json,
  methodNotAllowed,
  parseJson,
  signToken,
  verifyLogin,
} from './_backend.mjs'

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed()

  try {
    const rate = enforceRateLimit(event, { limit: 8, windowMs: 15 * 60 * 1000 })
    if (!rate.ok) {
      return json(
        429,
        { ok: false, error: 'rate_limited', retryAfter: rate.retryAfter },
        { 'Retry-After': String(rate.retryAfter) },
      )
    }
    const { account = '', password = '' } = parseJson(event)
    const result = verifyLogin(account, password)

    if (result.setupRequired || !getSessionSecret()) {
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

    const expiresAt = Date.now() + 1000 * 60 * 60 * 8
    const token = signToken({ account: adminAccount(), exp: expiresAt })
    return json(200, { ok: true, token, expiresAt })
  } catch {
    return json(400, { ok: false, error: 'bad_request' })
  }
}
