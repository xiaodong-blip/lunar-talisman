import { QuizFlow } from '../components/quiz/QuizFlow'
import { Section } from '../components/ui/Section'
import { EnergyParticles } from '../components/ui/EnergyParticles'
import { usePageMeta } from '../hooks/usePageMeta'

export function QuizPage() {
  usePageMeta({
    title: 'Crystal Intention Finder | Lunar Talisman',
    description:
      'Use three reflective prompts to find a healing crystal and jewelry ritual that fits your current intention.',
  })

  return (
    <div className="relative isolate overflow-hidden bg-warm-cream">
      <EnergyParticles count={70} className="opacity-70" />
      <div className="relative z-10">
        <Section
          title="Find your crystal intention"
          subtitle="Three prompts to choose a natural-stone companion for everyday wear."
          chakraAccent="third-eye"
        >
          <QuizFlow />
        </Section>
      </div>
    </div>
  )
}
