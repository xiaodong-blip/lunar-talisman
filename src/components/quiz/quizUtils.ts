import {
  Heart,
  Palette,
  Sparkles,
  Star,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { chakraHexMap, type ChakraColorKey } from '../ui/chakra'

export const quizIconMap: Record<string, LucideIcon> = {
  Heart,
  Palette,
  Sparkles,
  Star,
}

export function accentToChakraKey(accent: string): ChakraColorKey {
  const key = accent.replace('chakra-', '') as ChakraColorKey

  return key in chakraHexMap ? key : 'crown'
}
