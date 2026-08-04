import { Navigate, useParams } from 'react-router-dom'
import { ProductHero } from '../components/product/ProductHero'
import { EnergySpec } from '../components/product/EnergySpec'
import { RitualCard } from '../components/product/RitualCard'
import { ProductCard } from '../components/product/ProductCard'
import { CinematicMotionBackground } from '../components/ui/CinematicMotionBackground'
import { products } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'

export function ProductPage() {
  const { id } = useParams()
  const product = products.find((item) => item.id === id)

  usePageMeta({
    title: product ? `${product.name} | Lunar Talisman` : '产品未找到 | Lunar Talisman',
    description: product?.description ?? '探索 Lunar Talisman 七脉轮水晶护符。',
  })

  if (!product) {
    return <Navigate to="/collections" replace />
  }

  const recommendedProducts = products
    .filter((item) => item.collection === product.collection && item.id !== product.id)
    .concat(products.filter((item) => item.collection !== product.collection))
    .slice(0, 4)

  return (
    <div className="relative isolate overflow-hidden bg-black text-white">
      <CinematicMotionBackground />

      <div className="relative z-10">
        <ProductHero product={product} />

        <div className="[&_.chakra-card]:bg-white/[0.88] [&_.chakra-card]:shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
          <EnergySpec product={product} />
          <RitualCard product={product} />
        </div>

        <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <header className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-white/45">
              Resonant Picks
            </p>
            <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">
              相关推荐
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
              同系列与相邻能量场的护符，可以一起形成更完整的佩戴组合。
            </p>
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {recommendedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
