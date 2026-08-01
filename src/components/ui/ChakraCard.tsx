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
  const borderColor = 'rgba(58, 53, 48, 0.08)'

  return (
    <article
      className={cn(
        'chakra-card relative overflow-hidden rounded-[12px] border px-6 py-6 transition-all duration-300 ease-out',
        hoverable &&
          'hover:-translate-y-1.5 hover:border-[color:var(--chakra-card-border)] hover:shadow-[0_10px_25px_rgba(58,53,48,0.1),0_4px_10px_rgba(58,53,48,0.06),0_18px_42px_var(--chakra-card-shadow)]',
        className,
      )}
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor,
        borderLeftWidth: '4px',
        borderLeftColor: baseColor,
        boxShadow: `0 1px 3px rgba(58,53,48,0.06), 0 1px 2px rgba(58,53,48,0.04), 0 10px 24px ${hexToRgba(baseColor, 0.06)}`,
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
