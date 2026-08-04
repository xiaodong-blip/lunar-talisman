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
    price: 89,
    originalPrice: 109,
    description:
      '专为天蝎座打造的守护手链。紫水晶对应眉心轮，传说能增强直觉力，在月食之夜尤为强大。每一颗紫水晶珠都经过新月仪式净化，承载着深邃的转化能量。',
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
    price: 69,
    description:
      '玫瑰晶是心轮的代表水晶，传说能打开心扉，吸引无条件的爱。每一颗玫瑰晶都在满月之夜经过月光净化。',
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
    price: 79,
    originalPrice: 99,
    description:
      '黄水晶对应太阳轮，是自信与行动力的水晶化身。传说佩戴者可增强决断力，驱散自我怀疑。满月加持后能量更强。',
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
      '新月仪式限定套装：白水晶手链 + 白鼠尾草棒 + 仪式指南卡。白水晶是顶轮的最高振动水晶，在新月之夜与月光共振。',
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
    price: 75,
    description:
      '红石榴石对应海底轮，帮助你扎根大地、找到安全感与稳定感。适合感到焦虑或不安全时佩戴。',
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
      '满月之夜加持的月光石项链。月光石对应顶轮与眉心轮，传说能增强直觉与灵视力。925 银链 + 天然月光石吊坠。',
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
