import { Link } from 'react-router-dom'
import type { BlogPost } from '../../data/blog'
import { Badge } from '../ui/Badge'

type BlogCardProps = {
  post: BlogPost
}

const categoryBadge = {
  zodiac: 'crown',
  chakra: 'heart',
  lunar: 'solar',
  crystal: 'third-eye',
} as const

const categoryLabel = {
  zodiac: '星座',
  chakra: '脉轮',
  lunar: '月相',
  crystal: '水晶',
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_16px_44px_rgba(58,53,48,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_56px_rgba(58,53,48,0.08)]">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="aspect-[16/10] overflow-hidden bg-warm-cream">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-6">
        <Badge variant={categoryBadge[post.category]}>{categoryLabel[post.category]}</Badge>
        <Link to={`/blog/${post.slug}`} className="mt-4 block">
          <h2 className="text-xl text-text-primary transition-colors hover:text-chakra-crown">
            {post.title}
          </h2>
        </Link>
        <p className="line-clamp-2 mt-3 text-sm leading-7 text-text-secondary">
          {post.excerpt}
        </p>
        <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-text-muted">
          <time dateTime={post.date}>{post.date}</time>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </article>
  )
}
