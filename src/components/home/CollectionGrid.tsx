import { Link } from 'react-router-dom'
import { Circle, Moon, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { collections, type Collection } from '../../data/collections'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { Badge } from '../ui/Badge'
import { ChakraCard } from '../ui/ChakraCard'
import { Section } from '../ui/Section'
import { cn } from '../../utils/cn'
import { getChakraHex } from '../ui/chakra'

const collectionIcons: Record<string, LucideIcon> = {
  zodiac: Sparkles,
  chakra: Circle,
  lunar: Moon,
}

function CollectionCard({
  collection,
  index,
}: {
  collection: Collection
  index: number
}) {
  const revealRef = useScrollReveal<HTMLDivElement>({
    from: 'bottom',
    delay: index * 0.15,
  })
  const Icon = collectionIcons[collection.id] ?? Sparkles

  return (
    <div ref={revealRef}>
      <ChakraCard chakraColor={collection.chakraColor} className="h-full">
        <div
          className="overflow-hidden rounded-[12px]"
          style={{ background: collection.gradient }}
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-[12px]">
            <img
              src={collection.image}
              alt={collection.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: collection.gradient }}
            >
              <span
                className="flex h-20 w-20 items-center justify-center rounded-full border border-white/70 bg-white/30 text-white backdrop-blur-sm"
                style={{
                  color: getChakraHex(collection.chakraColor),
                  boxShadow: `0 18px 40px ${getChakraHex(collection.chakraColor)}22`,
                }}
              >
                <Icon size={50} strokeWidth={1.6} />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Badge variant={collection.chakraColor}>{collection.chakraName}</Badge>
          <h3 className="text-2xl text-text-primary">{collection.name}</h3>
          <p className="text-xs uppercase tracking-wider text-text-muted">
            {collection.subtitle}
          </p>
          <p className="line-clamp-2 text-sm text-text-secondary">
            {collection.description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 text-sm">
          <span className="text-text-secondary">共 {collection.itemCount} 件</span>
          <Link
            to="/collections"
            className={cn('font-medium transition-colors hover:opacity-80')}
            style={{ color: getChakraHex(collection.chakraColor) }}
          >
            探索系列 →
          </Link>
        </div>
      </ChakraCard>
    </div>
  )
}

export function CollectionGrid() {
  return (
    <Section
      title="三大系列，三种能量路径"
      subtitle="星座、脉轮、月相，分别对应不同的能量入口。"
      chakraAccent="crown"
    >
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection, index) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            index={index}
          />
        ))}
      </div>
    </Section>
  )
}
