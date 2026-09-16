import { createSign } from 'node:crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

function base64url(value) {
  return Buffer.from(value).toString('base64url')
}

function configuredServiceAccount() {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '')
    if (
      serviceAccount?.client_email &&
      serviceAccount?.private_key &&
      serviceAccount?.token_uri
    ) {
      return serviceAccount
    }
  } catch {
    // The caller receives a configuration status rather than a credential error.
  }
  return null
}

async function accessToken(scope) {
  const serviceAccount = configuredServiceAccount()
  if (!serviceAccount) return null

  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope,
      aud: serviceAccount.token_uri || TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  )
  const input = `${header}.${claims}`
  const signer = createSign('RSA-SHA256')
  signer.update(input)
  signer.end()
  const signature = signer.sign(serviceAccount.private_key, 'base64url')

  const response = await fetch(serviceAccount.token_uri || TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${input}.${signature}`,
    }),
  })
  if (!response.ok) throw new Error('google_token_request_failed')
  const body = await response.json()
  return typeof body?.access_token === 'string' ? body.access_token : null
}

function dateRange(days) {
  const end = new Date()
  end.setUTCDate(end.getUTCDate() - 1)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - (days - 1))
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

async function googleJson(url, token, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  if (!response.ok) throw new Error(`google_api_${response.status}`)
  return response.json()
}

function metricValue(report, metricName) {
  const index = report?.metricHeaders?.findIndex((item) => item.name === metricName) ?? -1
  return Number(report?.rows?.[0]?.metricValues?.[index]?.value || 0)
}

export async function readGa4(days = 7) {
  const propertyId = String(process.env.GA4_PROPERTY_ID || '').trim()
  if (!propertyId || !configuredServiceAccount()) {
    return {
      status: 'not_configured',
      reason: 'Set GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_JSON in Netlify.',
    }
  }

  try {
    const token = await accessToken(GA4_SCOPE)
    const range = dateRange(days)
    const report = await googleJson(
      `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          dateRanges: [range],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'eventCount' },
          ],
        }),
      },
    )
    return {
      status: 'ok',
      collectedAt: new Date().toISOString(),
      timezone: 'Asia/Shanghai',
      range,
      users: metricValue(report, 'activeUsers'),
      sessions: metricValue(report, 'sessions'),
      pageViews: metricValue(report, 'screenPageViews'),
      events: metricValue(report, 'eventCount'),
    }
  } catch {
    return {
      status: 'unavailable',
      reason: 'GA4 rejected the configured service account or property access.',
    }
  }
}

export async function readSearchConsole(days = 7) {
  const siteUrl = String(process.env.GSC_SITE_URL || '').trim()
  if (!siteUrl || !configuredServiceAccount()) {
    return {
      status: 'not_configured',
      reason: 'Set GSC_SITE_URL and GOOGLE_SERVICE_ACCOUNT_JSON in Netlify.',
    }
  }

  try {
    const token = await accessToken(GSC_SCOPE)
    const range = dateRange(days)
    const report = await googleJson(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          startDate: range.startDate,
          endDate: range.endDate,
          type: 'web',
          rowLimit: 1,
        }),
      },
    )
    const row = report?.rows?.[0] || {}
    return {
      status: 'ok',
      collectedAt: new Date().toISOString(),
      timezone: 'Asia/Shanghai',
      range,
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
      ctr: Number(row.ctr || 0),
      position: Number(row.position || 0),
    }
  } catch {
    return {
      status: 'unavailable',
      reason: 'Search Console rejected the configured service account or property access.',
    }
  }
}
