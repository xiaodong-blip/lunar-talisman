import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  BarChart3,
  Boxes,
  Download,
  DollarSign,
  Eye,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Search,
  ShoppingBag,
  Upload,
} from 'lucide-react'
import { readOrders, saveOrders } from './services/orders'
import type { PublicOrder } from './services/orders'

type NavigateFn = (path: string) => void

type AdminTab = 'overview' | 'traffic' | 'revenue' | 'orders' | 'products'

type OrderStatus = '待处理' | '已付款' | '备货中' | '已发货' | '已完成'

type AdminOrder = PublicOrder

type AdminProduct = {
  id: string
  name: string
  collection: string
  price: number
  stock: number
  image: string
  status: '上架' | '草稿'
}

const ADMIN_ACCOUNT = 'Lunar Talisman'
const ADMIN_PASSWORD = '31415926dong'
const SESSION_KEY = 'lunar-talisman-admin-session'
const PRODUCT_KEY = 'lunar-talisman-admin-products'

const initialOrders: AdminOrder[] = [
  {
    id: 'LT-20260807-001',
    customer: 'Mia Chen',
    address: '128 Moonstone Ave, Los Angeles, CA 90026, USA',
    product: '天蝎守护 · 紫水晶手链',
    channel: '官网',
    amount: 89,
    status: '已付款',
    createdAt: '08/07 10:24',
  },
  {
    id: 'LT-20260807-002',
    customer: 'Olivia Moon',
    address: '42 Crescent Lane, Brooklyn, NY 11211, USA',
    product: '满月祝福 · 月光石项链',
    channel: 'Instagram',
    amount: 149,
    status: '备货中',
    createdAt: '08/07 09:42',
  },
  {
    id: 'LT-20260806-019',
    customer: 'Luna Wang',
    address: '908 Sage Street, Seattle, WA 98103, USA',
    product: '心轮疗愈 · 玫瑰晶手链',
    channel: '官网',
    amount: 69,
    status: '已发货',
    createdAt: '08/06 22:10',
  },
  {
    id: 'LT-20260806-018',
    customer: 'Ava Star',
    address: '17 Aurora Road, Austin, TX 78704, USA',
    product: '新月仪式 · 净化套装',
    channel: 'TikTok',
    amount: 129,
    status: '已完成',
    createdAt: '08/06 18:36',
  },
]

const initialProducts: AdminProduct[] = [
  {
    id: 'P-001',
    name: '天蝎守护 · 紫水晶手链',
    collection: '星座守护',
    price: 89,
    stock: 42,
    image:
      'https://images.unsplash.com/photo-1599658880436-c617b95cbc3f?w=600',
    status: '上架',
  },
  {
    id: 'P-002',
    name: '心轮疗愈 · 玫瑰晶手链',
    collection: '脉轮疗愈',
    price: 69,
    stock: 31,
    image:
      'https://images.unsplash.com/photo-1605100802531-9abce0fdda72?w=600',
    status: '上架',
  },
  {
    id: 'P-003',
    name: '新月仪式 · 净化套装',
    collection: '月相仪式',
    price: 129,
    stock: 18,
    image:
      'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600',
    status: '上架',
  },
]

const trafficData = [
  { label: 'Mon', visits: 860, rate: 2.8 },
  { label: 'Tue', visits: 1120, rate: 3.1 },
  { label: 'Wed', visits: 980, rate: 2.9 },
  { label: 'Thu', visits: 1460, rate: 3.6 },
  { label: 'Fri', visits: 1680, rate: 4.2 },
  { label: 'Sat', visits: 1920, rate: 4.4 },
  { label: 'Sun', visits: 1530, rate: 3.8 },
]

const revenueData = [
  { label: '星座守护', amount: 6240, color: '#bfa8ff' },
  { label: '脉轮疗愈', amount: 4180, color: '#9bd8b6' },
  { label: '月相仪式', amount: 5360, color: '#f3cf78' },
  { label: '水晶护符', amount: 2890, color: '#a9d8ff' },
]

const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> =
  [
    { id: 'overview', label: '总览', icon: LayoutDashboard },
    { id: 'traffic', label: '流量监控', icon: BarChart3 },
    { id: 'revenue', label: '营收数据', icon: DollarSign },
    { id: 'orders', label: '订单管理', icon: ShoppingBag },
    { id: 'products', label: '商品上传', icon: PackagePlus },
  ]

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f6f3ee',
    color: '#2d2730',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  glass: {
    border: '1px solid rgba(79, 65, 91, 0.12)',
    background: 'rgba(255,255,255,0.72)',
    boxShadow: '0 20px 70px rgba(54, 35, 70, 0.08)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  },
  input: {
    width: '100%',
    border: '1px solid rgba(79, 65, 91, 0.14)',
    borderRadius: 14,
    padding: '13px 14px',
    outline: 'none',
    background: '#fff',
    color: '#2d2730',
    fontSize: 14,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    color: 'rgba(45,39,48,0.68)',
    fontSize: 13,
    fontWeight: 700,
  },
  primaryButton: {
    border: 0,
    borderRadius: 14,
    padding: '13px 18px',
    background: '#2d2730',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(45,39,48,0.18)',
  },
  subtleButton: {
    border: '1px solid rgba(79, 65, 91, 0.14)',
    borderRadius: 14,
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.72)',
    color: '#2d2730',
    fontWeight: 700,
    cursor: 'pointer',
  },
}

function normalizeAccount(value: string) {
  return value.trim().replace(/\s+/g, '').toLowerCase()
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US')}`
}

function escapeCsvCell(value: string | number) {
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function readStoredProducts() {
  try {
    const raw = window.localStorage.getItem(PRODUCT_KEY)
    if (!raw) return initialProducts
    const parsed = JSON.parse(raw) as AdminProduct[]
    return Array.isArray(parsed) ? parsed : initialProducts
  } catch {
    return initialProducts
  }
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Eye
  label: string
  value: string
  hint: string
}) {
  return (
    <div style={{ ...styles.glass, borderRadius: 24, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, #ffffff, #efe8ff)',
            color: '#7d68b8',
          }}
        >
          <Icon size={20} />
        </span>
        <span style={{ color: 'rgba(45,39,48,0.55)', fontSize: 13 }}>
          {label}
        </span>
      </div>
      <div style={{ marginTop: 18, fontSize: 30, fontWeight: 900 }}>
        {value}
      </div>
      <div style={{ marginTop: 6, color: '#7a9d76', fontSize: 13, fontWeight: 800 }}>
        {hint}
      </div>
    </div>
  )
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const accountOk =
      normalizeAccount(account) === normalizeAccount(ADMIN_ACCOUNT) ||
      normalizeAccount(account) === normalizeAccount('月之护符')

    if (accountOk && password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(SESSION_KEY, 'true')
      onLogin()
      return
    }

    setError('账号或密码不正确，请使用品牌名与管理密码登录。')
  }

  return (
    <main
      style={{
        ...styles.page,
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background:
          'radial-gradient(circle at 20% 20%, rgba(191,168,255,0.25), transparent 34%), radial-gradient(circle at 80% 10%, rgba(243,207,120,0.22), transparent 30%), #f6f3ee',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          ...styles.glass,
          width: 'min(440px, 100%)',
          borderRadius: 30,
          padding: 32,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            display: 'grid',
            placeItems: 'center',
            background: '#2d2730',
            color: '#fff',
            marginBottom: 22,
          }}
        >
          ✦
        </div>
        <h1 style={{ margin: 0, fontSize: 30, letterSpacing: -0.6 }}>
          Lunar Talisman 后台
        </h1>
        <p style={{ margin: '10px 0 26px', color: 'rgba(45,39,48,0.58)' }}>
          管理流量、营收、订单与商品上传。
        </p>

        <label style={styles.label}>管理账号</label>
        <input
          value={account}
          onChange={(event) => setAccount(event.target.value)}
          placeholder="Lunar Talisman"
          style={styles.input}
        />

        <div style={{ height: 16 }} />
        <label style={styles.label}>密码</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="请输入管理密码"
          type="password"
          style={styles.input}
        />

        {error ? (
          <div
            style={{
              marginTop: 14,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(196,90,90,0.1)',
              color: '#9a4545',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        <button type="submit" style={{ ...styles.primaryButton, width: '100%', marginTop: 22 }}>
          进入后台
        </button>
      </form>
    </main>
  )
}

function TrafficPanel() {
  const minVisits = Math.min(...trafficData.map((item) => item.visits))
  const maxVisits = Math.max(...trafficData.map((item) => item.visits))
  const minRate = Math.min(...trafficData.map((item) => item.rate))
  const maxRate = Math.max(...trafficData.map((item) => item.rate))
  const avgVisits =
    trafficData.reduce((sum, item) => sum + item.visits, 0) / trafficData.length
  const avgRate =
    trafficData.reduce((sum, item) => sum + item.rate, 0) / trafficData.length
  const chart = { width: 720, height: 260, left: 58, right: 38, top: 28, bottom: 42 }
  const plotWidth = chart.width - chart.left - chart.right
  const plotHeight = chart.height - chart.top - chart.bottom
  const scaleX = (value: number) =>
    chart.left + ((value - minVisits) / Math.max(1, maxVisits - minVisits)) * plotWidth
  const scaleY = (value: number) =>
    chart.top + (1 - (value - minRate) / Math.max(0.1, maxRate - minRate)) * plotHeight
  const axisX = scaleX(avgVisits)
  const axisY = scaleY(avgRate)
  const points = trafficData.map((item) => ({
    ...item,
    x: scaleX(item.visits),
    y: scaleY(item.rate),
  }))
  const curvePath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const previous = points[index - 1]
    const midX = (previous.x + point.x) / 2
    const midY = (previous.y + point.y) / 2
    return `${path} Q ${previous.x} ${previous.y} ${midX} ${midY}`
  }, '')
  const finalPoint = points[points.length - 1]
  const completedPath = `${curvePath} T ${finalPoint.x} ${finalPoint.y}`

  return (
    <div style={{ ...styles.glass, borderRadius: 26, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>近 7 日流量</h2>
          <p style={{ margin: '8px 0 0', color: 'rgba(45,39,48,0.55)', fontSize: 14 }}>
            访问、转化率与峰值日表现。
          </p>
        </div>
        <span style={{ color: '#7a9d76', fontWeight: 900 }}>+18.6%</span>
      </div>
      <div
        style={{
          height: 286,
          marginTop: 26,
          borderRadius: 24,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.82), rgba(246,241,251,0.76))',
          border: '1px solid rgba(79, 65, 91, 0.08)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label="访问量与转化率四象限曲线图"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            <linearGradient id="traffic-curve-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f3cf78" />
              <stop offset="48%" stopColor="#bfa8ff" />
              <stop offset="100%" stopColor="#7a9d76" />
            </linearGradient>
            <filter id="traffic-soft-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            x={chart.left}
            y={chart.top}
            width={plotWidth}
            height={plotHeight}
            rx="22"
            fill="rgba(45,39,48,0.025)"
          />
          <rect
            x={chart.left}
            y={chart.top}
            width={axisX - chart.left}
            height={axisY - chart.top}
            rx="20"
            fill="rgba(191,168,255,0.08)"
          />
          <rect
            x={axisX}
            y={chart.top}
            width={chart.left + plotWidth - axisX}
            height={axisY - chart.top}
            rx="20"
            fill="rgba(122,157,118,0.08)"
          />
          <rect
            x={chart.left}
            y={axisY}
            width={axisX - chart.left}
            height={chart.top + plotHeight - axisY}
            rx="20"
            fill="rgba(243,207,120,0.08)"
          />
          <rect
            x={axisX}
            y={axisY}
            width={chart.left + plotWidth - axisX}
            height={chart.top + plotHeight - axisY}
            rx="20"
            fill="rgba(191,168,255,0.06)"
          />

          {[0.25, 0.5, 0.75].map((step) => (
            <g key={step}>
              <line
                x1={chart.left + plotWidth * step}
                y1={chart.top}
                x2={chart.left + plotWidth * step}
                y2={chart.top + plotHeight}
                stroke="rgba(45,39,48,0.05)"
                strokeWidth="1"
              />
              <line
                x1={chart.left}
                y1={chart.top + plotHeight * step}
                x2={chart.left + plotWidth}
                y2={chart.top + plotHeight * step}
                stroke="rgba(45,39,48,0.05)"
                strokeWidth="1"
              />
            </g>
          ))}

          <line
            x1={axisX}
            y1={chart.top - 8}
            x2={axisX}
            y2={chart.top + plotHeight + 8}
            stroke="rgba(45,39,48,0.18)"
            strokeDasharray="5 7"
            strokeWidth="1.4"
          />
          <line
            x1={chart.left - 8}
            y1={axisY}
            x2={chart.left + plotWidth + 8}
            y2={axisY}
            stroke="rgba(45,39,48,0.18)"
            strokeDasharray="5 7"
            strokeWidth="1.4"
          />

          <text x={chart.left} y={chart.top - 10} fill="rgba(45,39,48,0.42)" fontSize="12">
            高转化
          </text>
          <text
            x={chart.left + plotWidth}
            y={chart.top + plotHeight + 28}
            fill="rgba(45,39,48,0.42)"
            fontSize="12"
            textAnchor="end"
          >
            高访问
          </text>
          <text
            x={axisX + 10}
            y={axisY - 10}
            fill="rgba(45,39,48,0.42)"
            fontSize="12"
          >
            平均线
          </text>

          <path
            d={completedPath}
            fill="none"
            stroke="rgba(191,168,255,0.26)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#traffic-soft-glow)"
          />
          <path
            d={completedPath}
            fill="none"
            stroke="url(#traffic-curve-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="#fff"
                stroke="url(#traffic-curve-gradient)"
                strokeWidth="3"
              />
              <text
                x={point.x}
                y={point.y - 15}
                textAnchor="middle"
                fill="rgba(45,39,48,0.58)"
                fontSize="11"
                fontWeight="700"
              >
                {point.rate.toFixed(1)}%
              </text>
              <text
                x={point.x}
                y={chart.top + plotHeight + 24}
                textAnchor="middle"
                fill="rgba(45,39,48,0.48)"
                fontSize="12"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

function RevenuePanel() {
  const total = revenueData.reduce((sum, item) => sum + item.amount, 0)
  return (
    <div style={{ ...styles.glass, borderRadius: 26, padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 20 }}>营收结构</h2>
      <p style={{ margin: '8px 0 22px', color: 'rgba(45,39,48,0.55)', fontSize: 14 }}>
        按系列查看 GMV 贡献。
      </p>
      <div style={{ display: 'grid', gap: 16 }}>
        {revenueData.map((item) => (
          <div key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <strong>{item.label}</strong>
              <span>{formatCurrency(item.amount)}</span>
            </div>
            <div
              style={{
                height: 10,
                marginTop: 8,
                borderRadius: 999,
                background: 'rgba(45,39,48,0.07)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(item.amount / total) * 100}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrdersTable({
  orders,
  setOrders,
}: {
  orders: AdminOrder[]
  setOrders: (orders: AdminOrder[]) => void
}) {
  const [query, setQuery] = useState('')
  const filtered = orders.filter((order) =>
    `${order.id} ${order.customer} ${order.product}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  const downloadOrders = () => {
    const headers = [
      '订单号',
      '客户',
      '客户邮箱',
      '客户地址',
      '商品',
      '渠道',
      '金额 USD',
      '状态',
      '下单时间',
    ]
    const rows = filtered.map((order) => [
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
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `lunar-talisman-orders-${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ ...styles.glass, borderRadius: 26, padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>订单管理</h2>
          <p style={{ margin: '8px 0 0', color: 'rgba(45,39,48,0.55)', fontSize: 14 }}>
            搜索订单、查看金额，并更新履约状态。
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={downloadOrders}
            style={{
              ...styles.subtleButton,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 47,
            }}
          >
            <Download size={16} />
            下载订单
          </button>
          <label
          style={{
            ...styles.input,
            width: 260,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          >
            <Search size={16} color="rgba(45,39,48,0.44)" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索订单"
              style={{
                border: 0,
                outline: 0,
                background: 'transparent',
                width: '100%',
                color: '#2d2730',
              }}
            />
          </label>
        </div>
      </div>
      <div style={{ overflowX: 'auto', marginTop: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr style={{ color: 'rgba(45,39,48,0.48)', fontSize: 12, textAlign: 'left' }}>
              <th style={{ padding: '12px 10px' }}>订单号</th>
              <th style={{ padding: '12px 10px' }}>客户</th>
              <th style={{ padding: '12px 10px' }}>商品</th>
              <th style={{ padding: '12px 10px' }}>渠道</th>
              <th style={{ padding: '12px 10px' }}>金额</th>
              <th style={{ padding: '12px 10px' }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} style={{ borderTop: '1px solid rgba(45,39,48,0.08)' }}>
                <td style={{ padding: '15px 10px', fontWeight: 800 }}>{order.id}</td>
                <td style={{ padding: '15px 10px' }}>{order.customer}</td>
                <td style={{ padding: '15px 10px', color: 'rgba(45,39,48,0.68)' }}>
                  {order.product}
                </td>
                <td style={{ padding: '15px 10px' }}>{order.channel}</td>
                <td style={{ padding: '15px 10px', fontWeight: 900 }}>
                  {formatCurrency(order.amount)}
                </td>
                <td style={{ padding: '15px 10px' }}>
                  <select
                    value={order.status}
                    onChange={(event) =>
                      setOrders(
                        orders.map((item) =>
                          item.id === order.id
                            ? { ...item, status: event.target.value as OrderStatus }
                            : item,
                        ),
                      )
                    }
                    style={{
                      border: '1px solid rgba(45,39,48,0.12)',
                      borderRadius: 999,
                      padding: '8px 10px',
                      background: '#fff',
                      color: '#2d2730',
                    }}
                  >
                    {['待处理', '已付款', '备货中', '已发货', '已完成'].map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductManager({
  products,
  setProducts,
  navigate,
}: {
  products: AdminProduct[]
  setProducts: (products: AdminProduct[]) => void
  navigate: NavigateFn
}) {
  const [form, setForm] = useState({
    name: '',
    collection: '水晶护符',
    price: '89',
    stock: '20',
    image: '',
    status: '上架' as AdminProduct['status'],
  })
  const [notice, setNotice] = useState('')

  const updateField = (key: keyof typeof form, value: string) => {
    setNotice('')
    setForm((current) => ({ ...current, [key]: value }))
  }

  const uploadImage = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateField('image', String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setNotice('请先填写商品名称。')
      return
    }

    const nextProduct: AdminProduct = {
      id: `P-${String(products.length + 1).padStart(3, '0')}`,
      name: form.name.trim(),
      collection: form.collection,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      image:
        form.image ||
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600',
      status: form.status,
    }
    const nextProducts = [nextProduct, ...products]
    setProducts(nextProducts)
    window.localStorage.setItem(PRODUCT_KEY, JSON.stringify(nextProducts))
    setNotice('商品已保存，并已同步到前台商品入口。')
    setForm({
      name: '',
      collection: '水晶护符',
      price: '89',
      stock: '20',
      image: '',
      status: '上架',
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 22 }}>
      <form onSubmit={submit} style={{ ...styles.glass, borderRadius: 26, padding: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>上传商品</h2>
        <p style={{ margin: '8px 0 20px', color: 'rgba(45,39,48,0.55)', fontSize: 14 }}>
          录入基础信息、价格、库存和商品图。
        </p>

        <label style={styles.label}>商品名称</label>
        <input
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="例如：顶轮白水晶护符"
          style={styles.input}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          <div>
            <label style={styles.label}>系列</label>
            <select
              value={form.collection}
              onChange={(event) => updateField('collection', event.target.value)}
              style={styles.input}
            >
              {['星座守护', '脉轮疗愈', '月相仪式', '水晶护符', '月之典籍'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>状态</label>
            <select
              value={form.status}
              onChange={(event) =>
                updateField('status', event.target.value as AdminProduct['status'])
              }
              style={styles.input}
            >
              <option>上架</option>
              <option>草稿</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          <div>
            <label style={styles.label}>价格 USD</label>
            <input
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              inputMode="decimal"
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>库存</label>
            <input
              value={form.stock}
              onChange={(event) => updateField('stock', event.target.value)}
              inputMode="numeric"
              style={styles.input}
            />
          </div>
        </div>

        <label style={{ ...styles.label, marginTop: 14 }}>商品图片</label>
        <label
          style={{
            border: '1px dashed rgba(79,65,91,0.24)',
            borderRadius: 18,
            minHeight: 150,
            display: 'grid',
            placeItems: 'center',
            background: '#fff',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {form.image ? (
            <img
              src={form.image}
              alt="商品预览"
              style={{ width: '100%', height: 170, objectFit: 'cover' }}
            />
          ) : (
            <span
              style={{
                display: 'grid',
                gap: 8,
                placeItems: 'center',
                color: 'rgba(45,39,48,0.48)',
                fontWeight: 700,
              }}
            >
              <Upload size={24} />
              点击上传图片
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => uploadImage(event.target.files?.[0])}
            style={{ display: 'none' }}
          />
        </label>

        {notice ? (
          <div
            style={{
              marginTop: 14,
              padding: '10px 12px',
              borderRadius: 12,
              background: notice.includes('请')
                ? 'rgba(196,90,90,0.1)'
                : 'rgba(122,157,118,0.12)',
              color: notice.includes('请') ? '#9a4545' : '#55744f',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {notice}
          </div>
        ) : null}

        <button type="submit" style={{ ...styles.primaryButton, width: '100%', marginTop: 18 }}>
          保存商品
        </button>
      </form>

      <div style={{ ...styles.glass, borderRadius: 26, padding: 24, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>商品列表</h2>
            <p style={{ margin: '8px 0 0', color: 'rgba(45,39,48,0.55)', fontSize: 14 }}>
              上架商品会同步到前台水晶护符入口。
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/series/crystals')}
            style={styles.subtleButton}
          >
            前台商品页
          </button>
        </div>
        <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '72px 1fr auto',
                alignItems: 'center',
                gap: 14,
                padding: 12,
                border: '1px solid rgba(45,39,48,0.08)',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.6)',
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover' }}
              />
              <div>
                <strong>{product.name}</strong>
                <div style={{ marginTop: 6, color: 'rgba(45,39,48,0.55)', fontSize: 13 }}>
                  {product.collection} · 库存 {product.stock}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900 }}>{formatCurrency(product.price)}</div>
                <div
                  style={{
                    marginTop: 7,
                    borderRadius: 999,
                    padding: '5px 9px',
                    background:
                      product.status === '上架'
                        ? 'rgba(122,157,118,0.12)'
                        : 'rgba(45,39,48,0.08)',
                    color: product.status === '上架' ? '#55744f' : 'rgba(45,39,48,0.55)',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {product.status}
                </div>
                {product.status === '上架' ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/detail/admin-${product.id}`)}
                    style={{
                      marginTop: 8,
                      border: '1px solid rgba(45,39,48,0.12)',
                      borderRadius: 999,
                      padding: '6px 10px',
                      background: '#fff',
                      color: '#2d2730',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    查看前台
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage({ navigate }: { navigate: NavigateFn }) {
  const [authed, setAuthed] = useState(() => window.sessionStorage.getItem(SESSION_KEY) === 'true')
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [orders, setOrdersState] = useState<AdminOrder[]>(() => readOrders(initialOrders))
  const [products, setProducts] = useState<AdminProduct[]>(() => readStoredProducts())

  useEffect(() => {
    document.title = 'Lunar Talisman 后台管理'
  }, [])

  const setOrders = (nextOrders: AdminOrder[]) => {
    setOrdersState(nextOrders)
    saveOrders(nextOrders)
  }

  const metrics = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + order.amount, 0)
    return {
      visits: trafficData.reduce((sum, item) => sum + item.visits, 0),
      revenue,
      orders: orders.length,
      products: products.length,
    }
  }, [orders, products.length])

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />
  }

  const logout = () => {
    window.sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }

  return (
    <main style={styles.page}>
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
        }}
      >
        <aside
          style={{
            padding: 22,
            borderRight: '1px solid rgba(79,65,91,0.1)',
            background: 'rgba(255,255,255,0.56)',
            position: 'sticky',
            top: 0,
            height: '100vh',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              border: 0,
              background: 'transparent',
              padding: 0,
              color: '#2d2730',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900 }}>Lunar Talisman</div>
            <div style={{ marginTop: 5, color: 'rgba(45,39,48,0.52)', fontSize: 12 }}>
              Brand Admin
            </div>
          </button>

          <nav style={{ display: 'grid', gap: 8, marginTop: 32 }}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    border: active ? '1px solid rgba(45,39,48,0.16)' : '1px solid transparent',
                    borderRadius: 16,
                    padding: '12px 13px',
                    background: active ? '#fff' : 'transparent',
                    color: active ? '#2d2730' : 'rgba(45,39,48,0.58)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: active ? '0 10px 26px rgba(54,35,70,0.08)' : 'none',
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={logout}
            style={{
              ...styles.subtleButton,
              position: 'absolute',
              left: 22,
              right: 22,
              bottom: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <LogOut size={16} />
            退出登录
          </button>
        </aside>

        <section style={{ padding: '28px min(4vw, 44px) 44px', overflow: 'hidden' }}>
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 18,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ color: 'rgba(45,39,48,0.5)', fontSize: 13, fontWeight: 800 }}>
                今天 · 2026/08/07
              </div>
              <h1 style={{ margin: '6px 0 0', fontSize: 34, letterSpacing: -0.8 }}>
                经营控制台
              </h1>
            </div>
            <button type="button" onClick={() => navigate('/')} style={styles.subtleButton}>
              返回网站
            </button>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))',
              gap: 16,
              marginBottom: 22,
            }}
          >
            <MetricCard
              icon={Eye}
              label="今日访问"
              value={metrics.visits.toLocaleString('en-US')}
              hint="+18.6% vs 昨日"
            />
            <MetricCard
              icon={DollarSign}
              label="本周营收"
              value={formatCurrency(metrics.revenue)}
              hint="+12.4% vs 上周"
            />
            <MetricCard
              icon={ShoppingBag}
              label="待跟进订单"
              value={String(metrics.orders)}
              hint="2 单需备货"
            />
            <MetricCard
              icon={Boxes}
              label="商品数量"
              value={String(metrics.products)}
              hint="支持上传新增"
            />
          </div>

          {activeTab === 'overview' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.9fr', gap: 22 }}>
              <TrafficPanel />
              <RevenuePanel />
              <div style={{ gridColumn: '1 / -1' }}>
                <OrdersTable orders={orders} setOrders={setOrders} />
              </div>
            </div>
          ) : null}

          {activeTab === 'traffic' ? <TrafficPanel /> : null}
          {activeTab === 'revenue' ? <RevenuePanel /> : null}
          {activeTab === 'orders' ? <OrdersTable orders={orders} setOrders={setOrders} /> : null}
          {activeTab === 'products' ? (
            <ProductManager products={products} setProducts={setProducts} navigate={navigate} />
          ) : null}

          <div
            style={{
              marginTop: 22,
              padding: '14px 16px',
              borderRadius: 18,
              background: 'rgba(45,39,48,0.06)',
              color: 'rgba(45,39,48,0.58)',
              fontSize: 13,
            }}
          >
            当前版本为前端管理后台预览：数据用于 UI 和流程验收，正式上线前建议接入真实数据库、权限校验和支付/物流接口。
          </div>
        </section>
      </div>
    </main>
  )
}
