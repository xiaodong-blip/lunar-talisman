import type { ChakraColorKey } from '../components/ui/chakra'

export interface CrystalProduct {
  id: string
  name: string
  subtitle: string
  price: number
  originalPrice?: number
  description: string
  collection: 'zodiac' | 'chakra' | 'lunar'
  zodiacSigns?: string[]
  primaryChakra: ChakraColorKey
  secondaryChakra?: ChakraColorKey
  element: string
  moonPhase?: string
  crystalType: string
  images: string[]
  inStock: boolean
  moonCharged: boolean
  rating: number
  reviewCount: number
}

export const products: CrystalProduct[] = [
  {
    id: 'scorpio-amethyst',
    name: 'Scorpio Guardian · Amethyst Bracelet',
    subtitle: 'Scorpio guardian amethyst',
    price: 189,
    originalPrice: 109,
    description:
      'A guardian bracelet crafted for Scorpio. Amethyst resonates with the third eye chakra and is traditionally said to heighten intuition, with a particular intensity during eclipses. Every amethyst bead is cleansed in a new moon ritual, carrying a deep energy of transformation.',
    collection: 'zodiac',
    zodiacSigns: ['scorpio', 'pisces'],
    primaryChakra: 'third-eye',
    secondaryChakra: 'crown',
    element: 'Water',
    crystalType: 'Amethyst',
    images: ['https://images.unsplash.com/photo-1599658880436-c617b95cbc3f?w=600'],
    inStock: true,
    moonCharged: true,
    rating: 4.8,
    reviewCount: 126,
  },
  {
    id: 'heart-rose-quartz',
    name: 'Love & Compassion · Rose Quartz Bracelet',
    subtitle: 'Rose quartz for love and compassion',
    price: 169,
    description:
      "Rose quartz is the heart chakra's signature stone, traditionally believed to open the heart and draw in unconditional love. Every bead in this bracelet is cleansed under the full moon before it reaches you.",
    collection: 'chakra',
    primaryChakra: 'heart',
    element: 'Air',
    crystalType: 'Rose Quartz',
    images: ['https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85'],
    inStock: true,
    moonCharged: true,
    rating: 4.9,
    reviewCount: 203,
  },
  {
    id: 'solar-citrine',
    name: 'Confidence · Citrine Courage Bracelet',
    subtitle: 'Citrine for confidence and clarity',
    price: 179,
    originalPrice: 199,
    description:
      'Citrine resonates with the solar plexus chakra — the crystal embodiment of confidence and action. It is traditionally said to strengthen decisiveness and dissolve self-doubt, and its energy is amplified by a full moon blessing.',
    collection: 'chakra',
    primaryChakra: 'solar',
    element: 'Fire',
    crystalType: 'Citrine',
    images: ['https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=600'],
    inStock: true,
    moonCharged: false,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: 'new-moon-set',
    name: 'New Moon Ritual · Crystal Care Set',
    subtitle: 'Clear quartz and moonlit care',
    price: 129,
    originalPrice: 159,
    description:
      'A new moon ritual set: clear quartz bracelet, white sage bundle, and ritual guide card. Clear quartz is the crown chakra’s high-vibration stone, believed to resonate with moonlight on the new moon night.',
    collection: 'lunar',
    moonPhase: 'new-moon',
    primaryChakra: 'crown',
    secondaryChakra: 'third-eye',
    element: 'Ether',
    crystalType: 'Clear Quartz',
    images: ['https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600'],
    inStock: true,
    moonCharged: true,
    rating: 4.9,
    reviewCount: 57,
  },
  {
    id: 'root-garnet',
    name: 'Grounding · Garnet Bracelet',
    subtitle: 'Garnet for grounding and steadiness',
    price: 175,
    description:
      'Red garnet resonates with the root chakra, helping you feel anchored, secure, and steady. Traditionally said to bring a sense of safety, it is a grounding companion for anxious or uncertain days.',
    collection: 'chakra',
    primaryChakra: 'root',
    element: 'Earth',
    crystalType: 'Garnet',
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600'],
    inStock: true,
    moonCharged: false,
    rating: 4.6,
    reviewCount: 73,
  },
  {
    id: 'full-moon-necklace',
    name: 'Full Moon Blessing · Moonstone Necklace',
    subtitle: 'Moonstone for lunar reflection',
    price: 149,
    description:
      'A moonstone necklace blessed on the night of the full moon. Moonstone is traditionally associated with the crown and third eye chakras and is said to sharpen intuition and inner vision. Crafted with a 925 sterling silver chain and a natural moonstone pendant.',
    collection: 'lunar',
    moonPhase: 'full-moon',
    primaryChakra: 'crown',
    secondaryChakra: 'third-eye',
    element: 'Water',
    crystalType: 'Moonstone',
    images: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600'],
    inStock: true,
    moonCharged: true,
    rating: 5.0,
    reviewCount: 34,
  },
]
