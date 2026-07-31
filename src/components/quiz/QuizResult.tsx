import { Link } from 'react-router-dom'
import {
  Droplets,
  Eye,
  Heart,
  MessageCircle,
  Mountain,
  ShoppingBag,
  Sparkles,
  Sun,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { QuizResult as QuizResultType } from '../../data/quiz'
import { products } from '../../data/products'
import { chakras } from '../../data/chakras'
import { useCart } from '../../hooks/useCart'
import { Button } from '../ui/Button'
import { ProductCard } from '../product/ProductCard'
import { getChakraHex, hexToRgba, type ChakraColorKey } from '../ui/chakra'

type QuizResultProps = {
  result: QuizResultType
  onRestart: () => void
}

const chakraIcons: Record<string, LucideIcon> = {
  root: Mountain,
  sacral: Droplets,
  solar: Sun,
  heart: Heart,
  throat: MessageCircle,
  'third-eye': Eye,
  crown: Sparkles,
}

export function QuizResult({ result, onRestart }: QuizResultProps) {
  const { addToCart } = useCart()
  const chakra = chakras.find((item) => item.id === result.primaryChakra) ?? chakras[6]
  const chakraKey = chakra.id as ChakraColorKey
  const chakraColor = getChakraHex(chakraKey)
  const ChakraIcon = chakraIcons[chakra.id] ?? Sparkles
  const recommendedProducts = result.productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product))

  const handleAddAll = () => {
    recommendedProducts.forEach((product) => {
      addToCart(product)
    })
  }

  return (
    <div
      className="overflow-hidden rounded-[36px] border border-border p-6 shadow-[0_20px_60px_rgba(58,53,48,0.06)] md:p-8"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(chakraColor, 0.08)}, rgba(255,251,247,0.96) 46%, var(--color-card) 100%)`,
      }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <span
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border bg-white"
          style={{
            color: chakraColor,
            boxShadow: `0 16px 42px ${hexToRgba(chakraColor, 0.18)}`,
          }}
        >
          <ChakraIcon size={40} strokeWidth={1.55} />
        </span>

        <h2 className="mt-6 text-3xl md:text-4xl" style={{ color: chakraColor }}>
          你的守护脉轮是 {chakra.name}
        </h2>
        <p className="mt-2 text-sm uppercase tracking-[0.24em] text-text-muted">
          {chakra.nameEn} · {chakra.sanskrit}
        </p>
        <p className="mt-5 text-lg italic leading-8 text-text-secondary">
          “{result.affirmation}”
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-[28px] border border-border bg-white/72 p-5">
        <h3 className="text-2xl text-text-primary">能量解读</h3>
        <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base">
          {result.reading}
        </p>
      </div>

      <div className="mt-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl text-text-primary">推荐水晶</h3>
            <p className="mt-2 text-sm text-text-secondary">
              这几件护符与你当前的脉轮频率最接近。
            </p>
          </div>
          <Link
            to="/collections"
            className="hidden text-sm font-medium text-chakra-crown transition-colors hover:text-text-primary md:inline-flex"
          >
            查看全部系列 →
          </Link>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <div className="mt-9 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-center">
        <Button variant="gold" size="lg" onClick={handleAddAll}>
          <ShoppingBag size={18} />
          加入购物车
        </Button>
        <Button variant="ghost" size="lg" onClick={onRestart}>
          重新测试
        </Button>
      </div>
    </div>
  )
}
