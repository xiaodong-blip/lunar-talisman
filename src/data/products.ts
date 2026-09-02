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
    name: '天蝎守护 · 紫水晶手链',
    subtitle: 'Scorpio Guardian Amethyst',
    price: 189,
    originalPrice: 109,
    description:
      'A guardian bracelet crafted for Scorpio. Amethyst resonates with the third eye chakra and is traditionally said to heighten intuition, with a particular intensity during eclipses. Every amethyst bead is cleansed in a new moon ritual, carrying a deep energy of transformation.',
    collection: 'zodiac',
    zodiacSigns: ['scorpio', 'pisces'],
    primaryChakra: 'third-eye',
    secondaryChakra: 'crown',
    element: '水',
    crystalType: '紫水晶 (Amethyst)',
    images: ['https://images.unsplash.com/photo-1599658880436-c617b95cbc3f?w=600'],
    inStock: true,
    moonCharged: true,
    rating: 4.8,
    reviewCount: 126,
  },
  {
    id: 'heart-rose-quartz',
    name: '心轮疗愈 · 玫瑰晶手链',
    subtitle: 'Heart Chakra Rose Quartz',
    price: 169,
    description:
      "Rose quartz is the heart chakra's signature stone, traditionally believed to open the heart and draw in unconditional love. Every bead in this bracelet is cleansed under the full moon before it reaches you.",
    collection: 'chakra',
    primaryChakra: 'heart',
    element: '风',
    crystalType: '玫瑰晶 (Rose Quartz)',
    images: ['https://images.unsplash.com/photo-1605100802531-9abce0fdda72?w=600'],
    inStock: true,
    moonCharged: true,
    rating: 4.9,
    reviewCount: 203,
  },
  {
    id: 'solar-citrine',
    name: '太阳轮 · 黄水晶勇气手链',
    subtitle: 'Solar Plexus Citrine',
    price: 179,
    originalPrice: 199,
    description:
      'Citrine resonates with the solar plexus chakra — the crystal embodiment of confidence and action. It is traditionally said to strengthen decisiveness and dissolve self-doubt, and its energy is amplified by a full moon blessing.',
    collection: 'chakra',
    primaryChakra: 'solar',
    element: '火',
    crystalType: '黄水晶 (Citrine)',
    images: ['https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=600'],
    inStock: true,
    moonCharged: false,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: 'new-moon-set',
    name: '新月仪式 · 净化套装',
    subtitle: 'New Moon Ritual Set',
    price: 129,
    originalPrice: 159,
    description:
      'A new moon ritual set: clear quartz bracelet, white sage bundle, and ritual guide card. Clear quartz is the crown chakra’s high-vibration stone, believed to resonate with moonlight on the new moon night.',
    collection: 'lunar',
    moonPhase: 'new-moon',
    primaryChakra: 'crown',
    secondaryChakra: 'third-eye',
    element: '以太',
    crystalType: '白水晶 (Clear Quartz)',
    images: ['https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600'],
    inStock: true,
    moonCharged: true,
    rating: 4.9,
    reviewCount: 57,
  },
  {
    id: 'root-garnet',
    name: '海底轮 · 红石榴石扎根手链',
    subtitle: 'Root Chakra Garnet',
    price: 175,
    description:
      'Red garnet resonates with the root chakra, helping you feel anchored, secure, and steady. Traditionally said to bring a sense of safety, it is a grounding companion for anxious or uncertain days.',
    collection: 'chakra',
    primaryChakra: 'root',
    element: '土',
    crystalType: '红石榴石 (Garnet)',
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600'],
    inStock: true,
    moonCharged: false,
    rating: 4.6,
    reviewCount: 73,
  },
  {
    id: 'full-moon-necklace',
    name: '满月祝福 · 月光石项链',
    subtitle: 'Full Moon Moonstone Necklace',
    price: 149,
    description:
      'A moonstone necklace blessed on the night of the full moon. Moonstone is traditionally associated with the crown and third eye chakras and is said to sharpen intuition and inner vision. Crafted with a 925 sterling silver chain and a natural moonstone pendant.',
    collection: 'lunar',
    moonPhase: 'full-moon',
    primaryChakra: 'crown',
    secondaryChakra: 'third-eye',
    element: '水',
    crystalType: '月光石 (Moonstone)',
    images: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600'],
    inStock: true,
    moonCharged: true,
    rating: 5.0,
    reviewCount: 34,
  },
]
