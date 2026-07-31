import { QuizFlow } from '../components/quiz/QuizFlow'
import { Section } from '../components/ui/Section'
import { EnergyParticles } from '../components/ui/EnergyParticles'
import { usePageMeta } from '../hooks/usePageMeta'

export function QuizPage() {
  usePageMeta({
    title: '水晶测试 | Lunar Talisman',
    description:
      '用三道题找到你的守护脉轮，并获得 Lunar Talisman 专属水晶饰品推荐。',
  })

  return (
    <div className="relative isolate overflow-hidden bg-warm-cream">
      <EnergyParticles count={70} className="opacity-70" />
      <div className="relative z-10">
        <Section
          title="你的专属水晶是什么？"
          subtitle="三道题，找到当下最适合你的守护脉轮与月光护符。"
          chakraAccent="third-eye"
        >
          <QuizFlow />
        </Section>
      </div>
    </div>
  )
}
