import { Droplets, Sparkles, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { ChakraCard } from '../ui/ChakraCard'
import { Section } from '../ui/Section'
import { getChakraHex, type ChakraColorKey } from '../ui/chakra'

type RitualStep = {
  number: string
  title: string
  description: string
  chakraColor: ChakraColorKey
  icon: LucideIcon
  revealFrom: 'left' | 'bottom' | 'right'
}

const ritualSteps: RitualStep[] = [
  {
    number: '01',
    title: 'Cleanse',
    description: 'Place your crystal in moonlight, or choose another mineral-safe care method such as a soft cloth or sound.',
    chakraColor: 'heart',
    icon: Droplets,
    revealFrom: 'left',
  },
  {
    number: '02',
    title: 'Set an intention',
    description: 'Hold the stone in both hands and name the quality you want to keep close during the day.',
    chakraColor: 'solar',
    icon: Zap,
    revealFrom: 'bottom',
  },
  {
    number: '03',
    title: 'Wear and notice',
    description: 'Wear the piece comfortably and let it become a tactile reminder for your own reflective ritual.',
    chakraColor: 'crown',
    icon: Sparkles,
    revealFrom: 'right',
  },
]

function DashedArrow({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 42"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 22C42 2 86 2 134 22C146 27 157 30 170 29"
        stroke={getChakraHex('solar')}
        strokeWidth="2"
        strokeDasharray="7 8"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M160 17L173 29L157 36"
        stroke={getChakraHex('solar')}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  )
}

function RitualStepCard({ step, index }: { step: RitualStep; index: number }) {
  const revealRef = useScrollReveal<HTMLDivElement>({
    from: step.revealFrom,
    delay: index * 0.2,
  })
  const Icon = step.icon
  const color = getChakraHex(step.chakraColor)

  return (
    <div ref={revealRef}>
      <ChakraCard chakraColor={step.chakraColor} className="h-full">
        <div className="relative min-h-[210px]">
          <span
            className="pointer-events-none absolute -right-1 -top-3 font-serif text-[60px] leading-none opacity-20"
            style={{ color }}
            aria-hidden="true"
          >
            {step.number}
          </span>

          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-warm-cream"
            style={{ color }}
          >
            <Icon size={40} strokeWidth={1.55} />
          </span>

          <h3 className="mt-8 text-xl text-text-primary">{step.title}</h3>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            {step.description}
          </p>
        </div>
      </ChakraCard>
    </div>
  )
}

export function RitualGuide() {
  return (
    <Section
      title="A simple crystal ritual"
      subtitle="Cleanse, set an intention, and wear your piece as a quiet daily reminder."
      chakraAccent="heart"
    >
      <div className="relative">
        <DashedArrow className="pointer-events-none absolute left-[29.5%] top-1/2 z-0 hidden h-12 w-[10%] -translate-y-1/2 lg:block" />
        <DashedArrow className="pointer-events-none absolute left-[63%] top-1/2 z-0 hidden h-12 w-[10%] -translate-y-1/2 lg:block" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-3">
          {ritualSteps.map((step, index) => (
            <RitualStepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </Section>
  )
}
