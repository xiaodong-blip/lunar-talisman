import { Link } from 'react-router-dom'
import { ShoppingBag, Star } from 'lucide-react'
import type { CrystalProduct } from '../../data/products'
import { useCart } from '../../hooks/useCart'
import { formatCny } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ChakraCard } from '../ui/ChakraCard'
import { getChakraHex, hexToRgba } from '../ui/chakra'

type ProductCardProps = {
  product: CrystalProduct
}

const collectionBadge = {
  zodiac: 'crown',
  chakra: 'heart',
  lunar: 'solar',
} as const

const collectionLabel = {
  zodiac: '星座守护',
  chakra: '脉轮疗愈',
  lunar: '月相仪式',
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const color = getChakraHex(product.primaryChakra)

  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    <ChakraCard
      chakraColor={product.primaryChakra}
      className="h-full bg-white/90 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-white/20 bg-warm-cream"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(color, 0.18)}, rgba(255,255,255,0.86))`,
          }}
        >
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          ) : null}
        </div>
      </Link>

      <div className="mt-5 space-y-3">
        <Badge variant={collectionBadge[product.collection]}>
          {collectionLabel[product.collection]}
        </Badge>
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-2xl text-text-primary transition-colors hover:text-chakra-crown">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
          {product.subtitle}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
        <Star size={15} className="text-chakra-solar" fill="currentColor" />
        <span>
          {product.rating.toFixed(1)} · {product.reviewCount} 条评价
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-lg font-semibold text-text-primary">
          {formatCny(product.price)}
        </span>
        <Button variant="ghost" size="sm" onClick={handleAddToCart}>
          <ShoppingBag size={16} />
          加购
        </Button>
      </div>
    </ChakraCard>
  )
}
