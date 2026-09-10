export type SeoEntry = {
  title: string
  description: string
  primaryKeyword: string
  supportingKeywords: string[]
}

export const keywordClusters = {
  discovery: [
    'crystal jewelry',
    'gemstone jewelry',
    'healing crystals',
    'crystal bracelet',
    'gemstone bracelet',
  ],
  chakra: [
    'healing crystal bracelet',
    'crystals by intention',
    'crystal meanings',
    'natural-stone jewelry',
  ],
  product: [
    'amethyst bracelet',
    'rose quartz bracelet',
    'citrine bracelet',
    'moonstone necklace',
    'garnet bracelet',
  ],
  intent: [
    'grounding crystals',
    'crystals for love',
    'intuition crystals',
    'crystal jewelry gifts',
  ],
} as const

export const homeSeo: SeoEntry = {
  title: 'Healing Crystal Jewelry & Gemstone Bracelets | Lunar Talisman',
  description:
    'Explore healing crystals, natural-stone jewelry, gemstone bracelets, and moonlit ritual pieces for every personal intention.',
  primaryKeyword: 'crystal jewelry',
  supportingKeywords: [
    'healing crystals',
    'gemstone jewelry',
    'crystal bracelet',
  ],
}

const seriesEntries: Record<string, SeoEntry> = {
  worlds: {
    title: 'Crystal Jewelry & Healing Crystals | Lunar Talisman',
    description:
      'Discover crystal jewelry and healing crystals through chakra collections, moon rituals, and everyday talismans.',
    primaryKeyword: 'healing crystals',
    supportingKeywords: ['crystal jewelry', 'gemstone jewelry', 'crystal bracelet'],
  },
  chakra: {
    title: 'Crystal Healing Collections by Intention | Lunar Talisman',
    description:
      'Explore healing crystal jewelry organized by grounding, creativity, confidence, love, clarity, intuition, and stillness.',
    primaryKeyword: 'crystal healing collections',
    supportingKeywords: ['healing crystals by intention', 'crystal bracelet collections', 'crystal meanings'],
  },
  'chakra-root': {
    title: 'Grounding Crystals & Red Agate Bracelets | Lunar Talisman',
    description:
      'Shop grounding crystals and red agate bracelets chosen for steadiness, safety, and an anchored daily ritual.',
    primaryKeyword: 'grounding crystals',
    supportingKeywords: ['red agate bracelet', 'garnet bracelet', 'crystal jewelry'],
  },
  'chakra-sacral': {
    title: 'Creative Flow Crystals & Carnelian Bracelets | Lunar Talisman',
    description:
      'Explore warm-toned crystals and carnelian bracelets for creativity, emotional flow, joy, and renewed inspiration.',
    primaryKeyword: 'creativity crystals',
    supportingKeywords: ['carnelian bracelet', 'passion crystals', 'crystal jewelry'],
  },
  'chakra-solar': {
    title: 'Confidence Crystals & Citrine Bracelets | Lunar Talisman',
    description:
      'Discover citrine and golden crystals for confidence, clarity, abundance intentions, and focused action.',
    primaryKeyword: 'citrine bracelet',
    supportingKeywords: ['confidence crystals', 'abundance crystals', 'crystal jewelry'],
  },
  'chakra-heart': {
    title: 'Love Crystals & Rose Quartz Bracelets | Lunar Talisman',
    description:
      'Shop rose quartz and pink crystals for love, compassion, self-acceptance, and gentle relationship rituals.',
    primaryKeyword: 'rose quartz bracelet',
    supportingKeywords: ['crystals for love', 'self love crystals', 'crystal jewelry'],
  },
  'chakra-throat': {
    title: 'Expression & Clarity Crystals for Everyday Wear | Lunar Talisman',
    description:
      'Explore clear-toned crystal jewelry for thoughtful expression, calm communication, focus, and honest presence.',
    primaryKeyword: 'communication crystals',
    supportingKeywords: ['clarity crystals', 'crystal jewelry for focus', 'natural-stone jewelry'],
  },
  'chakra-third-eye': {
    title: 'Intuition Crystals & Amethyst Jewelry | Lunar Talisman',
    description:
      'Discover amethyst and purple crystals for reflection, intuition, dreamwork, and quiet inner focus.',
    primaryKeyword: 'intuition crystals',
    supportingKeywords: ['amethyst bracelet', 'amethyst meaning', 'meditation crystals'],
  },
  'chakra-crown': {
    title: 'Stillness Crystals & Clear Quartz Jewelry | Lunar Talisman',
    description:
      'Explore clear quartz and light-catching crystals for stillness, spiritual reflection, clarity, and moonlit rituals.',
    primaryKeyword: 'spiritual crystals',
    supportingKeywords: ['clear quartz jewelry', 'clear quartz meaning', 'meditation jewelry'],
  },
  lunar: {
    title: 'Moonstone Jewelry & Lunar Crystal Rituals | Lunar Talisman',
    description:
      'Discover moonstone jewelry, new moon ritual sets, and full moon crystal rituals for intentional everyday practice.',
    primaryKeyword: 'moonstone necklace',
    supportingKeywords: ['moonstone jewelry', 'new moon ritual', 'full moon crystal ritual'],
  },
  rituals: {
    title: 'Crystal Rituals & Moon Ritual Gifts | Lunar Talisman',
    description:
      'Explore new moon and full moon crystal rituals, cleansing sets, and meaningful crystal jewelry gifts.',
    primaryKeyword: 'crystal rituals',
    supportingKeywords: ['full moon ritual', 'new moon ritual', 'crystal jewelry gifts'],
  },
  crystals: {
    title: 'Crystal Jewelry & Gemstone Bracelets | Lunar Talisman',
    description:
      'Shop crystal jewelry, gemstone bracelets, amethyst, rose quartz, citrine, moonstone, and more ritual talismans.',
    primaryKeyword: 'crystal jewelry',
    supportingKeywords: ['gemstone bracelet', 'crystal bracelet', 'healing crystals'],
  },
  codex: {
    title: 'Crystal Healing Guide & Chakra Guide | Lunar Talisman',
    description:
      'Read a crystal healing guide and chakra guide for choosing crystal jewelry, ritual practices, and energy-centre themes.',
    primaryKeyword: 'crystal healing guide',
    supportingKeywords: ['chakra guide', 'chakra crystals', 'healing crystals'],
  },
  connect: {
    title: 'Crystal Quiz & Chakra Guide | Lunar Talisman',
    description:
      'Use our crystal quiz and chakra guide to find a crystal jewelry ritual aligned with your current intention.',
    primaryKeyword: 'crystal quiz',
    supportingKeywords: ['chakra quiz', 'chakra crystals', 'healing crystal bracelet'],
  },
}

export function getSeriesSeo(id: string): SeoEntry {
  return seriesEntries[id] ?? homeSeo
}

const productEntries: Record<string, SeoEntry> = {
  'heart-rose-quartz': {
    title: 'Rose Quartz Bracelet for Heart Chakra | Lunar Talisman',
    description:
      'Explore a rose quartz bracelet for heart chakra rituals, gentle connection, self-acceptance, and crystal jewelry gifting.',
    primaryKeyword: 'rose quartz bracelet',
    supportingKeywords: ['heart chakra bracelet', 'heart chakra crystals', 'crystal jewelry'],
  },
  'solar-citrine': {
    title: 'Citrine Bracelet for Solar Plexus Chakra | Lunar Talisman',
    description:
      'Discover a citrine bracelet for solar plexus chakra rituals, confidence, clear decisions, and intentional action.',
    primaryKeyword: 'citrine bracelet',
    supportingKeywords: ['solar plexus chakra', 'solar plexus bracelet', 'crystal jewelry'],
  },
  'root-garnet': {
    title: 'Garnet Bracelet for Root Chakra | Lunar Talisman',
    description:
      'Explore a garnet bracelet for root chakra rituals, grounding, steadiness, and daily crystal jewelry wear.',
    primaryKeyword: 'garnet bracelet',
    supportingKeywords: ['root chakra bracelet', 'grounding crystals', 'crystal bracelet'],
  },
  'scorpio-amethyst': {
    title: 'Amethyst Bracelet & Third Eye Crystal Jewelry | Lunar Talisman',
    description:
      'Discover an amethyst bracelet for third eye reflection, intuitive ritual, and meaningful crystal jewelry gifting.',
    primaryKeyword: 'amethyst bracelet',
    supportingKeywords: ['third eye chakra crystals', 'amethyst jewelry', 'crystal bracelet'],
  },
  'full-moon-necklace': {
    title: 'Moonstone Necklace & Crystal Jewelry | Lunar Talisman',
    description:
      'Explore a moonstone necklace for full moon rituals, reflection, and luminous everyday crystal jewelry.',
    primaryKeyword: 'moonstone necklace',
    supportingKeywords: ['moonstone jewelry', 'full moon ritual', 'crystal necklace'],
  },
  'new-moon-set': {
    title: 'New Moon Crystal Ritual Set | Lunar Talisman',
    description:
      'Discover a new moon crystal ritual set for intention setting, cleansing practice, and meaningful crystal gifts.',
    primaryKeyword: 'new moon ritual',
    supportingKeywords: ['crystal ritual set', 'clear quartz bracelet', 'moon ritual'],
  },
}

export function getProductSeo(id: string): SeoEntry {
  return (
    productEntries[id] ?? {
      title: 'Crystal Jewelry & Healing Crystals | Lunar Talisman',
    description:
        'Explore healing crystals and crystal jewelry for reflective rituals, meaningful gifting, and everyday intention.',
      primaryKeyword: 'crystal jewelry',
      supportingKeywords: ['healing crystals', 'gemstone bracelet', 'crystal meanings'],
    }
  )
}
