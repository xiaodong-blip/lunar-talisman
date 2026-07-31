import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { formatCny } from '../../utils/format'
import { Button } from '../ui/Button'

type CartDrawerProps = {
  open: boolean
  onClose: () => void
}

export function CartToast() {
  const { toastMessage, toastId, dismissToast } = useCart()

  useEffect(() => {
    if (!toastMessage) return

    const timer = window.setTimeout(() => {
      dismissToast()
    }, 2200)

    return () => window.clearTimeout(timer)
  }, [dismissToast, toastId, toastMessage])

  return (
    <div
      className={`fixed right-4 top-24 z-[70] max-w-sm rounded-2xl border border-chakra-crown/25 bg-card px-4 py-3 text-sm text-text-primary shadow-[0_18px_46px_rgba(58,53,48,0.14)] transition-all duration-300 ${
        toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-chakra-crown/15 text-chakra-crown">
          <ShoppingBag size={18} />
        </span>
        <span>{toastMessage}</span>
      </div>
    </div>
  )
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, open])

  return (
    <>
      <div
        className={`fixed inset-0 z-[58] bg-text-primary/20 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-[60] flex h-svh w-full max-w-[400px] flex-col border-l-[3px] border-chakra-crown bg-card shadow-[0_24px_80px_rgba(58,53,48,0.18)] transition-transform duration-300 md:w-[400px] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-5">
          <h2 className="text-3xl text-text-primary">购物车</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition-colors hover:text-text-primary"
            aria-label="关闭购物车"
          >
            <X size={18} />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag size={58} className="text-text-muted" strokeWidth={1.4} />
            <h3 className="mt-5 text-2xl text-text-primary">你的护符尚未被召唤</h3>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              去系列页或水晶测试里，寻找此刻最适合你的能量。
            </p>
            <Link to="/quiz" onClick={onClose} className="mt-6">
              <Button variant="gold" size="md">开始水晶测试</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="grid grid-cols-[72px_1fr] gap-4 rounded-2xl border border-border bg-white/75 p-3"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-[72px] w-[72px] rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-lg text-text-primary">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {formatCny(item.product.price)}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-warm-cream"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          aria-label="减少数量"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-5 text-center text-sm text-text-primary">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-warm-cream"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          aria-label="增加数量"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-text-muted transition-colors hover:text-chakra-root"
                        aria-label="删除商品"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-border px-5 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-text-secondary">总价</span>
                <span className="text-xl font-semibold text-chakra-solar">
                  {formatCny(totalPrice)}
                </span>
              </div>
              <Button variant="gold" size="lg" className="w-full">
                去结账
              </Button>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
