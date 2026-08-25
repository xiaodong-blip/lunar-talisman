import { json, methodNotAllowed } from './_backend.mjs'
import { isPaypalWebhookConfigured, paypalConfig } from './_paypal.mjs'

export async function handler(event) {
  if (event.httpMethod !== 'GET') return methodNotAllowed()
  const config = paypalConfig()
  return json(200, {
    ok: true,
    configured: config.configured,
    webhookConfigured: isPaypalWebhookConfigured(),
    environment: config.environment,
    currency: 'USD',
  })
}
