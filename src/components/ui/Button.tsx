import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import {
  darkenHex,
  getChakraHex,
  type ChakraColorKey,
} from './chakra'

type ButtonVariant = 'primary' | 'gold' | 'outline' | 'ghost' | 'chakra'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
  chakraColor?: ChakraColorKey
} & ButtonHTMLAttributes<HTMLButtonElement>

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  chakraColor = 'crown',
  type = 'button',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const chakraBase = getChakraHex(chakraColor)
  const chakraHover = darkenHex(chakraBase, 0.1)

  const baseClasses =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chakra-crown/30 focus-visible:ring-offset-2 focus-visible:ring-offset-warm-cream disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100'

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[#9B8EC4] text-white shadow-[0_10px_24px_rgba(155,142,196,0.18)] hover:bg-[#8A7DB8]',
    gold:
      'bg-[#D4B76A] text-text-primary shadow-[0_10px_22px_rgba(212,183,106,0.18)] hover:bg-[#C4A75A]',
    outline:
      'border-[1.5px] border-[#9B8EC4] bg-transparent text-text-primary hover:bg-[rgba(155,142,196,0.1)]',
    ghost:
      'border border-transparent bg-transparent text-text-secondary hover:bg-warm-cream hover:text-text-primary',
    chakra:
      'text-white shadow-[0_10px_24px_rgba(58,53,48,0.12)] hover:shadow-[0_14px_32px_rgba(58,53,48,0.16)]',
  }

  const chakraStyle =
    variant === 'chakra'
      ? {
          backgroundColor: chakraBase,
          '--chakra-button-bg': chakraBase,
          '--chakra-button-bg-hover': chakraHover,
        }
      : undefined

  const mergedStyle = {
    ...chakraStyle,
    ...style,
  } as ButtonHTMLAttributes<HTMLButtonElement>['style'] & {
    [key: `--${string}`]: string | number | undefined
  }

  const mergedClasses =
    variant === 'chakra'
      ? 'bg-[var(--chakra-button-bg)] hover:bg-[var(--chakra-button-bg-hover)]'
      : ''

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], mergedClasses, className)}
      style={mergedStyle}
      {...props}
    >
      {children}
    </button>
  )
}
