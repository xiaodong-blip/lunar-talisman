import { cleanText } from './_backend.mjs'

function emailConfig() {
  return {
    apiKey: cleanText(process.env.RESEND_API_KEY, 500),
    from: cleanText(process.env.ORDER_EMAIL_FROM, 200),
    support: cleanText(process.env.BRAND_SUPPORT_EMAIL, 200),
    notifications: cleanText(process.env.ORDER_NOTIFICATION_EMAIL, 500),
  }
}

function dollars(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

async function sendEmail({ to, subject, html }) {
  const config = emailConfig()
  if (!config.apiKey || !config.from || !to) return { sent: false, skipped: true }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: config.from, to, subject, html }),
  })

  if (!response.ok) {
    const error = new Error('email_send_failed')
    error.code = 'email_send_failed'
    throw error
  }
  return { sent: true }
}

export async function sendOrderPaidEmails(order, siteUrl) {
  const config = emailConfig()
  const trackingUrl = `${siteUrl}/track`
  const itemText = Array.isArray(order.items)
    ? order.items.map((item) => `${item.name} × ${item.quantity}`).join('<br>')
    : order.product

  await Promise.allSettled([
    sendEmail({
      to: order.email,
      subject: `Payment confirmed · ${order.id}`,
      html: `<h2>Thank you for choosing Lunar Talisman.</h2><p>Your payment of <strong>${dollars(
        order.amount,
      )}</strong> has been confirmed.</p><p><strong>Order:</strong> ${order.id}<br>${itemText}</p><p>We will email you once your talisman is on its way. You can follow delivery updates at <a href="${trackingUrl}">${trackingUrl}</a>.</p>`,
    }),
    sendEmail({
      to: config.notifications,
      subject: `New paid order · ${order.id}`,
      html: `<h2>New paid order</h2><p><strong>${order.id}</strong> · ${dollars(
        order.amount,
      )}</p><p>${itemText}</p><p>Open the Lunar Talisman admin console to fulfil it.</p>`,
    }),
  ])
}

export async function sendShipmentEmail(order, siteUrl) {
  const trackingUrl = `${siteUrl}/track`
  await sendEmail({
    to: order.email,
    subject: `Delivery update · ${order.id}`,
    html: `<h2>Your talisman has a delivery update.</h2><p><strong>Status:</strong> ${
      order.shippingStatus || 'Updated'
    }</p><p><strong>Carrier:</strong> ${order.trackingCarrier || 'To be confirmed'}<br><strong>Tracking number:</strong> ${
      order.trackingNumber || 'To be confirmed'
    }</p><p>View the latest details at <a href="${trackingUrl}">${trackingUrl}</a>.</p>`,
  })
}

export async function sendRefundEmail(order) {
  await sendEmail({
    to: order.email,
    subject: `Refund update · ${order.id}`,
    html: `<h2>Your Lunar Talisman refund has been processed.</h2><p>Order <strong>${
      order.id
    }</strong> has been refunded. Your payment provider may take a few business days to display the credit.</p>`,
  })
}

export async function sendSupportRequestEmails(request) {
  const config = emailConfig()
  const title = request.type === 'refund' ? 'Return or refund request' : 'Customer support request'
  await Promise.allSettled([
    sendEmail({
      to: request.email,
      subject: `We received your request · ${request.id}`,
      html: `<h2>We received your Lunar Talisman request.</h2><p>Reference: <strong>${
        request.id
      }</strong></p><p>Our customer care team will reply to ${
        request.email
      } within 1–3 business days.</p>`,
    }),
    sendEmail({
      to: config.notifications,
      subject: `${title} · ${request.id}`,
      html: `<h2>${title}</h2><p><strong>${request.name}</strong> · ${
        request.email
      }</p><p><strong>Order:</strong> ${request.orderId || 'Not provided'}</p><p>${request.message}</p>`,
    }),
  ])
}
