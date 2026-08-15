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
    'chakra bracelet',
    '7 chakra bracelet',
    'chakra jewelry',
    'chakra crystals',
    'healing crystal bracelet',
  ],
  product: [
    'amethyst bracelet',
    'rose quartz bracelet',
    'citrine bracelet',
    'moonstone necklace',
    'garnet bracelet',
  ],
  intent: [
    'root chakra bracelet',
    'heart chakra bracelet',
    'third eye chakra crystals',
    'crown chakra crystals',
    'crystal jewelry gifts',
  ],
} as const

export const homeSeo: SeoEntry = {
  title: 'Crystal Jewelry, Chakra Bracelets & Healing Crystals | Lunar Talisman',
  description:
    'Explore crystal jewelry, chakra bracelets, healing crystals, and moonlit ritual pieces for every energy centre.',
  primaryKeyword: 'crystal jewelry',
  supportingKeywords: [
    'chakra bracelet',
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
    title: 'Chakra Bracelets & Crystal Jewelry | Lunar Talisman',
    description:
      'Explore seven chakra bracelets and crystal jewelry for grounding, creativity, confidence, love, expression, intuition, and connection.',
    primaryKeyword: 'chakra bracelet',
    supportingKeywords: ['7 chakra bracelet', 'chakra jewelry', 'healing crystal bracelet'],
  },
  'chakra-root': {
    title: 'Root Chakra Bracelets & Grounding Crystals | Lunar Talisman',
    description:
      'Shop root chakra bracelets and grounding crystals chosen for steadiness, safety, and an anchored daily ritual.',
    primaryKeyword: 'root chakra bracelet',
    supportingKeywords: ['root chakra crystals', 'garnet bracelet', 'grounding crystals'],
  },
  'chakra-sacral': {
    title: 'Sacral Chakra Crystal Jewelry | Lunar Talisman',
    description:
      'Explore sacral chakra crystal jewelry for creativity, emotional flow, sensuality, and renewed inspiration.',
    primaryKeyword: 'sacral chakra crystals',
    supportingKeywords: ['sacral chakra bracelet', 'moonstone bracelet', 'carnelian bracelet'],
  },
  'chakra-solar': {
    title: 'Solar Plexus Chakra Jewelry & Citrine Bracelets | Lunar Talisman',
    description:
      'Discover solar plexus chakra jewelry and citrine bracelets for confidence, clarity, and intentional action.',
    primaryKeyword: 'citrine bracelet',
    supportingKeywords: ['solar plexus chakra', 'solar plexus bracelet', 'chakra jewelry'],
  },
  'chakra-heart': {
    title: 'Heart Chakra Jewelry & Rose Quartz Bracelets | Lunar Talisman',
    description:
      'Shop heart chakra jewelry and rose quartz bracelets for connection, compassion, self-acceptance, and gentle ritual.',
    primaryKeyword: 'rose quartz bracelet',
    supportingKeywords: ['heart chakra bracelet', 'heart chakra crystals', 'crystal jewelry'],
  },
  'chakra-throat': {
    title: 'Throat Chakra Jewelry & Aquamarine Crystals | Lunar Talisman',
    description:
      'Explore throat chakra jewelry and aquamarine crystals for clear expression, calm communication, and honest presence.',
    primaryKeyword: 'throat chakra jewelry',
    supportingKeywords: ['throat chakra crystals', 'aquamarine necklace', 'chakra bracelet'],
  },
  'chakra-third-eye': {
    title: 'Third Eye Chakra Crystals & Amethyst Jewelry | Lunar Talisman',
    description:
      'Discover third eye chakra crystals and amethyst jewelry for reflection, intuition, dreamwork, and quiet inner focus.',
    primaryKeyword: 'third eye chakra crystals',
    supportingKeywords: ['amethyst bracelet', 'third eye chakra bracelet', 'crystal jewelry'],
  },
  'chakra-crown': {
    title: 'Crown Chakra Crystals & Clear Quartz Jewelry | Lunar Talisman',
    description:
      'Explore crown chakra crystals and clear quartz jewelry for intention setting, reflection, and moonlit connection.',
    primaryKeyword: 'crown chakra crystals',
    supportingKeywords: ['clear quartz bracelet', 'crown chakra bracelet', 'crystal jewelry'],
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
        'Explore crystal jewelry and healing crystals for chakra rituals, meaningful gifting, and everyday intention.',
      primaryKeyword: 'crystal jewelry',
      supportingKeywords: ['healing crystals', 'gemstone bracelet', 'chakra bracelet'],
    }
  )
}
