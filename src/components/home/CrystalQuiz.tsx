import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Eye, Heart, Sparkles } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { Button } from '../ui/Button'
import { ChakraCard } from '../ui/ChakraCard'
import { Section } from '../ui/Section'

function QuizPreviewCard({
  index,
  children,
}: {
  index: number
  children: ReactNode
}) {
  const revealRef = useScrollReveal<HTMLDivElement>({
    from: 'bottom',
    delay: index * 0.15,
  })

  return <div ref={revealRef}>{children}</div>
}

export function CrystalQuiz() {
  const navigate = useNavigate()

  return (
    <Section
      title="Find the crystal that fits your intention"
      subtitle="Three quiet prompts to guide your next crystal ritual"
      chakraAccent="third-eye"
      tight
    >
      <div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <QuizPreviewCard index={0}>
          <ChakraCard chakraColor="crown" hoverable={false} className="h-full">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-cream text-chakra-crown">
                <Sparkles size={22} />
              </span>
              <div>
                <h3 className="text-2xl text-text-primary">Name your intention</h3>
                <p className="mt-1 text-sm text-text-secondary">Start with what you want to support</p>
              </div>
            </div>
          </ChakraCard>
          </QuizPreviewCard>

          <QuizPreviewCard index={1}>
          <ChakraCard chakraColor="third-eye" hoverable={false} className="h-full">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-cream text-chakra-third-eye">
                <Eye size={22} />
              </span>
              <div>
                <h3 className="text-2xl text-text-primary">Notice your current rhythm</h3>
                <p className="mt-1 text-sm text-text-secondary">A reflective crystal prompt</p>
              </div>
            </div>
          </ChakraCard>
          </QuizPreviewCard>

          <QuizPreviewCard index={2}>
          <ChakraCard chakraColor="heart" hoverable={false} className="h-full">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-cream text-chakra-heart">
                <Heart size={22} />
              </span>
              <div>
                <h3 className="text-2xl text-text-primary">Meet your crystal</h3>
                <p className="mt-1 text-sm text-text-secondary">A piece to carry into daily life</p>
              </div>
            </div>
          </ChakraCard>
          </QuizPreviewCard>
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="gold" size="lg" onClick={() => navigate('/quiz')}>
            Start the crystal finder →
          </Button>
        </div>
      </div>
    </Section>
  )
}
