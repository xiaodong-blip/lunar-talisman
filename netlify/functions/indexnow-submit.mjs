import {
  connectBlobs,
  enforceRateLimit,
  json,
  methodNotAllowed,
  parseJson,
  requireAdmin,
  requireTrustedOrigin,
} from './_backend.mjs'
import { submitIndexNow } from './_indexnow.mjs'

const MAX_PATHS = 250

function sanitizePaths(value) {
  if (!Array.isArray(value) || value.length > MAX_PATHS) return null
  const paths = value
    .filter((path) => typeof path === 'string')
    .map((path) => path.trim())
    .filter((path) => /^\/(?:$|series\/crystals$|detail\/admin-[a-zA-Z0-9_-]{1,120}$)/.test(path))
  return [...new Set(paths)]
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'POST') return methodNotAllowed()
  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })
  if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })

  const rate = enforceRateLimit(event, { limit: 8, windowMs: 10 * 60 * 1000 })
  if (!rate.ok) {
    return json(429, { ok: false, error: 'rate_limited' }, { 'Retry-After': String(rate.retryAfter) })
  }

  try {
    const { paths } = parseJson(event)
    const safePaths = sanitizePaths(paths)
    if (!safePaths?.length) return json(400, { ok: false, error: 'invalid_paths' })

    const result = await submitIndexNow(safePaths)
    if (!result.accepted) {
      return json(502, { ok: false, error: 'indexnow_rejected', result })
    }

    return json(200, { ok: true, result })
  } catch {
    return json(502, { ok: false, error: 'indexnow_unavailable' })
  }
}
