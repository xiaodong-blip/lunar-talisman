import {
  adminSessionCookie,
  json,
  methodNotAllowed,
  requireAdmin,
  requireTrustedOrigin,
} from './_backend.mjs'

export async function handler(event) {
  if (!['GET', 'POST'].includes(event.httpMethod)) return methodNotAllowed()

  if (event.httpMethod === 'POST') {
    if (!requireTrustedOrigin(event)) {
      return json(403, { ok: false, error: 'untrusted_origin' })
    }
    return json(200, { ok: true }, { 'Set-Cookie': adminSessionCookie('', 0, event) })
  }

  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })
  return json(200, { ok: true })
}
