import { PageIntro } from '../components/ui/PageIntro'
import { ProductCard } from '../components/product/ProductCard'
import { collections } from '../data/site'
import { products } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'

export function CollectionPage() {
  usePageMeta({
    title: '水晶系列 | Lunar Talisman',
    description:
      '探索 Lunar Talisman 星座守护、脉轮疗愈与月相仪式三大水晶饰品系列。',
  })

  return (
    <>
      <PageIntro
        eyebrow="Collections"
        title="系列像是不同能量入口，选哪条都能抵达你自己。"
        description="Zodiac 更轻灵，Chakra 更疗愈，Lunar 更仪式感。每个系列都保留七脉轮的温柔高光。"
        accentClass="text-chakra-solar"
      />

      <section className="content-wrap px-4 pb-16 md:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.id}
              className="rounded-[28px] border border-border bg-white/80 p-6"
            >
              <p className="text-sm uppercase tracking-[0.25em] text-text-muted">
                {collection.subtitle}
              </p>
              <h2 className="mt-4 text-3xl">{collection.title}</h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                {collection.description}
              </p>
              <div className="mt-6 h-1.5 w-20 rounded-full chakra-gradient" />
            </article>
          ))}
        </div>
      </section>

      <section className="content-wrap px-4 pb-20 md:px-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}
