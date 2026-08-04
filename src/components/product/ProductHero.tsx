import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Moon, ShoppingBag, Star } from 'lucide-react'
import type { Group, Mesh } from 'three'
import type { CrystalProduct } from '../../data/products'
import { chakras } from '../../data/chakras'
import { useCart } from '../../hooks/useCart'
import { formatCny } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { getChakraHex, hexToRgba, type ChakraColorKey } from '../ui/chakra'

type ProductHeroProps = {
  product: CrystalProduct
}

const collectionMeta: Record<
  CrystalProduct['collection'],
  { label: string; badge: ChakraColorKey }
> = {
  zodiac: { label: '星座守护', badge: 'crown' },
  chakra: { label: '脉轮疗愈', badge: 'heart' },
  lunar: { label: '月相仪式', badge: 'solar' },
}

function CrystalModel({ color }: { color: string }) {
  const crystalRef = useRef<Mesh | null>(null)
  const ringRef = useRef<Group | null>(null)

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.35
      crystalRef.current.rotation.x = Math.sin(Date.now() / 1400) * 0.08
    }

    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.16
      ringRef.current.rotation.z -= delta * 0.12
    }
  })

  return (
    <group>
      <mesh ref={crystalRef} rotation={[0.34, 0.1, 0.22]}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.1}
          clearcoat={0.4}
          transmission={0.12}
          transparent
          opacity={0.92}
        />
      </mesh>

      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.25, 0.018, 16, 128]} />
          <meshBasicMaterial color={color} transparent opacity={0.42} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, Math.PI / 6, Math.PI / 10]}>
          <torusGeometry args={[1.85, 0.012, 16, 96]} />
          <meshBasicMaterial color={color} transparent opacity={0.24} />
        </mesh>
      </group>
    </group>
  )
}

function ProductCrystalScene({ color }: { color: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 5.6], fov: 42 }} dpr={[1, 1.5]}>
      <ambientLight color="#FFF5E8" intensity={1.6} />
      <directionalLight position={[3, 4, 5]} color="#FFFBF0" intensity={2.2} />
      <pointLight position={[0, 2.6, 2.4]} color={color} intensity={3} />
      <CrystalModel color={color} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(Math.PI * 2) / 3}
      />
    </Canvas>
  )
}

function ProductRating({
  rating,
  reviewCount,
}: {
  rating: number
  reviewCount: number
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      <div className="flex items-center gap-0.5 text-chakra-solar">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={16}
            fill={index < Math.round(rating) ? 'currentColor' : 'none'}
            strokeWidth={1.6}
          />
        ))}
      </div>
      <span>
        {rating.toFixed(1)} · {reviewCount} 条评价
      </span>
    </div>
  )
}

export function ProductHero({ product }: ProductHeroProps) {
  const { addToCart } = useCart()
  const primaryChakra = useMemo(
    () => chakras.find((chakra) => chakra.id === product.primaryChakra),
    [product.primaryChakra],
  )
  const secondaryChakra = useMemo(
    () => chakras.find((chakra) => chakra.id === product.secondaryChakra),
    [product.secondaryChakra],
  )
  const chakraColor = primaryChakra?.hex ?? getChakraHex(product.primaryChakra)
  const collection = collectionMeta[product.collection]

  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    <section className="content-wrap px-4 py-12 md:px-6 md:py-16">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="rounded-[36px] border border-white/15 bg-white/[0.08] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl md:p-6">
          <div
            className="relative h-[420px] overflow-hidden rounded-[30px] border border-white/15 bg-black/40 md:h-[520px]"
            style={{
              background: `radial-gradient(circle at 50% 18%, ${hexToRgba(chakraColor, 0.28)}, rgba(3,5,15,0.82) 48%, rgba(0,0,0,0.95) 100%)`,
            }}
          >
            <ProductCrystalScene color={chakraColor} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => {
              const image = product.images[index]

              return (
                <div
                  key={index}
                  className="h-20 overflow-hidden rounded-2xl border border-white/15 bg-white/10"
                  style={{
                    backgroundColor: image ? undefined : hexToRgba(chakraColor, 0.18),
                  }}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={`${product.name} 缩略图 ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(135deg, ${hexToRgba(chakraColor, 0.28)}, rgba(255,255,255,0.18))`,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-[36px] border border-white/15 bg-white/[0.9] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-8">
          <Badge variant={collection.badge}>{collection.label}</Badge>

          <div className="mt-5">
            <h1 className="text-3xl text-text-primary md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-sm uppercase tracking-[0.22em] text-text-muted">
              {product.subtitle}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-semibold leading-none text-chakra-solar">
              {formatCny(product.price)}
            </span>
            {product.originalPrice ? (
              <span className="text-lg text-text-muted line-through">
                {formatCny(product.originalPrice)}
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          <p className="mt-6 text-base leading-relaxed text-text-secondary">
            {product.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {primaryChakra ? (
              <Badge variant={product.primaryChakra}>{primaryChakra.name}</Badge>
            ) : null}
            {secondaryChakra && product.secondaryChakra ? (
              <Badge variant={product.secondaryChakra}>{secondaryChakra.name}</Badge>
            ) : null}
            <Badge variant="gold">{product.element}</Badge>
            <Badge variant={product.primaryChakra}>{product.crystalType}</Badge>
          </div>

          {product.moonCharged ? (
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-chakra-solar/25 bg-chakra-solar/10 px-4 py-3 text-sm font-medium text-chakra-solar">
              <Moon size={18} fill="currentColor" strokeWidth={1.4} />
              此款已由满月光辉加持
            </div>
          ) : null}

          <Button
            variant="gold"
            size="lg"
            className="mt-7 w-full"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingBag size={18} />
            加入购物车
          </Button>

          <p className="mt-3 text-center text-sm text-text-muted">
            {product.inStock ? '仅剩限量批次' : '暂时售罄，等待下一轮月相补货'}
          </p>
        </div>
      </div>
    </section>
  )
}
