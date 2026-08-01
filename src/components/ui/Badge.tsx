import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { hexToRgba, getChakraHex, type ChakraColorKey } from './chakra'

type BadgeVariant = ChakraColorKey | 'limited' | 'gold'

type BadgeProps = {
  variant: BadgeVariant
  children: ReactNode
  className?: string
}

const badgeToChakra: Record<BadgeVariant, ChakraColorKey> = {
  root: 'root',
  sacral: 'sacral',
  solar: 'solar',
  heart: 'heart',
  throat: 'throat',
  'third-eye': 'third-eye',
  crown: 'crown',
  limited: 'sacral',
  gold: 'solar',
}

export function Badge({ variant, children, className }: BadgeProps) {
  const chakraColor = badgeToChakra[variant]
  const color = getChakraHex(chakraColor)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium leading-none transition-transform duration-200 ease-out hover:scale-105',
        className,
      )}
      style={{
        backgroundColor: hexToRgba(color, 0.15),
        borderColor: hexToRgba(color, 0.3),
        color,
      }}
    >
      {children}
    </span>
  )
}
