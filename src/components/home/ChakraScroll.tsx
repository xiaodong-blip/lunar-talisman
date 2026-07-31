import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Droplets,
  Eye,
  Heart,
  MessageCircle,
  Mountain,
  Sparkles,
  Sun,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'
import { chakras } from '../../data/chakras'
import { hexToRgba, type ChakraColorKey } from '../ui/chakra'

gsap.registerPlugin(ScrollTrigger)

const chakraIcons: Record<string, LucideIcon> = {
  root: Mountain,
  sacral: Droplets,
  solar: Sun,
  heart: Heart,
  throat: MessageCircle,
  'third-eye': Eye,
  crown: Sparkles,
}

export function ChakraScroll() {
  const sectionRefs = useRef<Array<HTMLElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const chakraSections = useMemo(
    () => chakras.map((chakra, index) => ({ chakra, index })),
    [],
  )

  useEffect(() => {
    const timelines: gsap.core.Timeline[] = []
    const ctx = gsap.context(() => {
      chakraSections.forEach(({ index }) => {
        const section = sectionRefs.current[index]
        if (!section) return

        const numberEl = section.querySelector<HTMLElement>('[data-chakra-number]')
        const contentEl = section.querySelector<HTMLElement>('[data-chakra-content]')
        const iconEl = section.querySelector<HTMLElement>('[data-chakra-icon]')
        const metaEl = section.querySelector<HTMLElement>('[data-chakra-meta]')
        const crystalsEl = section.querySelector<HTMLElement>('[data-chakra-crystals]')

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 65%',
            end: 'bottom 35%',
            scrub: 0.5,
            onEnter: () => setActiveIndex(index),
            onEnterBack: () => setActiveIndex(index),
            onToggle: (self) => {
              if (self.isActive) {
                setActiveIndex(index)
              }
            },
          },
        })

        timelines.push(timeline)

        timeline
          .fromTo(
            numberEl,
            { x: -28, scale: 0.86, opacity: 0.2 },
            { x: 0, scale: 1, opacity: 1, ease: 'none', duration: 1 },
            0,
          )
          .fromTo(
            contentEl,
            { y: 42, opacity: 0.25 },
            { y: 0, opacity: 1, ease: 'none', duration: 1 },
            0.06,
          )
          .fromTo(
            iconEl,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, ease: 'none', duration: 0.8 },
            0.12,
          )
          .fromTo(
            metaEl,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, ease: 'none', duration: 0.75 },
            0.18,
          )
          .fromTo(
            crystalsEl,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, ease: 'none', duration: 0.75 },
            0.24,
          )
      })
    })

    const onResize = () => {
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      timelines.forEach((timeline) => timeline.kill())
      ctx.revert()
    }
  }, [chakraSections])

  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index]
    if (!section) return
    setActiveIndex(index)
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative isolate bg-warm-cream">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px chakra-gradient opacity-80" />

      {chakraSections.map(({ chakra, index }) => {
        const Icon = chakraIcons[chakra.id] ?? Sparkles
        const sectionNumber = String(index + 1).padStart(2, '0')

        return (
          <section
            key={chakra.id}
            ref={(node) => {
              sectionRefs.current[index] = node
            }}
            className="relative min-h-[80vh] overflow-hidden border-b border-border/70 md:min-h-screen"
            style={
              {
                '--chakra-scroll-color': chakra.hex,
                '--chakra-scroll-soft': hexToRgba(chakra.hex, 0.16),
                '--chakra-scroll-fade': hexToRgba(chakra.hex, 0.08),
              } as CSSProperties
            }
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70"
              style={{
                background: `linear-gradient(180deg, var(--chakra-scroll-soft) 0%, transparent 100%)`,
              }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-70"
              style={{
                background: `linear-gradient(0deg, var(--chakra-scroll-soft) 0%, transparent 100%)`,
              }}
            />

            <div className="content-wrap flex min-h-[80vh] items-center px-4 py-16 md:min-h-screen md:px-6">
              <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-center">
                <div
                  data-chakra-number
                  className="order-1 flex items-start gap-4 lg:pr-8"
                >
                  <span
                    className="font-serif text-[88px] leading-none md:text-[120px] lg:text-[148px]"
                    style={{
                      color: chakra.hex,
                      opacity: 0.72,
                      textShadow: `0 14px 36px ${hexToRgba(chakra.hex, 0.14)}`,
                    }}
                  >
                    {sectionNumber}
                  </span>
                  <div className="mt-5">
                    <p className="text-sm uppercase tracking-[0.32em] text-text-muted">
                      {chakra.sanskrit}
                    </p>
                    <h2 className="mt-3 text-3xl text-text-primary md:text-4xl">
                      {chakra.name}
                    </h2>
                    <p className="mt-2 text-base text-text-secondary">
                      {chakra.nameEn}
                    </p>
                  </div>
                </div>

                <div
                  data-chakra-content
                  className={cn(
                    'order-2 rounded-[32px] border border-border/80 bg-card/95 p-6 shadow-[0_20px_50px_rgba(58,53,48,0.05)] md:p-8',
                    'lg:ml-auto lg:max-w-[680px]',
                  )}
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                    <div
                      data-chakra-icon
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-border bg-white md:h-24 md:w-24"
                      style={{
                        color: chakra.hex,
                        boxShadow: `0 10px 30px ${hexToRgba(chakra.hex, 0.16)}`,
                      }}
                    >
                      <Icon size={44} strokeWidth={1.7} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="text-lg italic text-text-secondary md:text-xl"
                        style={{ color: '#9B9286' }}
                      >
                        {chakra.affirmation}
                      </p>

                      <div
                        data-chakra-meta
                        className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-secondary"
                      >
                        <span>对应元素：{chakra.element}</span>
                        <span className="hidden h-1 w-1 rounded-full bg-text-muted md:inline-flex" />
                        <span>位置：{chakra.location}</span>
                      </div>

                      <div data-chakra-crystals className="mt-6 flex flex-wrap gap-2">
                        {chakra.crystals.map((crystal) => (
                          <Badge
                            key={crystal}
                          variant={chakra.id as ChakraColorKey}
                          className="whitespace-nowrap"
                        >
                            {crystal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      })}

      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 shadow-[0_10px_30px_rgba(58,53,48,0.08)] lg:hidden">
        {chakraSections.map(({ chakra, index }) => {
          const isActive = index === activeIndex

          return (
            <button
              key={chakra.id}
              type="button"
              onClick={() => scrollToSection(index)}
              aria-label={`跳转到 ${chakra.name}`}
              className="flex items-center justify-center rounded-full p-1"
            >
              <span
                className={cn(
                  'block rounded-full transition-all duration-300',
                  isActive ? 'h-3 w-3 shadow-[0_0_0_6px_rgba(255,255,255,0.95)]' : 'h-2 w-2',
                )}
                style={{
                  backgroundColor: chakra.hex,
                  boxShadow: isActive ? `0 0 16px ${hexToRgba(chakra.hex, 0.5)}` : 'none',
                }}
              />
            </button>
          )
        })}
      </div>

      <aside className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex">
        <div className="flex flex-col items-end gap-3 rounded-full border border-border bg-card/90 px-3 py-4 shadow-[0_10px_30px_rgba(58,53,48,0.08)] backdrop-blur-md">
          {chakraSections.map(({ chakra, index }) => {
            const isActive = index === activeIndex

            return (
              <button
                key={chakra.id}
                type="button"
                onClick={() => scrollToSection(index)}
                aria-label={`跳转到 ${chakra.name}`}
                className="group flex items-center gap-3"
              >
                <span
                  className={cn(
                    'block rounded-full transition-all duration-300',
                    isActive ? 'h-3 w-3 scale-125' : 'h-2.5 w-2.5 opacity-80',
                  )}
                  style={{
                    backgroundColor: chakra.hex,
                    boxShadow: isActive
                      ? `0 0 0 6px ${hexToRgba(chakra.hex, 0.12)}, 0 0 18px ${hexToRgba(chakra.hex, 0.42)}`
                      : 'none',
                  }}
                />
                <span
                  className={cn(
                    'origin-right whitespace-nowrap text-xs font-medium transition-all duration-300',
                    isActive
                      ? 'translate-x-0 opacity-100 text-text-primary'
                      : 'translate-x-2 opacity-0 text-text-muted group-hover:translate-x-0 group-hover:opacity-100',
                  )}
                >
                  {chakra.name}
                </span>
              </button>
            )
          })}
        </div>
      </aside>
    </section>
  )
}
