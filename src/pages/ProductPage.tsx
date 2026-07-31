import { Navigate, useParams } from 'react-router-dom'
import { ProductHero } from '../components/product/ProductHero'
import { EnergySpec } from '../components/product/EnergySpec'
import { RitualCard } from '../components/product/RitualCard'
import { ProductCard } from '../components/product/ProductCard'
import { Section } from '../components/ui/Section'
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
    <>
      <ProductHero product={product} />
      <EnergySpec product={product} />
      <RitualCard product={product} />

      <Section
        title="相关推荐"
        subtitle="同系列与相邻能量场的护符，可以一起形成更完整的佩戴组合。"
        chakraAccent={product.primaryChakra}
        tight
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {recommendedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </Section>
    </>
  )
}
