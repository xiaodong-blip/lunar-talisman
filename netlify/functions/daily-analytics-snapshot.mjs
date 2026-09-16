import {
  mutateJsonList,
  readJsonList,
  supportStore,
} from './_backend.mjs'
import { readGa4, readSearchConsole } from './_google-reporting.mjs'

export const config = {
  // 01:00 UTC is 09:00 Asia/Shanghai. Reports use the most recent complete UTC day.
  schedule: '0 1 * * *',
}

function previousUtcDate() {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

function storefrontMetrics(record = {}) {
  return {
    pageViews: Math.max(0, Number(record.pageViews) || 0),
    productViews: Math.max(0, Number(record.productViews) || 0),
    addToCart: Math.max(0, Number(record.addToCart) || 0),
    checkoutStarts: Math.max(0, Number(record.checkoutStarts) || 0),
    purchases: Math.max(0, Number(record.purchases) || 0),
    revenue: Math.max(0, Number(record.revenue) || 0),
  }
}

export default async function handler() {
  const store = supportStore()
  const [ga4, searchConsole, events] = await Promise.all([
    readGa4(1),
    readSearchConsole(1),
    readJsonList(store, 'analytics'),
  ])
  const reportDate = previousUtcDate()
  const event = events.find((item) => item?.date === reportDate)
  const snapshot = {
    date: reportDate,
    collectedAt: new Date().toISOString(),
    timezone: 'UTC report date; collected at 09:00 Asia/Shanghai',
    storefront: {
      date: reportDate,
      ...storefrontMetrics(event),
    },
    ga4,
    searchConsole,
  }

  await mutateJsonList(store, 'analytics-snapshots', (snapshots) => {
    const next = [snapshot, ...snapshots.filter((item) => item?.date !== snapshot.date)]
    return next.slice(0, 90)
  })

  return Response.json({ ok: true, date: snapshot.date })
}
