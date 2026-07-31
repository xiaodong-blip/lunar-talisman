import { Navigate, useParams } from 'react-router-dom'
import { BlogCard } from '../components/blog/BlogCard'
import { Badge } from '../components/ui/Badge'
import { Section } from '../components/ui/Section'
import { blogPosts, type BlogPost } from '../data/blog'
import { usePageMeta } from '../hooks/usePageMeta'

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

function renderMarkdown(content: string) {
  const lines = content.trim().split('\n')
  const blocks: Array<{ type: 'h2' | 'p' | 'ul'; content: string | string[] }> = []
  let paragraph: string[] = []
  let list: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'p', content: paragraph.join(' ') })
      paragraph = []
    }
  }

  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'ul', content: list })
      list = []
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flushParagraph()
      flushList()
      return
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'h2', content: trimmed.replace('## ', '') })
      return
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph()
      list.push(trimmed.replace('- ', ''))
      return
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph()
      list.push(trimmed.replace(/^\d+\.\s/, ''))
      return
    }

    flushList()
    paragraph.push(trimmed)
  })

  flushParagraph()
  flushList()

  return blocks.map((block, index) => {
    if (block.type === 'h2') {
      return (
        <h2 key={index} className="mt-9 text-3xl text-text-primary first:mt-0">
          {block.content}
        </h2>
      )
    }

    if (block.type === 'ul') {
      return (
        <ul key={index} className="mt-4 space-y-3 text-base leading-8 text-text-secondary">
          {(block.content as string[]).map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-chakra-crown" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    }

    return (
      <p key={index} className="mt-4 text-base leading-8 text-text-secondary">
        {block.content}
      </p>
    )
  })
}

function getRelatedPosts(post: BlogPost) {
  return blogPosts
    .filter((item) => item.slug !== post.slug)
    .sort((left, right) => {
      if (left.category === post.category && right.category !== post.category) return -1
      if (right.category === post.category && left.category !== post.category) return 1
      return 0
    })
    .slice(0, 3)
}

export function BlogPostPage() {
  const { slug } = useParams()
  const post = blogPosts.find((item) => item.slug === slug)

  usePageMeta({
    title: post ? `${post.title} | Lunar Talisman` : '文章未找到 | Lunar Talisman',
    description: post?.excerpt ?? '阅读 Lunar Talisman 玄学库文章。',
  })

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const relatedPosts = getRelatedPosts(post)

  return (
    <>
      <article className="content-wrap px-4 py-12 md:px-6 md:py-16">
        <div className="overflow-hidden rounded-[36px] border border-border bg-card shadow-[0_20px_60px_rgba(58,53,48,0.06)]">
          <div className="aspect-[21/9] max-h-[520px] overflow-hidden bg-warm-cream">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="mx-auto max-w-4xl px-6 py-8 md:px-10 md:py-10">
            <Badge variant={categoryBadge[post.category]}>
              {categoryLabel[post.category]}
            </Badge>
            <h1 className="mt-5 text-4xl text-text-primary md:text-6xl">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <time dateTime={post.date}>{post.date}</time>
              <span>·</span>
              <span>{post.readTime}</span>
              <span>·</span>
              <span>Lunar Talisman</span>
            </div>
            <div className="mt-8 border-t border-border pt-8">
              {renderMarkdown(post.content)}
            </div>
          </div>
        </div>
      </article>

      <Section
        title="相关阅读"
        subtitle="继续沿着相近的能量主题探索。"
        chakraAccent="throat"
        tight
      >
        <div className="grid gap-6 md:grid-cols-3">
          {relatedPosts.map((item) => (
            <BlogCard key={item.slug} post={item} />
          ))}
        </div>
      </Section>
    </>
  )
}
