import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_ORIGIN = 'https://lunartalisman.com'
const rootDir = fileURLToPath(new URL('..', import.meta.url))
const distDir = path.join(rootDir, 'dist')
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml')
const guidesPath = path.join(rootDir, 'src', 'data', 'importedSeriesGuides.ts')
const guideSeoPath = path.join(rootDir, 'src', 'data', 'guideSeo.ts')
const productsPath = path.join(rootDir, 'src', 'data', 'importedProducts.ts')

const CJK = /[\u3400-\u9fff]/
const CHAKRA_BY_PREFIX = {
  root: 'Root Chakra',
  sacral: 'Sacral Chakra',
  solar: 'Solar Plexus Chakra',
  heart: 'Heart Chakra',
  throat: 'Throat Chakra',
  'third-eye': 'Third Eye Chakra',
  crown: 'Crown Chakra',
}

const SERIES = {
  worlds: {
    title: 'Crystal Journey',
    description:
      'Explore a reflective crystal journey through chakras, lunar rituals, gemstone talismans, and practical guides.',
  },
  collections: {
    title: 'Crystal Collections',
    description:
      'Browse Lunar Talisman collections for crystal jewelry, chakra rituals, lunar practices, and guided reflection.',
  },
  rituals: {
    title: 'Lunar Rituals',
    description:
      'Explore new moon intentions, full moon cleansing, and crystal rituals designed for mindful everyday practice.',
  },
  chakra: {
    title: 'Chakra Healing Collection',
    description:
      'Explore seven chakra crystal collections, from grounding root chakra bracelets to crown chakra talismans.',
  },
  lunar: {
    title: 'Lunar Ritual Collection',
    description:
      'Crystal jewelry and ritual guides for new moon intention setting, full moon cleansing, and reflective practice.',
  },
  crystals: {
    title: 'Crystal Talismans',
    description:
      'Browse Lunar Talisman crystal jewelry, gemstone bracelets, chakra talismans, and moonlit ritual pieces.',
  },
  connect: {
    title: 'Begin the Connection',
    description:
      'Find a crystal talisman through practical chakra guidance, reflective rituals, and curated gemstone jewelry.',
  },
}

const CHAKRA_SEO = {
  root: {
    title: 'Root Chakra Stones for Grounding & Safety',
    description: 'Explore root chakra stones and crystals for grounding, safety, stability, and everyday ritual through crystal bracelets and talismans.',
    keywords: ['root chakra stones', 'root chakra bracelet', 'grounding crystals', 'crystals for protection'],
  },
  sacral: {
    title: 'Sacral Chakra Stones for Creativity & Passion',
    description: 'Explore sacral chakra stones and crystals for creativity, passion, emotional flow, and joyful everyday ritual.',
    keywords: ['sacral chakra stones', 'sacral chakra bracelet', 'creativity crystals', 'passion crystals'],
  },
  solar: {
    title: 'Solar Plexus Chakra Stones for Confidence & Personal Power',
    description: 'Explore solar plexus chakra stones and crystals for confidence, clarity, courage, wealth intentions, and personal power.',
    keywords: ['solar plexus chakra stones', 'solar plexus bracelet', 'confidence crystals', 'crystals for wealth'],
  },
  heart: {
    title: 'Heart Chakra Stones for Love & Compassion',
    description: 'Explore heart chakra stones and crystals for love, compassion, emotional balance, and mindful relationship rituals.',
    keywords: ['heart chakra stones', 'heart chakra bracelet', 'rose quartz meaning', 'crystals for love'],
  },
  throat: {
    title: 'Throat Chakra Stones for Truth & Expression',
    description: 'Explore throat chakra stones and crystals for clear expression, honest communication, and a confident everyday voice.',
    keywords: ['throat chakra stones', 'throat chakra bracelet', 'communication crystals', 'blue crystals'],
  },
  'third-eye': {
    title: 'Third Eye Chakra Stones for Intuition & Insight',
    description: 'Explore third eye chakra stones and crystals for intuition, insight, reflection, and a deeper meditation ritual.',
    keywords: ['third eye chakra crystals', 'third eye chakra bracelet', 'amethyst meaning', 'intuition crystals'],
  },
  crown: {
    title: 'Crown Chakra Stones for Spiritual Connection & Clarity',
    description: 'Explore crown chakra stones and crystals for spiritual connection, clarity, stillness, and reflective lunar practice.',
    keywords: ['crown chakra crystals', 'crown chakra bracelet', 'clear quartz meaning', 'spiritual crystals'],
  },
}

const CORE_KEYWORDS = [
  'crystal healing',
  'crystal meanings',
  'healing crystals',
  'crystal jewelry',
  'chakra stones',
  'crystal bracelet',
]

const SERIES_SEO = {
  worlds: {
    title: 'Crystal Healing Guide & Crystal Meanings',
    description: 'Explore crystal healing traditions, crystal meanings, chakra stones, lunar rituals, and mindful crystal jewelry.',
    keywords: ['crystal healing', 'crystal meanings', 'healing crystals', 'crystal meaning guide'],
  },
  collections: {
    title: 'Crystal Jewelry, Chakra Bracelets & Gemstone Jewelry',
    description: 'Shop crystal jewelry, gemstone bracelets, chakra bracelets, and healing crystal jewelry from Lunar Talisman.',
    keywords: ['crystal jewelry', 'gemstone jewelry', 'crystal bracelet', 'healing crystals jewelry'],
  },
  rituals: {
    title: 'How to Cleanse Crystals & Moon Ritual Guides',
    description: 'Learn how to cleanse crystals at home, charge crystals safely, and create new moon and full moon rituals.',
    keywords: ['how to cleanse crystals', 'how to cleanse crystals at home', 'how to charge crystals', 'new moon ritual', 'full moon ritual'],
  },
  chakra: {
    title: 'Chakra Stones in Order & 7 Chakra Meanings',
    description: 'Explore chakra stones in order, chakra stones meaning and colors, seven chakra collections, and chakra bracelets.',
    keywords: ['chakra stones in order', 'chakra stones meaning', 'chakra stones chart', 'chakra stones bracelet', '7 chakras and their meanings'],
  },
  lunar: {
    title: 'Moon Phases & Crystals: New Moon and Full Moon Rituals',
    description: 'Use moon phases and crystals as a reflective rhythm for new moon intentions, full moon release, cleansing, and charging.',
    keywords: ['moon phases and crystals', 'new moon ritual crystals', 'full moon ritual crystals', 'crystal cleansing'],
  },
  crystals: {
    title: 'Crystal Meanings Chart & Healing Crystal Jewelry',
    description: 'Browse a crystal meanings chart, gemstone meanings, healing crystals, crystal bracelets, necklaces, and talisman jewelry.',
    keywords: ['crystal meaning chart', 'gemstone meanings chart', 'healing crystals', 'crystal shop online', 'healing crystals jewelry', 'crystal necklace', 'crystal gifts for women', 'crystal gifts for men'],
  },
  connect: {
    title: 'Crystals for Beginners: Choose Your Crystal Bracelet',
    description: 'A beginner-friendly path to crystal meanings, chakra stones, crystal bracelets, gifts, and mindful everyday wear.',
    keywords: ['crystals for beginners', 'crystal bracelet for women', 'crystal bracelet for men', 'crystal gift for her', 'crystal gift for him', 'crystal gifts for crystal lovers'],
  },
}

const GUIDE_SEO_BY_ID = {
  'chakra-seven-chakras-explained': {
    title: '7 Chakras and Their Meanings: Chakra Stones in Order',
    description: 'A clear guide to the seven chakras, chakra stones in order, colors, traditional meanings, and reflective practice.',
    keywords: ['7 chakras and their meanings', 'chakra stones in order', 'chakra stones chart', 'chakra stones meaning'],
  },
  'crystals-00': {
    title: 'Crystal Meanings Chart & Gemstone Meanings Guide',
    description: 'Use this crystal meanings chart and gemstone meanings guide to compare traditional symbolism, colors, care, and ritual use.',
    keywords: ['crystal meaning chart', 'crystal meaning guide', 'gemstone meanings chart', 'crystal meanings list'],
  },
  'crystals-02': {
    title: 'Red & Black Crystals for Grounding and Protection',
    description: 'Explore red and black crystal meanings, grounding rituals, and traditional protection symbolism for mindful everyday wear.',
    keywords: ['crystals for protection', 'crystals for negative energy protection', 'grounding crystals', 'crystal meanings and uses'],
  },
  'crystals-03': {
    title: 'Orange & Yellow Crystals for Wealth, Luck & Creativity',
    description: 'Explore orange and yellow crystal meanings for creativity, confidence, wealth intentions, manifestation, and good fortune.',
    keywords: ['crystal for money and wealth', 'crystals for money manifestation', 'crystal for good luck and success', 'creativity crystals'],
  },
  'crystals-04': {
    title: 'Green & Pink Crystals for Love and Relationships',
    description: 'Explore green and pink crystal meanings for love, self-love, compassion, emotional balance, and relationship rituals.',
    keywords: ['crystal for love', 'best crystal for love and relationships', 'crystals for self love', 'rose quartz meaning'],
  },
  'crystals-05': {
    title: 'Blue & Purple Crystals for Calm, Sleep & Intuition',
    description: 'Explore blue and purple crystal meanings for calm reflection, sleep rituals, intuition, communication, and mindful practice.',
    keywords: ['crystal for anxiety and stress', 'crystal for sleep', 'best crystals for restful sleep', 'amethyst meaning spiritual'],
  },
  'crystals-06': {
    title: 'Clear & White Crystals for Clarity and Cleansing',
    description: 'Explore clear and white crystal meanings, cleansing traditions, clarity rituals, and beginner-friendly crystal jewelry.',
    keywords: ['clear quartz meaning and uses', 'crystal cleansing', 'healing crystals', 'crystals for beginners'],
  },
  'worlds-08': {
    title: 'Crystals for Beginners: A Practical Starting Guide',
    description: 'Learn how to choose, wear, cleanse, and care for your first crystal without overcomplicating the ritual.',
    keywords: ['crystals for beginners', 'how to use crystals for beginners', 'crystal bracelet'],
  },
  'rituals-05': {
    title: 'How to Cleanse Crystals at Home',
    description: 'Learn safe ways to cleanse crystals at home with moonlight, selenite, sound, and mineral-aware care.',
    keywords: ['how to cleanse crystals', 'how to cleanse crystals at home', 'cleanse crystals with selenite', 'cleanse crystals with moonlight'],
    howTo: ['Identify whether the mineral is water-safe.', 'Choose a gentle method such as moonlight, sound, or a dry selenite setting.', 'Wipe and store the crystal safely before your next ritual.'],
  },
  'rituals-06': {
    title: 'How to Charge Crystals Safely',
    description: 'Learn reflective ways to charge crystals with moonlight, intention, sound, and care-safe placement.',
    keywords: ['how to charge crystals', 'how to charge crystals on a full moon', 'crystal charging methods'],
    howTo: ['Check the stone’s light, heat, and water sensitivity.', 'Choose moonlight, sound, or another care-safe charging method.', 'Set an intention, then return the crystal to a protected storage or wearing routine.'],
  },
  'rituals-01': {
    title: 'New Moon Crystal Ritual for Fresh Intentions',
    description: 'A simple new moon crystal ritual for setting intentions, journaling, and beginning a new reflective cycle.',
    keywords: ['new moon ritual', 'new moon ritual crystals', 'new moon manifestation ritual'],
  },
  'rituals-02': {
    title: 'Full Moon Crystal Ritual for Release & Reflection',
    description: 'A simple full moon crystal ritual for gratitude, release, cleansing, and reflective closure.',
    keywords: ['full moon ritual', 'full moon ritual crystals', 'releasing ritual during full moon'],
  },
  'rituals-moon-phase-guide': {
    title: 'Moon Phases and Crystals: A Practical Guide',
    description: 'Understand moon phases and crystals as a reflective rhythm for intention setting, cleansing, charging, and release.',
    keywords: ['moon phases and crystals', 'phases of the moon', 'crystals for full moon'],
    howTo: ['Choose an intention that fits the current lunar phase.', 'Place your crystal in a safe, care-appropriate setting.', 'Reflect, journal, and return the piece to everyday wear.'],
  },
  'connect-crystal-care-faq': {
    title: 'Crystal Care FAQ: Meanings, Wearing & Cleansing',
    description: 'Answers to common questions about crystal meanings, choosing a bracelet, wearing crystals, cleansing, and care.',
    keywords: ['crystal meanings', 'crystal bracelet', 'how to cleanse crystals', 'crystals for beginners'],
    faq: [
      ['How do I choose a crystal bracelet?', 'Start with your intention, comfort, material, and care requirements.'],
      ['How do I cleanse crystals?', 'Use a mineral-safe method such as a soft cloth, moonlight, sound, or dry selenite.'],
    ],
  },
}

function productSeo(product, id, category) {
  const legacySeo = {
    'chakra-test': {
      title: 'Seven Chakra Crystal Bracelet Guide & Quiz',
      keywords: ['seven chakra bracelet', 'chakra stones meaning', '7 chakras and their meanings'],
    },
    'crown-clear-quartz': {
      title: 'Crown Chakra Clear Quartz Bracelet Meaning & Benefits',
      keywords: ['crown chakra bracelet', 'clear quartz meaning', 'crown chakra crystals'],
    },
  }[id]
  if (legacySeo) {
    return legacySeo
  }

  const source = `${product?.name || ''} ${id}`.toLowerCase()
  const rules = [
    [/amethyst/, 'Amethyst Bracelet Meaning & Benefits', ['amethyst meaning', 'amethyst benefits', 'healing crystal bracelet']],
    [/rose.?quartz/, 'Rose Quartz Bracelet for Love & Emotional Balance', ['rose quartz meaning', 'crystals for love', 'crystal bracelet']],
    [/citrine|yellow crystal|golden.*quartz/, 'Citrine Crystal Bracelet for Confidence & Wealth', ['citrine meaning', 'crystals for wealth', 'crystal bracelet']],
    [/moonstone/, 'Moonstone Jewelry for Intuition & Emotional Balance', ['moonstone meaning', 'moonstone necklace', 'healing crystals']],
    [/garnet|agate|cinnabar|obsidian/, 'Grounding Crystal Bracelet for Protection & Stability', ['crystals for protection', 'grounding crystals', 'crystal bracelet']],
    [/aquamarine|blue|fluorite/, 'Crystal Bracelet for Calm Expression & Clarity', ['crystal bracelet', 'crystals for anxiety', 'crystal meanings']],
    [/love|heart|rose|strawberry/, 'Crystal Bracelet for Love & Relationships', ['crystal for love', 'best crystal for love and relationships', 'crystal bracelet']],
    [/wealth|fortune|prosperity|money|citrine|tiger.?s.eye/, 'Crystal Bracelet for Wealth & Good Fortune', ['crystal for money and wealth', 'crystals for money manifestation', 'crystal for good luck and success']],
    [/protect|guardian|obsidian|black/, 'Protective Crystal Bracelet for Negative Energy', ['crystal for protection from negative energy', 'crystals for negative energy protection', 'grounding crystals']],
    [/sleep|calm|peace|moon/, 'Crystal Jewelry for Calm, Sleep & Reflection', ['crystal for sleep', 'best crystals for restful sleep', 'moonstone meaning']],
  ]
  const matched = rules.find(([pattern]) => pattern.test(source))
  const fallbackName = englishProductName(product || { id, name: '' })
  const safeFallbackName =
    fallbackName && !/^(?:crystal talisman|crystal jewelry)$/i.test(fallbackName.trim())
      ? fallbackName
      : `${category} Crystal Bracelet`
  // A legacy record without a keyword match must still produce a complete
  // title. Empty titles create broken snippets such as “Meaning & Benefits”.
  const title =
    matched?.[1] ||
    `${safeFallbackName.replace(/\s*·\s*[a-z]\d[\w -]*$/i, '').trim()} Meaning & Benefits`
  const keywords = [...(matched?.[2] || []), category.toLowerCase(), 'crystal jewelry']
  return {
    title: title || `${category} Crystal Bracelet Meaning & Benefits`,
    keywords: [...new Set(keywords.filter(Boolean))],
  }
}

const LEGAL = {
  privacy: ['Privacy Policy', 'How Lunar Talisman collects, protects, and uses customer information.'],
  terms: ['Terms of Service', 'The terms that govern browsing, orders, delivery, and support at Lunar Talisman.'],
  shipping: ['Shipping Policy', 'Handling, tracking, international delivery, and shipping information for Lunar Talisman.'],
  refund: ['Refund & Returns', 'Return and refund guidance for Lunar Talisman crystal jewelry orders.'],
  contact: ['Contact Lunar Talisman', 'Contact Lunar Talisman for orders, products, collaborations, delivery, and support.'],
}

const LEGACY_PRODUCTS = {
  'heart-rose-quartz': {
    name: 'Heart Healing Rose Quartz Bracelet',
    category: 'Heart Chakra Crystal Jewelry',
    price: 169,
    description: "Rose quartz is the heart chakra's signature stone, traditionally believed to open the heart and draw in unconditional love. Every bead in this bracelet is cleansed under the full moon before it reaches you.",
    image: 'https://images.unsplash.com/photo-1605100802531-9abce0fdda72?w=600',
  },
  'solar-citrine': {
    name: 'Solar Plexus Citrine Courage Bracelet',
    category: 'Solar Plexus Chakra Crystal Jewelry',
    price: 179,
    description: 'Citrine resonates with the solar plexus chakra — the crystal embodiment of confidence and action. It is traditionally said to strengthen decisiveness and dissolve self-doubt, and its energy is amplified by a full moon blessing.',
    image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=600',
  },
  'new-moon-set': {
    name: 'New Moon Ritual Cleansing Set',
    category: 'Lunar Ritual Set',
    price: 129,
    description: 'A new moon ritual set: clear quartz bracelet, white sage bundle, and ritual guide card. Clear quartz is the crown chakra’s high-vibration stone, believed to resonate with moonlight on the new moon night.',
    image: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600',
  },
  'root-garnet': {
    name: 'Root Chakra Garnet Grounding Bracelet',
    category: 'Root Chakra Crystal Jewelry',
    price: 174,
    description: 'Red garnet resonates with the root chakra, helping you feel anchored, secure, and steady. Traditionally said to bring a sense of safety, it is a grounding companion for anxious or uncertain days.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600',
  },
  'full-moon-necklace': {
    name: 'Full Moon Moonstone Blessing Necklace',
    category: 'Lunar Crystal Jewelry',
    price: 189,
    description: 'A moonstone necklace blessed on the night of the full moon. Moonstone is traditionally associated with the crown and third eye chakras and is said to sharpen intuition and inner vision. Crafted with a 925 sterling silver chain and a natural moonstone pendant.',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600',
  },
  'chakra-test': {
    name: 'Seven Chakra Crystal Bracelet',
    category: 'Chakra Crystal Jewelry',
    price: 189,
    description: 'A seven chakra crystal bracelet designed as a gentle reminder to return to balance, breath, and intentional everyday ritual.',
    image: `${SITE_ORIGIN}/og-image.svg`,
  },
  'sacral-moonstone': {
    name: 'Sacral Moonstone Flow Bracelet',
    category: 'Sacral Chakra Crystal Jewelry',
    price: 182,
  },
  'throat-aquamarine': {
    name: 'Throat Chakra Aquamarine Voice Bracelet',
    category: 'Throat Chakra Crystal Jewelry',
    price: 184,
  },
  'third-eye-amethyst': {
    name: 'Third Eye Amethyst Intuition Bracelet',
    category: 'Third Eye Chakra Crystal Jewelry',
    price: 186,
  },
  'crown-clear-quartz': {
    name: 'Crown Chakra Clear Quartz Clarity Bracelet',
    category: 'Crown Chakra Crystal Jewelry',
    price: 188,
  },
  'full-moon-ritual': {
    name: 'Full Moon Crystal Ritual Set',
    category: 'Lunar Ritual Set',
    price: 119,
  },
}

function adjustedProductPrice(value) {
  const price = Number(value)
  return Number.isFinite(price) && price < 100 ? price + 100 : price
}

function promotionSeed(id) {
  let hash = 2166136261
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function getSalePricing(id, value) {
  const originalPrice = Math.max(1, Math.round(adjustedProductPrice(value)))
  const seed = promotionSeed(String(id))
  const discountPercent =
    originalPrice > 200
      ? 20 + (seed % 11)
      : 6 + (seed % 10)
  const salePrice = Math.max(
    1,
    Math.round((originalPrice * (100 - discountPercent)) / 100),
  )
  return { originalPrice, salePrice, discountPercent }
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function englishProductName(product) {
  if (!CJK.test(product.name)) return product.name
  const chakra = Object.entries(CHAKRA_BY_PREFIX).find(([prefix]) =>
    product.id.startsWith(`${prefix}-`),
  )?.[1]
  const code = product.id
    .split('-')
    .filter((part) => /[a-z]|\d/i.test(part))
    .slice(-3)
    .join(' ')
  return `${chakra || 'Crystal'} Talisman${code ? ` · ${code}` : ''}`
}

function readGuides() {
  const source = fs.readFileSync(guidesPath, 'utf8')
  const assignment = 'export const importedSeriesGuides: ImportedSeriesGuide[] = '
  const start = source.indexOf(assignment)
  if (start < 0) throw new Error('Could not locate imported guide data.')
  const guides = JSON.parse(source.slice(start + assignment.length).trim())
  return new Map(guides.map((guide) => [guide.id, guide]))
}

function readGuideSeo() {
  const source = fs.readFileSync(guideSeoPath, 'utf8')
  const assignment = 'export const GUIDE_SEO_META: Record<string, GuideSeoRecord> = '
  const start = source.indexOf(assignment)
  if (start < 0) throw new Error('Could not locate guide SEO metadata.')
  return JSON.parse(source.slice(start + assignment.length).trim())
}

function readImportedProducts() {
  const source = fs.readFileSync(productsPath, 'utf8')
  const assignment = 'export const importedProducts: ImportedProduct[] = '
  const start = source.indexOf(assignment)
  if (start < 0) throw new Error('Could not locate imported product data.')
  const jsonStart = start + assignment.length
  const end = source.lastIndexOf('\n]')
  if (end < jsonStart) throw new Error('Could not parse imported product data.')
  const products = JSON.parse(source.slice(jsonStart, end + 2))
  return new Map(products.map((product) => [product.id, product]))
}

function guideSeo(guide) {
  const source = `${guide?.id || ''} ${guide?.title || ''}`.toLowerCase()
  if (/faq|常见问题/.test(source)) {
    return {
      title: 'Crystal Care FAQ: Meanings, Wearing & Cleansing',
      description: 'Answers to common questions about crystal meanings, choosing a bracelet, wearing crystals, cleansing, and care.',
      faq: [
        ['How do I choose a crystal bracelet?', 'Start with your intention, comfort, material, and care requirements.'],
        ['How do I cleanse crystals?', 'Use a mineral-safe method such as a soft cloth, moonlight, sound, or dry selenite.'],
      ],
    }
  }
  if (/clean|care|净化|养护/.test(source)) {
    return {
      title: 'How to Cleanse Crystals at Home',
      description: 'Learn safe ways to cleanse crystals at home with moonlight, selenite, sound, and mineral-aware care.',
      howTo: ['Identify whether the mineral is water-safe.', 'Choose a gentle method such as moonlight, sound, or a dry selenite setting.', 'Wipe and store the crystal safely before your next ritual.'],
    }
  }
  if (/charge|moon[- ]phase|new.?moon|full.?moon|月相|新月|满月/.test(source)) {
    return {
      title: /new.?moon|新月/.test(source) ? 'New Moon Crystal Ritual Guide' : /full.?moon|满月/.test(source) ? 'Full Moon Crystal Ritual Guide' : 'Moon Phases & Crystal Rituals',
      description: 'Use moon phases as a reflective rhythm for crystal intention setting, cleansing, charging, and release.',
      howTo: ['Choose an intention that fits the current lunar phase.', 'Place your crystal in a safe, care-appropriate setting.', 'Reflect, journal, and return the piece to everyday wear.'],
    }
  }
  return null
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function renderGuideMarkdown(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n')
  const output = []
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`)
      paragraph = []
    }
  }
  const flushList = () => {
    if (!list) return
    output.push(`<${list.ordered ? 'ol' : 'ul'}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${list.ordered ? 'ol' : 'ul'}>`)
    list = null
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }
    const heading = line.match(/^(#{2,3})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      flushList()
      output.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`)
      continue
    }
    if (line.startsWith('# ')) {
      flushParagraph()
      flushList()
      continue
    }
    if (line.startsWith('>')) {
      flushParagraph()
      flushList()
      output.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>`)
      continue
    }
    const listItem = line.match(/^([-*]|\d+\.)\s+(.+)$/)
    if (listItem) {
      flushParagraph()
      const ordered = /^\d+\./.test(listItem[1])
      if (!list || list.ordered !== ordered) {
        flushList()
        list = { ordered, items: [] }
      }
      list.items.push(listItem[2])
      continue
    }
    if (line.startsWith('|')) {
      flushParagraph()
      flushList()
      const rows = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        const row = lines[index].trim().split('|').slice(1, -1).map((cell) => cell.trim())
        if (!row.every((cell) => /^[-: ]+$/.test(cell))) rows.push(row)
        index += 1
      }
      index -= 1
      if (rows.length) {
        output.push(`<table><tbody>${rows.map((row, rowIndex) => `<tr>${row.map((cell) => `<${rowIndex === 0 ? 'th' : 'td'}>${inlineMarkdown(cell)}</${rowIndex === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</tbody></table>`)
      }
      continue
    }
    paragraph.push(line)
  }
  flushParagraph()
  flushList()
  return output.join('\n')
}

function faqGraphNode(faq) {
  if (!faq || typeof faq !== 'object') return null
  const { ['@context']: _context, ...node } = faq
  return node
}

function routeMeta(route, guides, productMap) {
  const normalizedRoute = route === '/' ? '/' : route.replace(/\/+$/, '')

  if (normalizedRoute === '/') {
    return {
      kind: 'website',
      title: 'Lunar Talisman · Crystal Jewelry & Chakra Rituals',
      description:
        'Discover crystal jewelry, chakra bracelets, gemstone talismans, lunar rituals, and practical crystal guides from Lunar Talisman.',
      heading: 'Lunar Talisman Crystal Jewelry & Chakra Rituals',
      copy: 'Explore crystal talismans, chakra collections, lunar rituals, and gemstone bracelet guides.',
    }
  }

  if (normalizedRoute.startsWith('/detail/')) {
    const id = normalizedRoute.slice('/detail/'.length)
    const product = productMap.get(id)
    const legacyProduct = LEGACY_PRODUCTS[id]
    const chakra = Object.entries(CHAKRA_BY_PREFIX).find(([prefix]) =>
      id.startsWith(`${prefix}-`),
    )?.[1]
    const name = product
      ? englishProductName(product)
      : legacyProduct?.name || `Crystal Talisman · ${id.replaceAll('-', ' ')}`
    const category = legacyProduct?.category || chakra || 'Crystal Jewelry'
    const price = getSalePricing(
      id,
      product?.price || legacyProduct?.price || 89,
    ).salePrice.toFixed(2)
    const imagePaths = product?.images?.length ? product.images : product?.image ? [product.image] : []
    const images = imagePaths.length
      ? imagePaths.map((image) => (image.startsWith('http') ? image : `${SITE_ORIGIN}${image}`))
      : legacyProduct?.image ? [legacyProduct.image] : [`${SITE_ORIGIN}/og-image.svg`]
    const seo = productSeo(product, id, category)
    const productSeriesPrefix = Object.keys(CHAKRA_BY_PREFIX).find((prefix) =>
      id.startsWith(`${prefix}-`),
    )
    const intro = product?.tagline?.trim() || legacyProduct?.description || `${seo.title}. A ${category.toLowerCase()} piece for mindful ritual and everyday wear.`
    const description = intro.slice(0, 155)
    return {
      kind: 'product',
      title: `${name} | Lunar Talisman`,
      description,
      heading: name,
      copy: `${description} Available from Lunar Talisman for $${price} USD.`,
      product: {
        name,
        price,
        category,
        sku: id,
        images,
        tagline: intro,
        material: product?.material || `A thoughtfully finished ${category.toLowerCase()} piece selected for comfortable everyday wear and reflective ritual.`,
        energy: product?.energy || [
          `This ${category.toLowerCase()} talisman is designed as a visible reminder to pause, notice your intention, and return to a steadier rhythm.`,
          'Use it during meditation, journaling, moon rituals, or any quiet transition where a tactile cue helps you stay present.',
          'Its color, texture, and natural variation invite a slower kind of attention: notice what you feel, name what matters, and let the ritual remain practical.',
          'There is no required belief system. Treat the piece as a personal symbol that helps you make space for calm, courage, connection, or renewal.',
        ],
        benefits: product?.benefits || [
          'Offers a tangible focus for mindful intention setting.',
          'Layers easily into an everyday jewelry ritual.',
          'Makes a meaningful companion for reflection and personal growth.',
          'Creates a simple tactile cue for returning to your chosen intention throughout the day.',
        ],
        howToWear: product?.howToWear || [
          'Wear it on the wrist or keep it nearby during a reflective practice.',
          'Pair it with a simple breath, journaling prompt, or lunar ritual.',
        ],
        careRitual: product?.careRitual || [
          'Wipe gently with a soft dry cloth and store away from hard surfaces.',
          'For a reset, place it on a clean cloth under moonlight and set a quiet intention.',
        ],
        specs: product?.specs || [category, 'Natural crystal or gemstone', 'Mindful everyday wear'],
        keywords: seo.keywords,
        seriesPath: productSeriesPrefix ? `series/chakra-${productSeriesPrefix}` : 'series/crystals',
      },
    }
  }

  if (normalizedRoute.startsWith('/guide/')) {
    const guide = guides.get(normalizedRoute.slice('/guide/'.length))
    const guideId = normalizedRoute.slice('/guide/'.length)
    const seo = guideSeoMap[guideId] || GUIDE_SEO_BY_ID[guideId] || guideSeo(guide)
    const title = seo?.title || guide?.title || 'Crystal Ritual Guide'
    const description = seo?.description || (guide
      ? `${guide.title}: ${guide.excerpt}`
      : 'A practical Lunar Talisman guide to crystal rituals, chakra reflection, and mindful jewelry.')
    return {
      kind: 'article',
      title: `${title} | Lunar Talisman`,
      description,
      heading: title,
      copy: description,
      article: {
        title,
        series: guide?.series || 'crystals',
        markdown: guide?.markdown || '',
        howTo: seo?.howTo,
        faq: seo?.faq,
        keywords: seo?.keywords || [],
      },
    }
  }

  if (normalizedRoute.startsWith('/series/')) {
    const id = normalizedRoute.slice('/series/'.length)
    const chakraId = id.replace(/^chakra-/, '')
    const guideIdByChakra = {
      root: 'worlds-01',
      sacral: 'worlds-02',
      solar: 'worlds-03',
      heart: 'worlds-04',
      throat: 'worlds-05',
      'third-eye': 'worlds-06',
      crown: 'worlds-07',
    }
    const chakraGuide = guideIdByChakra[chakraId] ? guides.get(guideIdByChakra[chakraId]) : null
    const chakra = CHAKRA_BY_PREFIX[chakraId]
      const data = chakra
      ? {
          title: CHAKRA_SEO[chakraId]?.title || `${chakra} Crystal Collection`,
          description: CHAKRA_SEO[chakraId]?.description || `Explore ${chakra} bracelets and crystal talismans curated for mindful ritual, reflection, and everyday wear.`,
          keywords: CHAKRA_SEO[chakraId]?.keywords || [chakra.toLowerCase(), 'chakra stones', 'crystal bracelet'],
        }
      : SERIES_SEO[id] || SERIES[id] || SERIES.crystals
    return {
      kind: 'collection',
      title: `${data.title} | Lunar Talisman`,
      description: data.description,
      heading: data.title,
      copy: data.description,
      collection: data.title,
      keywords: data.keywords || CORE_KEYWORDS,
      intro: chakraGuide?.markdown || '',
    }
  }

  if (normalizedRoute.slice(1) in LEGAL) {
    const [title, description] = LEGAL[normalizedRoute.slice(1)]
    return { kind: 'page', title: `${title} | Lunar Talisman`, description, heading: title, copy: description }
  }

  return {
    kind: 'page',
    title: 'Lunar Talisman · Crystal Jewelry & Chakra Rituals',
    description:
      'Discover crystal jewelry, chakra bracelets, gemstone talismans, lunar rituals, and practical crystal guides from Lunar Talisman.',
    heading: 'Lunar Talisman',
    copy: 'Discover crystal talismans, lunar rituals, and chakra guidance.',
  }
}

function structuredData(meta, canonicalUrl) {
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Lunar Talisman', item: `${SITE_ORIGIN}/` },
      ...(meta.kind === 'product'
        ? [{ '@type': 'ListItem', position: 2, name: meta.product.category, item: `${SITE_ORIGIN}/${meta.product.seriesPath || 'series/crystals'}/` }, { '@type': 'ListItem', position: 3, name: meta.product.name, item: canonicalUrl }]
        : meta.kind === 'collection'
          ? [{ '@type': 'ListItem', position: 2, name: meta.collection, item: canonicalUrl }]
          : meta.kind === 'article'
            ? [{ '@type': 'ListItem', position: 2, name: 'Crystal Guides', item: `${SITE_ORIGIN}/series/worlds/` }, { '@type': 'ListItem', position: 3, name: meta.article.title, item: canonicalUrl }]
            : []),
    ],
  }
  if (meta.kind === 'product') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: meta.product.name,
      description: meta.description,
      sku: meta.product.sku,
      category: meta.product.category,
      keywords: meta.product.keywords,
      image: meta.product.images,
      brand: { '@type': 'Brand', name: 'Lunar Talisman' },
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'USD',
        price: meta.product.price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
      breadcrumb,
    }
  }
  if (meta.kind === 'article') {
    const graph = [
      {
        '@type': 'Article',
        headline: meta.article.title,
        description: meta.description,
        keywords: meta.article.keywords || [],
        mainEntityOfPage: canonicalUrl,
        author: { '@type': 'Organization', name: 'Lunar Talisman' },
        publisher: { '@type': 'Organization', name: 'Lunar Talisman', url: SITE_ORIGIN },
        isPartOf: { '@type': 'CollectionPage', name: `${meta.article.series} crystal guides` },
      },
      breadcrumb,
    ]
    if (meta.article.howTo) {
      graph.push({
        '@type': 'HowTo',
        name: meta.article.title,
        description: meta.description,
        step: meta.article.howTo.map((text, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          text,
        })),
      })
    }
    if (meta.article.faq) {
      graph.push(
        Array.isArray(meta.article.faq)
          ? {
              '@type': 'FAQPage',
              mainEntity: meta.article.faq.map(([question, answer]) => ({
                '@type': 'Question',
                name: question,
                acceptedAnswer: { '@type': 'Answer', text: answer },
              })),
            }
          : faqGraphNode(meta.article.faq),
      )
    }
    return { '@context': 'https://schema.org', '@graph': graph }
  }
  if (meta.kind === 'collection') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: meta.collection,
      description: meta.description,
      url: canonicalUrl,
      isPartOf: { '@type': 'WebSite', name: 'Lunar Talisman', url: SITE_ORIGIN },
      keywords: meta.keywords,
      breadcrumb,
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.heading,
    description: meta.description,
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: 'Lunar Talisman', url: SITE_ORIGIN },
    breadcrumb,
  }
}

function renderPage(template, route, meta) {
  const canonicalRoute = route === '/' ? '/' : `${route.replace(/\/+$/, '')}/`
  const canonicalUrl = `${SITE_ORIGIN}${canonicalRoute}`
  const jsonLd = JSON.stringify(structuredData(meta, canonicalUrl)).replaceAll('<', '\\u003c')
  const head = `
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="en" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />
    <meta property="og:type" content="${meta.kind === 'product' ? 'product' : 'website'}" />
    <meta property="og:site_name" content="Lunar Talisman" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${meta.kind === 'product' && meta.product.images?.[0] ? escapeHtml(meta.product.images[0]) : `${SITE_ORIGIN}/og-image.svg`}" />
    <meta property="og:image:alt" content="Lunar Talisman crystal jewelry and chakra rituals" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${meta.kind === 'product' && meta.product.images?.[0] ? escapeHtml(meta.product.images[0]) : `${SITE_ORIGIN}/og-image.svg`}" />
    <script id="lunar-talisman-page-jsonld" type="application/ld+json">${jsonLd}</script>`
  const fallback =
    meta.kind === 'article'
      ? `<main style="max-width:900px;margin:72px auto;padding:24px;font-family:system-ui,sans-serif;color:#3a2530"><article><h1>${escapeHtml(meta.heading)}</h1><p>${escapeHtml(meta.description)}</p><div class="guide-content">${renderGuideMarkdown(meta.article?.markdown || '')}</div><p><a href="${SITE_ORIGIN}/series/${escapeHtml(meta.article?.series || 'crystals')}/">Browse related crystal guides</a></p></article></main>`
      : meta.kind === 'product'
        ? `<main style="max-width:900px;margin:72px auto;padding:24px;font-family:system-ui,sans-serif;color:#3a2530"><article data-no-auto-translate="true"><h1>${escapeHtml(meta.heading)}</h1><p>${escapeHtml(meta.product.tagline || meta.description)}</p>${meta.product.material ? `<h2>Material</h2><p>${escapeHtml(meta.product.material)}</p>` : ''}${meta.product.energy?.length ? `<h2>Energy &amp; Meaning</h2>${meta.product.energy.map((item) => `<p>${escapeHtml(item)}</p>`).join('')}` : ''}${meta.product.benefits?.length ? `<h2>Benefits</h2><ul>${meta.product.benefits.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${meta.product.howToWear?.length ? `<h2>How to wear</h2><ul>${meta.product.howToWear.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${meta.product.careRitual?.length ? `<h2>Care &amp; ritual</h2><ul>${meta.product.careRitual.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${meta.product.specs?.length ? `<h2>Specs</h2><ul>${meta.product.specs.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}<h2>Ritual context</h2><p>This piece is made for an intentional everyday rhythm: a small, tactile reminder to pause before a decision, return to your breath, and notice what your body and attention are asking for. Wear it alongside journaling, meditation, a quiet walk, or a moon-phase practice. Crystal traditions are personal and symbolic; there is no single required way to work with a stone. Let the color, texture, and weight become part of a routine that feels honest, practical, and easy to repeat.</p><p>Over time, the meaning of a talisman can deepen through use. Keep the bracelet or necklace close to the moments you want to remember, and allow your own experience to guide how often you wear, rest, cleanse, and store it.</p></article></main>`
        : meta.kind === 'collection'
          ? `<main style="max-width:900px;margin:72px auto;padding:24px;font-family:system-ui,sans-serif;color:#3a2530"><article data-no-auto-translate="true"><h1>${escapeHtml(meta.heading)}</h1><p>${escapeHtml(meta.description)}</p><div class="guide-content">${renderGuideMarkdown(meta.intro || '')}</div></article></main>`
      : `<main style="max-width:760px;margin:72px auto;padding:24px;font-family:system-ui,sans-serif;color:#3a2530"><h1>${escapeHtml(meta.heading)}</h1><p>${escapeHtml(meta.copy)}</p><p><a href="${SITE_ORIGIN}/series/crystals/">Browse crystal talismans</a> · <a href="${SITE_ORIGIN}/series/chakra/">Explore chakra collections</a></p></main>`

  return template
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?>/i, '')
    .replace(/<meta\s+name="robots"[\s\S]*?>/i, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?>/i, '')
    .replace(/<link\s+rel="alternate"[\s\S]*?>/i, '')
    .replace(/<meta\s+property="og:[^"]+"[\s\S]*?>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?>/gi, '')
    .replace(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace('</head>', `${head}\n  </head>`)
    // index.html contains a small semantic homepage fallback inside #root.
    // Replace the complete root contents for every generated route so a
    // product/guide page never inherits the homepage H1.
    .replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${fallback}</div>`)
}

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  throw new Error('dist/index.html is missing. Run this script after vite build.')
}

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
const routes = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>https:\/\/lunartalisman\.com([^<]*)<\/loc>/g)]
  .map((match) => match[1] || '/')
  .filter((route) => route !== '/')
const guides = readGuides()
const guideSeoMap = readGuideSeo()
const productMap = readImportedProducts()

for (const route of routes) {
  const targetDir = path.join(distDir, route.replace(/^\//, ''))
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, 'index.html'), renderPage(template, route, routeMeta(route, guides, productMap)))
}

console.log(`Generated ${routes.length} static SEO route pages.`)
