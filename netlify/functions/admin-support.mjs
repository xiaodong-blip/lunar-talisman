import {
  connectBlobs,
  json,
  methodNotAllowed,
  mutateJsonList,
  parseJson,
  readJsonList,
  requireAdmin,
  requireTrustedOrigin,
  supportStore,
} from './_backend.mjs'

const KEY = 'requests'
const STATUSES = new Set(['new', 'in_progress', 'resolved'])

export async function handler(event) {
  connectBlobs(event)
  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })

  try {
    if (event.httpMethod === 'GET') {
      const requests = await readJsonList(supportStore(), KEY)
      return json(200, { ok: true, requests })
    }

    if (event.httpMethod === 'PUT') {
      if (!requireTrustedOrigin(event)) return json(403, { ok: false, error: 'untrusted_origin' })
      const { id = '', status = '' } = parseJson(event)
      const safeId = String(id).trim().slice(0, 120)
      const safeStatus = String(status).trim().slice(0, 30)
      if (!safeId || !STATUSES.has(safeStatus)) {
        return json(400, { ok: false, error: 'invalid_support_update' })
      }
      let found = false
      const requests = await mutateJsonList(supportStore(), KEY, (items) =>
        items.map((item) => {
          if (item?.id !== safeId) return item
          found = true
          return {
            ...item,
            status: safeStatus,
            updatedAt: new Date().toISOString(),
          }
        }),
      )
      if (!found) return json(404, { ok: false, error: 'support_request_not_found' })
      return json(200, { ok: true, requests })
    }

    return methodNotAllowed()
  } catch {
    return json(500, { ok: false, error: 'support_store_error' })
  }
}
