export type PublicOrder = {
  id: string
  customer: string
  email?: string
  phone?: string
  address: string
  product: string
  items?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  channel: string
  amount: number
  shippingMethod?: string
  shippingRegion?: 'Americas' | 'Europe' | 'Southeast Asia'
  shippingCountry?: string
  shippingFee?: number
  shippingStatus?: '待发货' | '备货中' | '已发货' | '运输中' | '已签收'
  trackingNumber?: string
  trackingCarrier?: string
  trackingEvents?: TrackingEvent[]
  message?: string
  status: '待处理' | '已付款' | '备货中' | '已发货' | '已完成'
  createdAt: string
}

export type TrackingEvent = {
  status: string
  detail: string
  at: string
}
