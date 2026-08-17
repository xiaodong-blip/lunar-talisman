import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export function NotFoundPage() {
  usePageMeta({
    title: '页面未找到 | Lunar Talisman',
    description: '这条能量线暂时没有页面，回到 Lunar Talisman 首页继续探索。',
  })

  return (
    <section className="content-wrap px-4 pb-20 pt-32 md:px-6">
      <div className="rounded-[32px] border border-border bg-white/80 p-8">
        <h1>页面暂时不在这条能量线上。</h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          你可以回到首页，或者直接去看看系列页。
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-chakra-crown px-5 py-3 text-sm font-medium text-white"
        >
          回到首页
        </Link>
      </div>
    </section>
  )
}
