import { useEffect, useRef, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import type { QuizQuestion } from '../../data/quiz'
import { ChakraCard } from '../ui/ChakraCard'
import { getChakraHex, hexToRgba } from '../ui/chakra'
import { cn } from '../../utils/cn'
import { accentToChakraKey, quizIconMap } from './quizUtils'

type QuizStepProps = {
  question: QuizQuestion
  selectedOptionId?: string
  onSelect: (optionId: string, chakraMapping: string[]) => void
}

export function QuizStep({ question, selectedOptionId, onSelect }: QuizStepProps) {
  const [pendingOptionId, setPendingOptionId] = useState<string | undefined>(selectedOptionId)
  const timeoutRef = useRef<number | undefined>(undefined)
  const accentKey = accentToChakraKey(question.chakraAccent)
  const accentColor = getChakraHex(accentKey)
  const QuestionIcon = quizIconMap[question.icon] ?? Sparkles

  useEffect(() => {
    setPendingOptionId(selectedOptionId)
  }, [selectedOptionId, question.id])

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  const handleSelect = (optionId: string, chakraMapping: string[]) => {
    setPendingOptionId(optionId)

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      onSelect(optionId, chakraMapping)
    }, 400)
  }

  return (
    <div>
      <div className="mx-auto max-w-3xl text-center">
        <span
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-white shadow-[0_12px_30px_rgba(58,53,48,0.05)]"
          style={{ color: accentColor }}
        >
          <QuestionIcon size={30} strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 text-3xl text-text-primary md:text-4xl">
          {question.question}
        </h2>
        {question.subtitle ? (
          <p className="mt-2 text-sm text-text-secondary md:text-base">
            {question.subtitle}
          </p>
        ) : null}
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {question.options.map((option) => {
          const selected = pendingOptionId === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id, option.chakraMapping)}
              className="group text-left"
            >
              <ChakraCard
                chakraColor={accentKey}
                hoverable
                className={cn(
                  'h-full min-h-[116px] transition-all',
                  selected && 'scale-[1.015]',
                )}
                style={{
                  borderLeftWidth: selected ? '6px' : '4px',
                  borderColor: selected ? hexToRgba(accentColor, 0.5) : undefined,
                  boxShadow: selected
                    ? `0 18px 44px ${hexToRgba(accentColor, 0.18)}`
                    : undefined,
                }}
              >
                <div className="relative pr-9">
                  {selected ? (
                    <span
                      className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-[0_0_22px_var(--quiz-check-glow)]"
                      style={{
                        backgroundColor: accentColor,
                        '--quiz-check-glow': hexToRgba(accentColor, 0.45),
                      } as React.CSSProperties}
                    >
                      <Check size={16} />
                    </span>
                  ) : null}
                  <p className="text-base font-medium leading-7 text-text-primary">
                    {option.label}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-text-muted">
                    Energy Mapping
                  </p>
                </div>
              </ChakraCard>
            </button>
          )
        })}
      </div>
    </div>
  )
}
