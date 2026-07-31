import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Moon, Menu, ShoppingBag, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useCart } from '../../hooks/useCart'
import { CartDrawer, CartToast } from '../cart/CartDrawer'

const links = [
  { to: '/', label: '首页' },
  { to: '/collections', label: '系列' },
  { to: '/blog', label: '玄学库' },
  { to: '/about', label: '关于' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCart()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b border-border transition-all duration-300',
        scrolled
          ? 'bg-white/90 shadow-sm backdrop-blur-md'
          : 'bg-warm-cream/88 backdrop-blur-md',
      )}
    >
      <div className="content-wrap flex h-18 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70 text-chakra-crown">
            <Moon size={20} fill="currentColor" strokeWidth={1.4} />
          </span>
          <span className="font-serif text-lg tracking-[0.18em] text-text-primary md:text-xl">
            LUNAR TALISMAN
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'group relative text-sm font-medium text-text-secondary transition-colors hover:text-chakra-crown',
                  isActive && 'text-text-primary',
                )
              }
            >
              {link.label}
              <span className="absolute inset-x-0 -bottom-2 h-px origin-left scale-x-0 bg-chakra-crown transition-transform duration-300 group-hover:scale-x-100" />
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/65 text-text-primary transition-colors hover:text-chakra-solar"
            aria-label="打开购物车"
          >
            <ShoppingBag size={18} />
            {totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-chakra-solar px-1 text-[11px] font-semibold text-white">
                {totalItems}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/65 text-text-primary md:hidden"
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-0 top-[72px] z-40 bg-text-primary/15 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed right-0 top-[72px] z-50 h-[calc(100svh-72px)] w-[82vw] max-w-[340px] border-l-[3px] border-chakra-crown bg-card px-6 py-7 shadow-[0_24px_70px_rgba(58,53,48,0.16)] transition-transform duration-300 md:hidden',
          menuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col gap-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-2xl border border-border bg-white/70 px-4 py-3 text-base font-medium transition-colors hover:text-chakra-crown',
                  isActive ? 'text-text-primary' : 'text-text-secondary',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              setCartOpen(true)
              setMenuOpen(false)
            }}
            className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-left text-base font-medium text-text-secondary transition-colors hover:text-chakra-solar"
          >
            购物车 · {totalItems}
          </button>
        </nav>
      </aside>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <CartToast />
    </header>
  )
}
