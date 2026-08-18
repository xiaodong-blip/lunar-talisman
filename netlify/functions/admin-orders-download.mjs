import { connectBlobs, escapeCsvCell, json, ordersStore, readJsonList, requireAdmin } from './_backend.mjs'

const KEY = 'orders'

function itemsText(order) {
  if (!Array.isArray(order.items) || order.items.length === 0) return ''
  return order.items
    .map((item) => `${item.name || item.id} x ${item.quantity || 1} (${item.price || 0})`)
    .join('; ')
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'GET') {
    return json(405, { ok: false, error: 'method_not_allowed' })
  }

  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })

  const orders = await readJsonList(ordersStore(), KEY)
  const headers = [
    'Order ID',
    'Customer',
    'Customer Email',
    'Customer Phone',
    'Delivery Address',
    'Product',
    'Line Items',
    'Order Note',
    'Delivery Region',
    'Delivery Country',
    'Shipping Method',
    'Shipping Fee',
    'Shipping Status',
    'Shipping Carrier',
    'Tracking Number',
    'Channel',
    'Amount (USD)',
    'Order Status',
    'Created At',
  ]
  const rows = orders.map((order) => [
    order.id,
    order.customer,
    order.email || '',
    order.phone || '',
    order.address,
    order.product,
    itemsText(order),
    order.message || '',
    order.shippingRegion || '',
    order.shippingCountry || '',
    order.shippingMethod || '',
    order.shippingFee || 0,
    order.shippingStatus || '',
    order.trackingCarrier || '',
    order.trackingNumber || '',
    order.channel,
    order.amount,
    order.status,
    order.createdAt,
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="lunar-talisman-orders-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
    body: `\uFEFF${csv}`,
  }
}
