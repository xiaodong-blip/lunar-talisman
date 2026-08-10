import { connectBlobs, escapeCsvCell, json, ordersStore, readJsonList, requireAdmin } from './_backend.mjs'

const KEY = 'orders'

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'GET') {
    return json(405, { ok: false, error: 'method_not_allowed' })
  }

  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })

  const orders = await readJsonList(ordersStore(), KEY)
  const headers = ['订单号', '客户', '客户邮箱', '客户地址', '商品', '渠道', '金额 USD', '状态', '下单时间']
  const rows = orders.map((order) => [
    order.id,
    order.customer,
    order.email || '',
    order.address,
    order.product,
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
