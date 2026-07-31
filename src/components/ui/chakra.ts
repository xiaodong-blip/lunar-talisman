export type ChakraColorKey =
  | 'root'
  | 'sacral'
  | 'solar'
  | 'heart'
  | 'throat'
  | 'third-eye'
  | 'crown'

export const chakraHexMap: Record<ChakraColorKey, string> = {
  root: '#C4816B',
  sacral: '#D49A6A',
  solar: '#D4B76A',
  heart: '#8AA88A',
  throat: '#8AA4B8',
  'third-eye': '#8A8EB8',
  crown: '#9B8EC4',
}

export function getChakraHex(chakraColor: ChakraColorKey): string {
  return chakraHexMap[chakraColor]
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '')
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized

  const value = Number.parseInt(expanded, 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function darkenHex(hex: string, amount = 0.1): string {
  const normalized = hex.replace('#', '')
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized

  const value = Number.parseInt(expanded, 16)
  const red = Math.max(0, Math.round(((value >> 16) & 255) * (1 - amount)))
  const green = Math.max(0, Math.round(((value >> 8) & 255) * (1 - amount)))
  const blue = Math.max(0, Math.round((value & 255) * (1 - amount)))

  return `rgb(${red}, ${green}, ${blue})`
}

