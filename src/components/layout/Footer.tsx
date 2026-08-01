import type { ReactNode, SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { Button } from '../ui/Button'

const quickLinks = [
  { to: '/', label: '首页' },
  { to: '/collections', label: '系列' },
  { to: '/quiz', label: '测试' },
  { to: '/blog', label: '玄学库' },
  { to: '/about', label: '关于' },
]

const chakraGuideLinks = [
  { label: '海底轮', color: 'hover:text-chakra-root' },
  { label: '脐轮', color: 'hover:text-chakra-sacral' },
  { label: '太阳轮', color: 'hover:text-chakra-solar' },
  { label: '心轮', color: 'hover:text-chakra-heart' },
  { label: '喉轮', color: 'hover:text-chakra-throat' },
  { label: '眉心轮', color: 'hover:text-chakra-third-eye' },
  { label: '顶轮', color: 'hover:text-chakra-crown' },
]

type SocialLink = {
  label: string
  color: string
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
}

function MoonMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <path
        d="M31.6 38.7C20.9 38.7 12.3 30 12.3 19.4c0-4.5 1.5-8.6 4.1-11.8C9.3 10.5 4.3 17.5 4.3 25.8c0 10.8 8.7 19.5 19.5 19.5 7.8 0 14.5-4.6 17.6-11.2-2.9 2.9-6.3 4.6-9.8 4.6Z"
        fill="currentColor"
      />
      <circle cx="35.2" cy="12.8" r="2.8" fill="currentColor" opacity="0.55" />
      <circle cx="41" cy="22" r="1.7" fill="currentColor" opacity="0.35" />
    </svg>
  )
}

function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  )
}

function TikTokGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13.8 5v9.1a4 4 0 1 1-3.4-3.9"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.8 5c.8 2.7 2.4 4.2 5.2 4.7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PinterestGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10.4 17.4 12 9.2m-1.2 4.4c.7.7 2.2.8 3.4-.1 1.4-1 1.7-3 .7-4.3-1.1-1.5-3.6-1.8-5.1-.5-1.2 1-1.4 2.6-.7 3.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function YouTubeGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="4" y="7" width="16" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m11 10 4 2-4 2v-4Z" fill="currentColor" />
    </svg>
  )
}

const socialLinks: SocialLink[] = [
  { label: 'Instagram', color: 'hover:text-chakra-root', Icon: InstagramGlyph },
  { label: 'TikTok', color: 'hover:text-chakra-sacral', Icon: TikTokGlyph },
  { label: 'Pinterest', color: 'hover:text-chakra-solar', Icon: PinterestGlyph },
  { label: 'YouTube', color: 'hover:text-chakra-heart', Icon: YouTubeGlyph },
]

function FooterColumn({
  children,
  delay,
}: {
  children: ReactNode
  delay: number
}) {
  const revealRef = useScrollReveal<HTMLDivElement>({ from: 'bottom', delay })

  return <div ref={revealRef}>{children}</div>
}

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border bg-card">
      <div className="pointer-events-none absolute inset-x-0 top-[3px] h-24 bg-gradient-to-b from-warm-cream/80 to-card/0" />
      <div className="chakra-gradient h-[3px] w-full" />

      <div className="content-wrap relative z-10 px-4 py-12 md:px-6 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <FooterColumn delay={0}>
            <div className="flex items-center gap-3">
              <MoonMark className="h-9 w-9 text-chakra-crown" />
              <h4 className="font-serif text-xl text-text-primary">
                Lunar Talisman
              </h4>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-text-secondary">
              以月光为引，唤醒你的七脉轮能量
            </p>
          </FooterColumn>

          <FooterColumn delay={0.15}>
            <h4 className="text-xl text-text-primary">快速链接</h4>
            <ul className="mt-4 space-y-3 text-sm text-text-secondary">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="transition-colors duration-300 hover:text-chakra-crown"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn delay={0.3}>
            <h4 className="text-xl text-text-primary">脉轮指南</h4>
            <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm text-text-secondary xl:grid-cols-1">
              {chakraGuideLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href="#"
                    className={`transition-colors duration-300 ${item.color}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn delay={0.45}>
            <h4 className="text-xl text-text-primary">Newsletter</h4>
            <p className="mt-4 text-sm leading-7 text-text-secondary">
              订阅接收满月仪式指南
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="min-w-0 flex-1 rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-chakra-crown"
              />
              <Button type="submit" variant="primary" size="sm">
                订阅
              </Button>
            </form>
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-text-muted">
            @ 2026 Lunar Talisman. Crafted under moonlight.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ Icon, color, label }) => (
              <a
                key={label}
                href="#"
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-md ${color}`}
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
