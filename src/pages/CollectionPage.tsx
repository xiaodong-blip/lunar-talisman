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
    title: 'Healing Crystal Collections | Lunar Talisman',
    description:
      'Explore Lunar Talisman healing crystal jewelry, gemstone bracelets, lunar rituals, and intention-led collections.',
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
              Choose a crystal path that feels like your own.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/64 md:text-lg">
              Browse natural-stone jewelry by color, texture, ritual rhythm, and the intention you want to keep close.
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
                      <span className="text-white/45">{collection.itemCount} pieces</span>
                      <span style={{ color }}>Explore collection →</span>
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
              All healing crystal jewelry
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
              Compare natural stones, gemstone bracelets, and ritual pieces by material and meaning.
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
