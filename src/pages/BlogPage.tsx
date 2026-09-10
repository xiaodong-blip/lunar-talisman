import { useState } from 'react'
import { BlogCard } from '../components/blog/BlogCard'
import { Section } from '../components/ui/Section'
import { blogPosts, type BlogCategory } from '../data/blog'
import { usePageMeta } from '../hooks/usePageMeta'
import { cn } from '../utils/cn'

type CategoryFilter = 'all' | BlogCategory

const filters: Array<{
  id: CategoryFilter
  label: string
  hover: string
  active: string
}> = [
  { id: 'all', label: 'All guides', hover: 'hover:text-chakra-crown', active: 'border-chakra-crown bg-chakra-crown/10 text-chakra-crown' },
  { id: 'zodiac', label: 'Astrology', hover: 'hover:text-chakra-crown', active: 'border-chakra-crown bg-chakra-crown/10 text-chakra-crown' },
  { id: 'chakra', label: 'Energy traditions', hover: 'hover:text-chakra-heart', active: 'border-chakra-heart bg-chakra-heart/10 text-chakra-heart' },
  { id: 'lunar', label: 'Lunar rituals', hover: 'hover:text-chakra-solar', active: 'border-chakra-solar bg-chakra-solar/10 text-chakra-solar' },
  { id: 'crystal', label: 'Crystal care', hover: 'hover:text-chakra-third-eye', active: 'border-chakra-third-eye bg-chakra-third-eye/10 text-chakra-third-eye' },
]

export function BlogPage() {
  usePageMeta({
    title: 'Crystal Guides | Lunar Talisman',
    description:
      'Read practical crystal guides on meanings, care, lunar rituals, and reflective traditions for everyday wear.',
  })

  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all')
  const filteredPosts =
    activeFilter === 'all'
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeFilter)

  return (
    <Section
      title="Crystal guides"
      subtitle="Explore crystal meanings, care, lunar rituals, and reflective traditions for everyday wear."
      chakraAccent="throat"
    >
      <div className="mb-8 flex flex-wrap gap-3">
        {filters.map((filter) => {
          const active = filter.id === activeFilter

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-all duration-300',
                filter.hover,
                active && filter.active,
              )}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </Section>
  )
}
