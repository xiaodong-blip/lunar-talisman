import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { ChakraCard } from '../ui/ChakraCard'
import { Section } from '../ui/Section'
import { cn } from '../../utils/cn'
import type { ChakraColorKey } from '../ui/chakra'
import { useScrollReveal } from '../../hooks/useScrollReveal'

type Testimonial = {
  quote: string
  name: string
  zodiac: string
}

const testimonials: Testimonial[] = [
  {
    quote: 'My moonstone bracelet arrived on a new moon. The ritual card felt like a gentle invitation to make space for myself.',
    name: 'Lin',
    zodiac: 'Cancer',
  },
  {
    quote: 'The amethyst pendant is even clearer in person. It has become a small reminder to slow down before sleep.',
    name: 'Mina',
    zodiac: 'Pisces',
  },
  {
    quote: 'I chose the warmest citrine bracelet. I wore it during interview week like a small, tactile button for courage.',
    name: 'Aya',
    zodiac: 'Leo',
  },
  {
    quote: 'The rose quartz piece made a thoughtful gift. It felt less like a trend and more like saying, you deserve to be cared for.',
    name: 'Nora',
    zodiac: 'Libra',
  },
  {
    quote: 'The finder suggested lapis lazuli, which matched my wish to practice clearer expression. The care notes were genuinely useful.',
    name: 'Zhou',
    zodiac: 'Sagittarius',
  },
  {
    quote: 'The full moon preparation added a lovely sense of ritual. Opening the box felt calm, complete, and considered.',
    name: 'Yvette',
    zodiac: 'Virgo',
  },
]

const chakraPalette: ChakraColorKey[] = [
  'root',
  'sacral',
  'solar',
  'heart',
  'throat',
  'third-eye',
  'crown',
]

function getVisibleCount() {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth >= 1280) return 3
  if (window.innerWidth >= 768) return 2
  return 1
}

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(getVisibleCount)
  const revealRef = useScrollReveal<HTMLDivElement>({ from: 'bottom' })

  const cardColors = useMemo(
    () =>
      testimonials.map(
        (_, index) => chakraPalette[(index * 2 + 3) % chakraPalette.length],
      ),
    [],
  )

  const maxIndex = Math.max(0, testimonials.length - visibleCount)

  useEffect(() => {
    const handleResize = () => {
      const nextVisibleCount = getVisibleCount()
      setVisibleCount(nextVisibleCount)
      setActiveIndex((current) =>
        Math.min(current, Math.max(0, testimonials.length - nextVisibleCount)),
      )
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1))
    }, 5000)

    return () => window.clearInterval(timer)
  }, [maxIndex])

  const goToPrevious = () => {
    setActiveIndex((current) => (current <= 0 ? maxIndex : current - 1))
  }

  const goToNext = () => {
    setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1))
  }

  return (
    <Section
      title="Notes from the Lunar Talisman community"
      subtitle="Small rituals, thoughtful materials, and the everyday moments people choose to mark."
      chakraAccent="solar"
      tight
    >
      <div ref={revealRef} className="relative">
        <div className="-mx-3 overflow-hidden py-2">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${activeIndex * (100 / visibleCount)}%)`,
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${testimonial.zodiac}`}
                className="shrink-0 px-3"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <ChakraCard chakraColor={cardColors[index]} className="h-full">
                  <div className="flex items-center gap-1 text-chakra-solar">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        size={17}
                        fill="currentColor"
                        strokeWidth={1.6}
                      />
                    ))}
                  </div>

                  <p className="mt-5 min-h-[132px] text-sm italic leading-7 text-text-secondary">
                    “{testimonial.quote}”
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                    <span className="font-medium text-text-primary">
                      {testimonial.name}
                    </span>
                    <Badge variant={cardColors[index]}>{testimonial.zodiac}</Badge>
                  </div>
                </ChakraCard>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={goToPrevious}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full border border-chakra-solar bg-warm-cream text-chakra-solar',
              'transition-all duration-300 hover:-translate-y-0.5 hover:bg-chakra-solar/10 hover:shadow-md',
            )}
            aria-label="View previous note"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full border border-chakra-solar bg-warm-cream text-chakra-solar',
              'transition-all duration-300 hover:-translate-y-0.5 hover:bg-chakra-solar/10 hover:shadow-md',
            )}
            aria-label="View next note"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </Section>
  )
}
