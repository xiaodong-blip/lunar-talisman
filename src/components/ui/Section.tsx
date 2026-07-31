import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { getChakraHex, type ChakraColorKey } from './chakra'

type SectionProps = {
  title: string
  subtitle: string
  chakraAccent?: ChakraColorKey
  className?: string
  children: ReactNode
  tight?: boolean
}

export function Section({
  title,
  subtitle,
  chakraAccent = 'crown',
  className,
  children,
  tight = false,
}: SectionProps) {
  const accentColor = getChakraHex(chakraAccent)

  return (
    <section className={cn(tight ? 'py-12 md:py-16' : 'py-20 md:py-28', className)}>
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <header className="max-w-3xl">
          <div className="flex items-start gap-3">
            <span
              className="mt-2 h-8 w-[3px] shrink-0 rounded-full"
              style={{ backgroundColor: accentColor }}
              aria-hidden="true"
            />
            <div>
              <h2 className="text-3xl text-text-primary md:text-4xl">{title}</h2>
              <p className="mt-2 text-sm text-text-secondary md:text-base">{subtitle}</p>
            </div>
          </div>
        </header>

        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

