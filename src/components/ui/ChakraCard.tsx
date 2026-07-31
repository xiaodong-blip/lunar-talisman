import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { hexToRgba, getChakraHex, type ChakraColorKey } from './chakra'

type ChakraCardProps = {
  chakraColor: ChakraColorKey
  children: ReactNode
  className?: string
  hoverable?: boolean
  style?: CSSProperties
}

export function ChakraCard({
  chakraColor,
  children,
  className,
  hoverable = true,
  style,
}: ChakraCardProps) {
  const baseColor = getChakraHex(chakraColor)
  const softShadow = hexToRgba(baseColor, 0.15)
  const borderColor = hexToRgba(baseColor, 0.3)

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[12px] border px-6 py-6 transition-all duration-[400ms] ease-out',
        hoverable &&
          'hover:-translate-y-1.5 hover:border-[color:var(--chakra-card-border)] hover:shadow-[0_18px_42px_var(--chakra-card-shadow)]',
        className,
      )}
      style={{
        backgroundColor: 'var(--color-card)',
        borderLeftWidth: '4px',
        borderLeftColor: baseColor,
        borderColor,
        boxShadow: `0 8px 20px ${hexToRgba('#3A3530', 0.04)}`,
        '--chakra-card-shadow': softShadow,
        '--chakra-card-border': baseColor,
        ...style,
      } as CSSProperties & Record<string, string>}
    >
      <span
        className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full animate-pulse"
        aria-hidden="true"
        style={{ backgroundColor: baseColor }}
      />
      {children}
    </article>
  )
}
