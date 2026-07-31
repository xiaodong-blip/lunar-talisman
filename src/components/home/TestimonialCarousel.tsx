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
    quote: '收到月光石手链那天刚好是新月，包装里附的仪式卡很温柔，像真的给自己留了一段安静时间。',
    name: '林夕',
    zodiac: '巨蟹座',
  },
  {
    quote: '紫水晶吊坠比照片更透，戴上之后会下意识提醒自己慢下来，睡前冥想也更容易进入状态。',
    name: 'Mina',
    zodiac: '双鱼座',
  },
  {
    quote: '我选的是太阳轮黄水晶，颜色很暖，不夸张但有存在感。面试那周每天都戴，像一个小小的勇气按钮。',
    name: '阿遥',
    zodiac: '狮子座',
  },
  {
    quote: '心轮系列的玫瑰晶很适合送朋友。她说不是那种商业化的礼物，更像是一句“你值得被照顾”。',
    name: 'Nora',
    zodiac: '天秤座',
  },
  {
    quote: '测试结果推荐了青金石，刚好对应我最近想练习表达。玄学库里的佩戴建议也很实用。',
    name: '周周',
    zodiac: '射手座',
  },
  {
    quote: '满月加持批次的仪式感很戳我，打开盒子时有淡淡香气，整体体验非常完整。',
    name: 'Yvette',
    zodiac: '处女座',
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
      title="来自月光社群的声音"
      subtitle="真实的佩戴体验、仪式反馈和一点点被月光接住的日常。"
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
            aria-label="查看上一条评价"
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
            aria-label="查看下一条评价"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </Section>
  )
}
