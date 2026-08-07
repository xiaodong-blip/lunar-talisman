export type CheckoutItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export type CustomerInfo = {
  name: string
  email: string
  address: string
}

export type CheckoutPayload = {
  items: CheckoutItem[]
  customer?: CustomerInfo
}

export function getCheckoutUrl() {
  return import.meta.env.VITE_CHECKOUT_URL as string | undefined
}

export async function createCheckoutSession(payload: CheckoutPayload) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

  if (!apiBaseUrl) {
    return {
      ok: false,
      reason:
        'Checkout API is not configured. Add VITE_API_BASE_URL after the payment backend is ready.',
      payload,
    }
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Checkout request failed: ${response.status}`)
  }

  return (await response.json()) as { ok: true; url: string }
}

export function openConfiguredCheckoutFallback() {
  const checkoutUrl = getCheckoutUrl()
  if (!checkoutUrl || typeof window === 'undefined') return false
  window.location.href = checkoutUrl
  return true
}
