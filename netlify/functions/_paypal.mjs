import { cleanText } from './_backend.mjs'

const SANDBOX_API = 'https://api-m.sandbox.paypal.com'
const LIVE_API = 'https://api-m.paypal.com'

function configValue(name) {
  return cleanText(process.env[name], 500)
}

export function paypalConfig() {
  const environment = configValue('PAYPAL_ENVIRONMENT').toLowerCase() === 'live' ? 'live' : 'sandbox'
  const clientId = configValue('PAYPAL_CLIENT_ID')
  const clientSecret = configValue('PAYPAL_CLIENT_SECRET')
  return {
    environment,
    clientId,
    clientSecret,
    apiBaseUrl: environment === 'live' ? LIVE_API : SANDBOX_API,
    configured: Boolean(clientId && clientSecret),
  }
}

export function isPaypalConfigured() {
  return paypalConfig().configured
}

export function siteUrl(event) {
  const configured = configValue('SITE_URL').replace(/\/+$/, '')
  if (/^https:\/\//i.test(configured)) return configured

  const origin = cleanText(event?.headers?.origin || event?.headers?.Origin, 300).replace(/\/+$/, '')
  if (/^https?:\/\//i.test(origin)) return origin

  const host = cleanText(event?.headers?.host || event?.headers?.Host, 300)
  const proto = cleanText(event?.headers?.['x-forwarded-proto'] || 'https', 16)
  return host ? `${proto}://${host}` : 'https://lunartalisman.com'
}

export async function paypalAccessToken() {
  const config = paypalConfig()
  if (!config.configured) {
    const error = new Error('paypal_not_configured')
    error.code = 'paypal_not_configured'
    throw error
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
  const response = await fetch(`${config.apiBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.access_token) {
    const error = new Error('paypal_access_token_failed')
    error.code = 'paypal_access_token_failed'
    throw error
  }
  return { accessToken: data.access_token, config }
}

export async function paypalRequest(path, init = {}) {
  const { accessToken, config } = await paypalAccessToken()
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error('paypal_api_request_failed')
    error.code = 'paypal_api_request_failed'
    error.paypalStatus = response.status
    error.details = data
    throw error
  }
  return data
}

export async function verifyPaypalWebhook(event, webhookEvent) {
  const webhookId = configValue('PAYPAL_WEBHOOK_ID')
  if (!webhookId) return false

  const authAlgo = event?.headers?.['paypal-auth-algo'] || event?.headers?.['PayPal-Auth-Algo']
  const certUrl = event?.headers?.['paypal-cert-url'] || event?.headers?.['PayPal-Cert-Url']
  const transmissionId =
    event?.headers?.['paypal-transmission-id'] || event?.headers?.['PayPal-Transmission-Id']
  const transmissionSig =
    event?.headers?.['paypal-transmission-sig'] || event?.headers?.['PayPal-Transmission-Sig']
  const transmissionTime =
    event?.headers?.['paypal-transmission-time'] || event?.headers?.['PayPal-Transmission-Time']

  // Reject malformed requests before calling PayPal. Besides returning a
  // truthful 400 response, this prevents unsigned internet noise from
  // consuming the webhook's PayPal API allowance.
  if (
    !authAlgo ||
    !certUrl ||
    !transmissionId ||
    !transmissionSig ||
    !transmissionTime ||
    !webhookEvent ||
    typeof webhookEvent !== 'object'
  ) {
    return false
  }

  const verification = await paypalRequest('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
  })

  return verification.verification_status === 'SUCCESS'
}
