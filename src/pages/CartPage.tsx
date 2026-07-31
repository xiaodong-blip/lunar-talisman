import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Section } from '../components/ui/Section'
import { useCart } from '../hooks/useCart'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatCny } from '../utils/format'

export function CartPage() {
  usePageMeta({
    title: '购物车 | Lunar Talisman',
    description: '查看你已召唤的 Lunar Talisman 月光护符与水晶饰品。',
  })

  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart()

  return (
    <Section
      title="购物车"
      subtitle="被你召唤来的护符，会先在这里安静等待。"
      chakraAccent="crown"
    >
      {cart.length === 0 ? (
        <div className="rounded-[36px] border border-border bg-card p-8 text-center shadow-[0_20px_60px_rgba(58,53,48,0.05)]">
          <ShoppingBag
            size={64}
            className="mx-auto text-text-muted"
            strokeWidth={1.4}
          />
          <h2 className="mt-5 text-3xl text-text-primary">你的护符尚未被召唤</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-text-secondary">
            去完成水晶测试，或者从系列页挑选一件最贴近你此刻能量的饰品。
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/quiz">
              <Button variant="gold" size="lg">开始水晶测试</Button>
            </Link>
            <Link to="/collections">
              <Button variant="outline" size="lg">浏览系列</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="grid gap-4 rounded-[28px] border border-border bg-card p-4 shadow-[0_12px_36px_rgba(58,53,48,0.04)] md:grid-cols-[112px_1fr_auto] md:items-center"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-28 w-full rounded-2xl object-cover md:w-28"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-text-muted">
                    {item.product.collection}
                  </p>
                  <h2 className="mt-2 text-3xl text-text-primary">
                    {item.product.name}
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary">
                    {formatCny(item.product.price)} · {item.product.subtitle}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-warm-cream"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      aria-label="减少数量"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="min-w-6 text-center text-sm text-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-warm-cream"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      aria-label="增加数量"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-text-muted transition-colors hover:text-chakra-root"
                    onClick={() => removeFromCart(item.product.id)}
                    aria-label="删除商品"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-[32px] border border-border bg-card p-6 shadow-[0_20px_60px_rgba(58,53,48,0.05)]">
            <h2 className="text-3xl text-text-primary">结算预览</h2>
            <div className="mt-6 space-y-3 text-sm text-text-secondary">
              <div className="flex items-center justify-between">
                <span>商品数量</span>
                <span>{totalItems} 件</span>
              </div>
              <div className="flex items-center justify-between">
                <span>商品金额</span>
                <span>{formatCny(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>月光仪式包装</span>
                <span>已包含</span>
              </div>
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <div className="flex items-center justify-between">
                <span className="text-text-primary">总价</span>
                <span className="text-2xl font-semibold text-chakra-solar">
                  {formatCny(totalPrice)}
                </span>
              </div>
            </div>
            <Button variant="gold" size="lg" className="mt-6 w-full">
              去结账
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="mt-3 w-full"
              onClick={clearCart}
            >
              清空购物车
            </Button>
          </aside>
        </div>
      )}
    </Section>
  )
}
