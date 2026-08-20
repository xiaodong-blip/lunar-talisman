import {
  connectBlobs,
  json,
  methodNotAllowed,
  ordersStore,
  readJsonList,
  requireAdmin,
  supportStore,
} from './_backend.mjs'

function daysAgo(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - (count - 1 - index))
    return date.toISOString().slice(0, 10)
  })
}

export async function handler(event) {
  connectBlobs(event)
  if (event.httpMethod !== 'GET') return methodNotAllowed()
  if (!requireAdmin(event)) return json(401, { ok: false, error: 'unauthorized' })

  try {
    const [events, orders] = await Promise.all([
      readJsonList(supportStore(), 'analytics'),
      readJsonList(ordersStore(), 'orders'),
    ])
    const eventByDate = new Map(events.map((item) => [item?.date, item]))
    const traffic = daysAgo(7).map((date) => {
      const item = eventByDate.get(date) || {}
      const visits = Number(item.pageViews || 0)
      const purchases = Number(item.purchases || 0)
      return {
        date,
        label: new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(
          new Date(`${date}T12:00:00Z`),
        ),
        visits,
        rate: visits ? (purchases / visits) * 100 : 0,
        purchases,
        checkoutStarts: Number(item.checkoutStarts || 0),
      }
    })
    const paidOrders = orders.filter((order) => order?.paymentStatus === 'paid')
    const revenue = paidOrders.reduce((sum, order) => sum + Math.max(0, Number(order.amount) || 0), 0)
    return json(200, {
      ok: true,
      traffic,
      metrics: {
        pageViews: traffic.reduce((sum, item) => sum + item.visits, 0),
        paidOrders: paidOrders.length,
        revenue,
        pendingOrders: orders.filter(
          (order) => order?.paymentStatus === 'paid' && order?.shippingStatus !== '已签收',
        ).length,
      },
    })
  } catch {
    return json(500, { ok: false, error: 'analytics_read_failed' })
  }
}
