import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowLeft } from 'lucide-react'
import { calculateResult, quizQuestions } from '../../data/quiz'
import { Button } from '../ui/Button'
import { getChakraHex, hexToRgba } from '../ui/chakra'
import { cn } from '../../utils/cn'
import { QuizResult } from './QuizResult'
import { QuizStep } from './QuizStep'
import { accentToChakraKey } from './quizUtils'

type AnswerState = {
  optionId: string
  chakraMapping: string[]
}

export function QuizFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Array<AnswerState | undefined>>([])
  const [direction, setDirection] = useState<1 | -1>(1)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const result = useMemo(
    () =>
      currentStep >= quizQuestions.length
        ? calculateResult(
            answers
              .slice(0, quizQuestions.length)
              .map((answer) => answer?.chakraMapping ?? []),
          )
        : null,
    [answers, currentStep],
  )

  useLayoutEffect(() => {
    if (!panelRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { x: direction * 26, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
      )
    }, panelRef)

    return () => ctx.revert()
  }, [currentStep, direction])

  const handleSelect = (optionId: string, chakraMapping: string[]) => {
    setAnswers((current) => {
      const next = [...current]
      next[currentStep] = { optionId, chakraMapping }
      return next
    })
    setDirection(1)
    setCurrentStep((step) => Math.min(step + 1, quizQuestions.length))
  }

  const handleBack = () => {
    setDirection(-1)
    setCurrentStep((step) => Math.max(0, step - 1))
  }

  const handleRestart = () => {
    setAnswers([])
    setDirection(-1)
    setCurrentStep(0)
  }

  return (
    <div className="rounded-[36px] border border-border bg-white/70 p-5 shadow-[0_20px_60px_rgba(58,53,48,0.05)] backdrop-blur-sm md:p-8">
      <div className="mx-auto mb-8 flex max-w-xl items-center justify-center">
        {quizQuestions.map((question, index) => {
          const chakraKey = accentToChakraKey(question.chakraAccent)
          const color = getChakraHex(chakraKey)
          const completed = index < currentStep
          const active = index === currentStep

          return (
            <div key={question.id} className="flex flex-1 items-center last:flex-none">
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition-all duration-300',
                  completed || active ? 'text-white' : 'border-border bg-warm-cream text-text-muted',
                )}
                style={
                  completed || active
                    ? {
                        backgroundColor: color,
                        borderColor: color,
                        boxShadow: `0 0 0 6px ${hexToRgba(color, 0.1)}`,
                      }
                    : undefined
                }
              >
                {index + 1}
              </span>
              {index < quizQuestions.length - 1 ? (
                <span
                  className="mx-2 h-px flex-1 bg-border transition-colors duration-300"
                  style={completed ? { backgroundColor: color } : undefined}
                />
              ) : null}
            </div>
          )
        })}
      </div>

      <div ref={panelRef}>
        {result ? (
          <QuizResult result={result} onRestart={handleRestart} />
        ) : (
          <QuizStep
            question={quizQuestions[currentStep]}
            selectedOptionId={answers[currentStep]?.optionId}
            onSelect={handleSelect}
          />
        )}
      </div>

      {currentStep > 0 && !result ? (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" size="md" onClick={handleBack}>
            <ArrowLeft size={16} />
            返回上一题
          </Button>
        </div>
      ) : null}
    </div>
  )
}
