import { useNavigate } from 'react-router-dom'
import { Eye, Heart, Sparkles } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { Button } from '../ui/Button'
import { ChakraCard } from '../ui/ChakraCard'
import { Section } from '../ui/Section'

export function CrystalQuiz() {
  const navigate = useNavigate()
  const revealRef = useScrollReveal<HTMLDivElement>({ from: 'bottom' })

  return (
    <Section
      title="你的专属水晶是什么？"
      subtitle="花 30 秒，让脉轮能量为你指引"
      chakraAccent="third-eye"
      tight
    >
      <div ref={revealRef}>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <ChakraCard chakraColor="crown" hoverable={false} className="h-full">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-cream text-chakra-crown">
                <Sparkles size={22} />
              </span>
              <div>
                <h3 className="text-2xl text-text-primary">选择你的星座</h3>
                <p className="mt-1 text-sm text-text-secondary">Zodiac 入口</p>
              </div>
            </div>
          </ChakraCard>

          <ChakraCard chakraColor="third-eye" hoverable={false} className="h-full">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-cream text-chakra-third-eye">
                <Eye size={22} />
              </span>
              <div>
                <h3 className="text-2xl text-text-primary">感受当下的能量</h3>
                <p className="mt-1 text-sm text-text-secondary">眉心轮引导</p>
              </div>
            </div>
          </ChakraCard>

          <ChakraCard chakraColor="heart" hoverable={false} className="h-full">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-cream text-chakra-heart">
                <Heart size={22} />
              </span>
              <div>
                <h3 className="text-2xl text-text-primary">找到你的水晶</h3>
                <p className="mt-1 text-sm text-text-secondary">心轮回应</p>
              </div>
            </div>
          </ChakraCard>
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="gold" size="lg" onClick={() => navigate('/quiz')}>
            开始水晶测试 →
          </Button>
        </div>
      </div>
    </Section>
  )
}
