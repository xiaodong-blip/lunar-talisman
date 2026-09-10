export interface Collection {
  id: string
  name: string
  subtitle: string
  description: string
  image: string
  itemCount: number
  chakraColor: 'crown' | 'heart' | 'solar'
  chakraName: string
  gradient: string
}

export const collections: Collection[] = [
  {
    id: 'zodiac',
    name: 'Crystal Intention Finder',
    subtitle: 'Color, material, and instinct',
    description:
      'A guided way to choose crystal jewelry by color, material, and the feeling you want to carry.',
    image: 'https://images.unsplash.com/photo-1599658880436-c617b95cbc3f?w=600',
    itemCount: 12,
    chakraColor: 'crown',
    chakraName: 'Personal intention',
    gradient:
      'linear-gradient(135deg, rgba(155,142,196,0.2), rgba(155,142,196,0.05))',
  },
  {
    id: 'chakra',
    name: 'Crystal Healing by Intention',
    subtitle: 'Intention Collection',
    description: 'Natural-stone jewelry organized around grounding, creativity, confidence, love, clarity, intuition, and stillness.',
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85',
    itemCount: 7,
    chakraColor: 'heart',
    chakraName: 'Crystal healing',
    gradient:
      'linear-gradient(135deg, rgba(138,168,138,0.2), rgba(138,168,138,0.05))',
  },
  {
    id: 'lunar',
    name: 'Lunar Crystal Rituals',
    subtitle: 'New moon and full moon care',
    description: 'From new moon to full moon, build a simple care and intention ritual around the stones you wear.',
    image: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600',
    itemCount: 8,
    chakraColor: 'solar',
    chakraName: 'Moonlit care',
    gradient:
      'linear-gradient(135deg, rgba(212,183,106,0.2), rgba(212,183,106,0.05))',
  },
]
