import { Sparkles, Circle, Moon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ProductCard } from '../components/product/ProductCard'
import { CinematicMotionBackground } from '../components/ui/CinematicMotionBackground'
import { Badge } from '../components/ui/Badge'
import { collections } from '../data/collections'
import { products } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'
import { getChakraHex } from '../components/ui/chakra'

const collectionIcons: Record<string, LucideIcon> = {
  zodiac: Sparkles,
  chakra: Circle,
  lunar: Moon,
}

export function CollectionPage() {
  usePageMeta({
    title: '水晶系列 | Lunar Talisman',
    description:
      '探索 Lunar Talisman 星座守护、脉轮疗愈与月相仪式三大水晶饰品系列。',
  })

  return (
    <div className="relative isolate overflow-hidden bg-black text-white">
      <CinematicMotionBackground />

      <div className="relative z-10">
        <section className="content-wrap px-4 pb-12 pt-28 md:px-6 md:pb-16 md:pt-32">
          <div className="max-w-4xl">
            <p className="text-sm font-medium uppercase tracking-[0.38em] text-white/45">
              Collections
            </p>
            <h1 className="mt-5 font-serif text-5xl text-white md:text-7xl">
              系列像是不同能量入口，选哪条都能抵达你自己。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/64 md:text-lg">
              Zodiac 更轻灵，Chakra 更疗愈，Lunar 更有仪式感。每个系列都以七脉轮为底层频率，再用月光质感统一成电影级视觉体验。
            </p>
          </div>
        </section>

        <section className="content-wrap px-4 pb-16 md:px-6">
          <div className="grid gap-5 lg:grid-cols-3">
            {collections.map((collection) => {
              const Icon = collectionIcons[collection.id] ?? Sparkles
              const color = getChakraHex(collection.chakraColor)

              return (
                <article
                  key={collection.id}
                  className="group overflow-hidden rounded-[30px] border border-white/15 bg-white/[0.08] shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: collection.gradient }}
                    />
                    <div
                      className="absolute left-6 top-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl"
                      style={{ color }}
                    >
                      <Icon size={30} strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="p-6">
                    <Badge variant={collection.chakraColor}>
                      {collection.chakraName}
                    </Badge>
                    <h2 className="mt-4 font-serif text-3xl text-white">
                      {collection.name}
                    </h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/42">
                      {collection.subtitle}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-white/66">
                      {collection.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between text-sm">
                      <span className="text-white/45">共 {collection.itemCount} 件</span>
                      <span style={{ color }}>探索系列 →</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="content-wrap px-4 pb-20 md:px-6">
          <header className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-white/45">
              Crystal Archive
            </p>
            <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">
              全部水晶护符
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
              在星空与月光的背景里，挑选与你当前频率共振的水晶。
            </p>
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
