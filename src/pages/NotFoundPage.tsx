import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export function NotFoundPage() {
  usePageMeta({
    title: 'Page not found | Lunar Talisman',
    description: 'This page is unavailable. Return to Lunar Talisman to explore healing crystal jewelry.',
  })

  return (
    <section className="content-wrap px-4 pb-20 pt-32 md:px-6">
      <div className="rounded-[32px] border border-border bg-white/80 p-8">
        <h1>This page is not available.</h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          Return home or browse the healing crystal collections.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-chakra-crown px-5 py-3 text-sm font-medium text-white"
        >
          Return home
        </Link>
      </div>
    </section>
  )
}
