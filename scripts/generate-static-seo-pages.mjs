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
const SITE_DESCRIPTION =
  'Discover crystal jewelry, chakra bracelets, gemstone talismans, lunar rituals, and practical crystal guides from Lunar Talisman.'

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

const MAIN_SERIES_IDS = ['worlds', 'collections', 'rituals', 'chakra', 'lunar', 'crystals', 'connect']
const CHAKRA_IDS = ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown']

const SERIES_GUIDE_MAP = {
  worlds: ['chakra-seven-chakras-explained', 'crystals-00', 'connect-03', 'rituals-moon-phase-guide', 'crystals-06'],
  collections: ['crystals-00', 'crystals-04', 'crystals-05', 'crystals-06', 'connect-03'],
  rituals: ['rituals-01', 'rituals-02', 'rituals-05', 'rituals-06', 'rituals-moon-phase-guide'],
  chakra: ['chakra-seven-chakras-explained', 'crystals-02', 'crystals-04', 'crystals-05', 'connect-crystal-care-faq'],
  lunar: ['rituals-01', 'rituals-02', 'rituals-05', 'rituals-06', 'rituals-moon-phase-guide'],
  crystals: ['crystals-00', 'crystals-02', 'crystals-03', 'crystals-04', 'crystals-05', 'crystals-06'],
  connect: ['connect-00', 'connect-01', 'connect-02', 'connect-03', 'connect-04', 'connect-05'],
  root: ['chakra-seven-chakras-explained', 'crystals-02', 'connect-crystal-care-faq', 'rituals-05', 'worlds-08'],
  sacral: ['chakra-seven-chakras-explained', 'crystals-03', 'connect-03', 'rituals-01', 'rituals-02'],
  solar: ['chakra-seven-chakras-explained', 'crystals-03', 'connect-03', 'rituals-06', 'crystals-06'],
  heart: ['chakra-seven-chakras-explained', 'crystals-04', 'connect-03', 'rituals-02', 'crystals-06'],
  throat: ['chakra-seven-chakras-explained', 'crystals-05', 'connect-04', 'rituals-05', 'crystals-06'],
  'third-eye': ['chakra-seven-chakras-explained', 'crystals-05', 'connect-01', 'connect-02', 'rituals-06'],
  crown: ['chakra-seven-chakras-explained', 'crystals-06', 'connect-02', 'rituals-06', 'connect-crystal-care-faq'],
}

const LEGAL_STATIC_CONTENT = {
  privacy: {
    eyebrow: 'Privacy',
    preface: [
      'This policy explains, in plain language, how Lunar Talisman handles the information needed to process orders, answer questions, and keep the site safe. It is written as a practical operating draft, with room for customer-facing refinements later.',
      'We collect only the information that supports the purchase journey: contact details, delivery information, order notes, and limited technical signals that help us detect fraud, measure basic site performance, and respond to support requests.',
    ],
    sections: [
      {
        title: 'Information we collect',
        body: [
          'When you place an order, subscribe to updates, or contact us, we may collect your name, email address, delivery address, order number, selected shipping method, and any message you choose to send. We may also receive basic browser and device information that helps the site load correctly and detect misuse.',
          'We do not intentionally request sensitive information that is not needed to complete an order. If a customer includes extra personal detail in a message, we only use it to handle that specific request and do not repurpose it for unrelated marketing.',
        ],
      },
      {
        title: 'How we use information',
        body: [
          'We use order data to fulfill purchases, send confirmation and shipping updates, answer support questions, and coordinate returns or refunds when they are appropriate. Limited browsing data helps us understand which pages load correctly, which pages are visited most often, and whether the storefront is behaving as expected.',
          'We may also use information to protect the site from spam, account abuse, payment issues, or suspicious behavior. We do not sell personal data, and we do not use order details to make public claims about a customer or their purchases.',
        ],
      },
      {
        title: 'Storage and sharing',
        body: [
          'Order and support records may be stored with trusted service providers that help us run the site, process payments, or send email. Those providers are used only for operational purposes and should not use your data for unrelated advertising.',
          'We keep records only as long as reasonably needed for the sale, support, accounting, dispute handling, and legal obligations that apply to the business. When records are no longer needed, we delete or anonymize them where practical.',
        ],
      },
      {
        title: 'Your choices',
        body: [
          'You may ask us to correct your information, update a delivery detail, or stop receiving non-transactional emails. If you would like a copy of your order history or need a privacy request, contact us using the address on the Contact page and include enough detail to verify your request.',
          'If this policy changes, the updated version will be posted here with the revised wording that applies going forward. Minor editorial changes may not affect how existing order records are handled.',
        ],
      },
    ],
    footerNote:
      'This draft focuses on practical operations rather than legalese. A final version can be reviewed by counsel before launch in each target region.',
  },
  terms: {
    eyebrow: 'Terms',
    preface: [
      'By browsing, ordering, or contacting Lunar Talisman, you agree to use the site in a respectful and practical way. This page is an operational draft for a cross-border storefront and should be refined before launch in each market.',
      'Product pages may describe crystals and rituals in traditional, symbolic language. Those descriptions are part of the brand voice and are not promises of medical, psychological, or financial outcomes.',
    ],
    sections: [
      {
        title: 'Products and natural variation',
        body: [
          'Natural crystals are not machine-made. Beads can differ in color depth, inclusions, texture, polish, and shape. Those differences are part of the product, not defects, unless the page or customer service message identifies a specific issue that materially changes the item from the description.',
          'Because this is a handmade and natural-stone catalog, photos are meant to show the general appearance of a piece rather than a mathematically identical copy of every bead. We aim to keep the storefront honest and clear, and we will correct a page if a real mistake is found.',
        ],
      },
      {
        title: 'Order responsibilities',
        body: [
          'Please review the item name, quantity, price, shipping destination, and contact information before submitting an order. If you notice a mistake, contact us quickly so we can try to help before fulfillment begins.',
          'If a parcel cannot be delivered because an address was entered incorrectly or a recipient does not collect it, extra shipping or return charges may apply. The exact outcome depends on the carrier and destination country.',
        ],
      },
      {
        title: 'Disclaimer for crystal content',
        body: [
          'Crystal and energy-related statements on this site are traditional beliefs, symbolic language, and personal ritual guidance. They are not medical advice, psychological advice, or a substitute for professional care.',
          'Our jewelry is not a medical device. If you have a health concern, please speak with a qualified professional rather than relying on a bracelet, stone, or ritual to solve the issue.',
        ],
      },
      {
        title: 'Use of the website',
        body: [
          'You may not misuse the site, attempt unauthorized access, scrape data in ways that disrupt service, or use the storefront in a manner that violates applicable laws. We may update or remove site content when needed for safety, accuracy, or business operations.',
          'These terms are written in a simple draft form. If additional legal wording is needed for your jurisdiction, it can be added later without changing the product catalog or core shopping flow.',
        ],
      },
    ],
    footerNote: 'TBD: final governing-law, dispute-resolution, and regional compliance language can be added once the launch jurisdictions are confirmed.',
  },
  shipping: {
    eyebrow: 'Shipping',
    preface: [
      'Each order is prepared with care after payment is confirmed. This policy covers handling, transit, tracking, missing parcels, and the practical realities of international delivery. It intentionally avoids promises that depend on a specific carrier or destination.',
      'Estimated delivery times are always approximate. Customs, weather, peak seasons, local strikes, and address problems can all change the schedule, so the checkout page or support team may need to give the final word for a specific order.',
    ],
    sections: [
      {
        title: 'Processing and handling',
        body: [
          'Most standard pieces are prepared within a few business days, while ritual batches or high-volume periods may take longer. If an item is made around a new moon or full moon rhythm, the page or product note will say so when relevant.',
          'Once the parcel is packed, we send the order into the shipping queue and mark the fulfillment status so the customer can follow the next step. If a delay occurs, we try to communicate it early rather than waiting for a frustrated reply.',
        ],
      },
      {
        title: 'Tracking and delivery',
        body: [
          'When a carrier accepts the parcel, tracking details can be shared through the order status page or by email if the checkout flow stores an address the customer can use. Delivery windows vary by region, service level, and customs processing.',
          'If a parcel appears stalled, we recommend checking the tracking page first, then contacting us with the order number if the carrier has not moved the package for an unusually long period.',
        ],
      },
      {
        title: 'Lost, delayed, or returned parcels',
        body: [
          'If a parcel is marked delivered but cannot be found, please check nearby delivery points and with household members before opening a support request. If the parcel is delayed beyond a reasonable window, contact us and we will help review the carrier notes.',
          'If a parcel is returned because of an invalid address or failed delivery attempt, we may need to charge for reshipment or handle the order on a case-by-case basis. The exact resolution depends on the country, parcel status, and what the carrier reports.',
        ],
      },
      {
        title: 'International notes',
        body: [
          'Import duties, customs fees, and local taxes are usually the recipient’s responsibility unless a checkout note says otherwise. Some countries inspect parcels more slowly than others, and that timing is outside our direct control.',
          'If you need a shipping estimate before ordering, use the destination section of the checkout flow or contact support for the current service options available to your region.',
        ],
      },
    ],
    footerNote: 'TBD: shipping thresholds, free-delivery promotions, and region-specific carriers can be added later without changing the core policy structure.',
  },
  refund: {
    eyebrow: 'Refund',
    preface: [
      'Our goal is to ship the right item in the right condition, and to make return or refund handling straightforward when something clearly goes wrong. This draft uses a standard 30-day style window with room for order-specific review.',
      'Because crystal jewelry is natural and often handmade, some variation is expected. Returns are generally reserved for incorrect, damaged, or materially misdescribed items rather than personal preference alone.',
    ],
    sections: [
      {
        title: 'When refunds or returns may apply',
        body: [
          'If an item arrives damaged, materially incorrect, or clearly different from what was ordered, contact us promptly with photos and the order number. We usually ask customers to reach out within a reasonable window after delivery so the issue can be checked while the parcel details are still fresh.',
          'If the issue is confirmed, we may offer a replacement, exchange, or refund depending on the situation and the available stock. Some cases can be solved faster with a partial solution, but the goal is always to reach a fair result.',
        ],
      },
      {
        title: 'What is usually excluded',
        body: [
          'Worn items, personalized or custom ritual pieces, and requests based only on natural color variation are usually not eligible for return. Those characteristics are part of working with natural stone and handcrafted jewelry.',
          'If a product page notes a special batch, a limited ritual release, or another non-returnable condition, that note should be read together with this policy. The product page always has priority for a specific item-level rule.',
        ],
      },
      {
        title: 'How the process works',
        body: [
          'Keep the original packaging, the item photos, and the order record. Send them with your message so the support team can compare the claim against the shipping and product notes. Clear photos help more than a long explanation alone.',
          'After review, we may ask for the item to be returned, or we may resolve the case without a return if the evidence makes that reasonable. The exact path depends on the condition, the order value, and the region involved.',
        ],
      },
      {
        title: 'Refund timing',
        body: [
          'When a refund is approved, the timing depends on the payment provider and the customer’s bank. We cannot control how long each institution takes to release funds, but we can confirm when the refund has been initiated from our side.',
          'If the original payment was made through a third-party provider, the provider’s own settlement time may apply. We encourage customers to keep the payment receipt until the full transaction is complete.',
        ],
      },
    ],
    footerNote: 'TBD: final return-address, restocking-fee, and regional postage allocation rules can be added once the launch support workflow is finalized.',
  },
  contact: {
    eyebrow: 'Contact',
    preface: [
      'This page gives visitors a simple way to ask about orders, partnerships, delivery, or product questions. It also includes the main support email and a draft form so the site can collect requests even when the visitor prefers not to email directly.',
      'If a request is about a refund or a parcel issue, please include the order number and enough detail for support to understand the situation quickly.',
    ],
    sections: [
      {
        title: 'Customer care',
        body: [
          'Email hello@lunartalisman.com for general questions about orders, products, delivery, or the ritual guidance printed on the site. Include your order number whenever you have one, because that reduces back-and-forth and speeds up a useful reply.',
          'For most requests, one clear message is better than several short ones. Tell us what you need, what item is involved, and what outcome would be most helpful.',
        ],
      },
      {
        title: 'Partnerships and collaborations',
        body: [
          'Creators, retailers, and aligned brand partners may use the same email address to propose collaborations. A short introduction, your audience, and the idea you want to explore are usually enough for the first message.',
          'We do not promise a reply to every pitch, but we do try to read them with care and respond when the fit is clear.',
        ],
      },
      {
        title: 'Response timing',
        body: [
          'Our target response window is usually one to three business days. Busy launches, shipping peaks, and lunar batch periods can stretch that window a little, especially if the team is also processing orders.',
          'If a matter is urgent, say so in the subject line and explain why. Urgent should still be used sparingly; it helps the queue stay honest for everyone else.',
        ],
      },
      {
        title: 'Frequently asked questions',
        body: [
          'Q: How do I ask about a missing parcel? A: Send the order number, tracking number if you have it, and the shipping address used at checkout.',
          'Q: Can you help me change an address? A: Contact us as soon as possible, because address changes become harder once fulfillment has started.',
        ],
      },
    ],
    form: `
      <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" style="margin-top:22px;padding:18px;border-radius:24px;border:1px solid rgba(58,37,48,0.12);background:rgba(255,255,255,0.9);display:grid;gap:12px">
        <input type="hidden" name="form-name" value="contact" />
        <p style="display:none"><label>Don’t fill this out if you’re human: <input name="bot-field" /></label></p>
        <h2 style="margin:0;font-size:24px">Send a support request</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
          <input name="name" placeholder="Your name" style="padding:14px 16px;border-radius:999px;border:1px solid rgba(58,37,48,0.16);font:inherit" />
          <input type="email" name="email" placeholder="Email address" required style="padding:14px 16px;border-radius:999px;border:1px solid rgba(58,37,48,0.16);font:inherit" />
        </div>
        <input name="orderId" placeholder="Order number (optional for general questions)" style="padding:14px 16px;border-radius:999px;border:1px solid rgba(58,37,48,0.16);font:inherit" />
        <textarea name="message" rows="5" placeholder="How can we help?" style="padding:14px 16px;border-radius:20px;border:1px solid rgba(58,37,48,0.16);font:inherit;resize:vertical"></textarea>
        <button type="submit" style="justify-self:start;border:0;border-radius:999px;background:#3a2530;color:#fff;padding:14px 20px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase">Send message</button>
      </form>
    `,
    footerNote: 'TBD: if a support portal or region-specific reply address is added later, this form can be swapped without changing the page structure.',
  },
}

function formatStaticPrice(value) {
  return `$${Math.max(0, Math.round(Number(value) || 0))}`
}

function htmlAttr(value = '') {
  return escapeHtml(String(value))
}

function productHref(id) {
  return `${SITE_ORIGIN}/detail/${id}/`
}

function guideHref(id) {
  return `${SITE_ORIGIN}/guide/${id}/`
}

function seriesHref(id) {
  return `${SITE_ORIGIN}/series/${id}/`
}

function selectSeriesProducts(seriesId, productMap) {
  const products = [...productMap.values()]
  if (seriesId === 'chakra') {
    return products.sort((a, b) => CHAKRA_IDS.indexOf(a.chakra) - CHAKRA_IDS.indexOf(b.chakra) || a.name.localeCompare(b.name))
  }
  if (seriesId === 'crystals' || seriesId === 'collections' || seriesId === 'worlds' || seriesId === 'connect') {
    return products.sort((a, b) => a.name.localeCompare(b.name))
  }
  if (seriesId === 'rituals' || seriesId === 'lunar') {
    return products.filter((product) => ['new-moon-set', 'full-moon-necklace'].includes(product.id))
  }
  if (seriesId.startsWith('chakra-')) {
    const chakraId = seriesId.replace(/^chakra-/, '')
    return products.filter((product) => product.chakra === chakraId)
  }
  const chakraKey = CHAKRA_IDS.includes(seriesId) ? seriesId : ''
  if (chakraKey) {
    return products.filter((product) => product.chakra === chakraKey)
  }
  return products.sort((a, b) => a.name.localeCompare(b.name))
}

function selectSeriesGuides(seriesId, guides) {
  const ids = SERIES_GUIDE_MAP[seriesId] || SERIES_GUIDE_MAP.crystals
  return ids.map((id) => guides.get(id)).filter(Boolean)
}

function resolveSeriesGuideKey(id, chakraId) {
  if (id.startsWith('chakra-')) return chakraId
  if (id === 'chakra') return 'chakra'
  return id
}

function selectFeaturedProducts(productMap) {
  const products = [...productMap.values()]
  const order = CHAKRA_IDS.flatMap((chakra) => products.filter((product) => product.chakra === chakra).slice(0, 1))
  const rituals = products.filter((product) => ['new-moon-set', 'full-moon-necklace'].includes(product.id))
  return [...order, ...rituals].slice(0, 6)
}

function selectHomepageSeriesLinks() {
  return MAIN_SERIES_IDS.map((id) => {
    const labelMap = {
      worlds: 'Crystal Journey',
      collections: 'Crystal Collections',
      rituals: 'Lunar Rituals',
      chakra: 'Chakra Healing',
      lunar: 'Lunar Rituals',
      crystals: 'Crystal Talismans',
      connect: 'Begin the Connection',
    }
    const descriptionMap = {
      worlds: 'Start with the full crystal journey and the main guide map.',
      collections: 'Browse the full catalog of jewelry, talismans, and ritual pieces.',
      rituals: 'Move between new moon, full moon, cleansing, and charging rituals.',
      chakra: 'Explore the seven chakra collections in their full sequence.',
      lunar: 'Follow the lunar rhythm through intention, release, and renewal.',
      crystals: 'Compare crystal meanings and shop the full talisman catalog.',
      connect: 'Use the quiz and care guides to choose your first piece.',
    }
    return {
      id,
      label: labelMap[id],
      description: descriptionMap[id],
      href: seriesHref(id),
    }
  })
}

function selectCrossSeriesLinks(currentSeriesId) {
  const mainLinks = MAIN_SERIES_IDS.filter((id) => id !== currentSeriesId)
  const chakraLinks =
    currentSeriesId === 'chakra' || currentSeriesId.startsWith('chakra-')
      ? CHAKRA_IDS.filter((id) => `chakra-${id}` !== currentSeriesId).map((id) => `chakra-${id}`)
      : []
  return [...mainLinks, ...chakraLinks].map((id) => ({
    id,
    label:
      id === 'chakra'
        ? 'Chakra Healing'
        : id.startsWith('chakra-')
          ? `${id.replace('chakra-', '').replace(/\b\w/g, (m) => m.toUpperCase())} Chakra`
          : id.replace(/\b\w/g, (m) => m.toUpperCase()).replace(/-/g, ' '),
    href: seriesHref(id),
    description:
      id === 'chakra'
        ? 'Open the full chakra collection and guide path.'
        : id.startsWith('chakra-')
          ? 'Move to the next chakra-specific collection.'
          : 'Continue into another catalog hub.',
  }))
}

function renderProductCard(product) {
  const image = product.image
    ? `<img src="${htmlAttr(product.image.startsWith('http') ? product.image : `${SITE_ORIGIN}${product.image}`)}" alt="${htmlAttr(product.name)}" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:18px;background:#fff" loading="lazy" />`
    : ''
  return `
    <a href="${productHref(product.id)}" style="display:grid;gap:12px;padding:16px;border-radius:24px;border:1px solid rgba(58,37,48,0.12);background:rgba(255,255,255,0.88);box-shadow:0 18px 40px rgba(58,37,48,0.08);color:#3a2530;text-decoration:none">
      ${image}
      <div style="display:grid;gap:8px">
        <h3 style="margin:0;font-size:18px;line-height:1.35">${htmlAttr(product.name)}</h3>
        <div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(58,37,48,0.56)">${htmlAttr(product.chakraName || 'Crystal')}</div>
        <div style="font-size:24px;font-weight:900;letter-spacing:-0.03em">${htmlAttr(formatStaticPrice(product.price))}</div>
      </div>
    </a>
  `
}

function renderGuideCard(guide) {
  return `
    <a href="${guideHref(guide.id)}" style="display:grid;gap:8px;padding:16px;border-radius:22px;border:1px solid rgba(58,37,48,0.12);background:rgba(255,255,255,0.88);color:#3a2530;text-decoration:none">
      <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(58,37,48,0.52)">Guide</div>
      <h3 style="margin:0;font-size:18px;line-height:1.35">${htmlAttr(guide.title)}</h3>
      <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(58,37,48,0.68)">${htmlAttr(guide.excerpt)}</p>
    </a>
  `
}

function renderSeriesLinks(seriesLinks) {
  return seriesLinks
    .map(
      (series) => `
        <a href="${series.href}" style="display:grid;gap:4px;padding:14px 16px;border-radius:18px;border:1px solid rgba(58,37,48,0.12);background:rgba(255,255,255,0.82);color:#3a2530;text-decoration:none">
          <strong style="font-size:15px">${htmlAttr(series.label)}</strong>
          <span style="font-size:13px;line-height:1.45;color:rgba(58,37,48,0.64)">${htmlAttr(series.description)}</span>
        </a>`,
    )
    .join('')
}

function renderNewsletterForm() {
  return `
    <form name="newsletter" method="POST" data-netlify="true" netlify-honeypot="bot-field" style="display:grid;gap:12px;margin-top:18px;padding:18px;border-radius:24px;border:1px solid rgba(58,37,48,0.12);background:rgba(255,255,255,0.9)">
      <input type="hidden" name="form-name" value="newsletter" />
      <p style="display:none"><label>Don’t fill this out if you’re human: <input name="bot-field" /></label></p>
      <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(58,37,48,0.56)">Newsletter</div>
      <p style="margin:0;font-size:15px;line-height:1.65;color:rgba(58,37,48,0.72)">Subscribe for moon phase notes, crystal care reminders, and product drops.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <input type="email" name="email" placeholder="your@email.com" required style="min-width:240px;flex:1;padding:14px 16px;border-radius:999px;border:1px solid rgba(58,37,48,0.16);font:inherit" />
        <button type="submit" style="border:0;border-radius:999px;background:#3a2530;color:#fff;padding:14px 20px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase">Subscribe</button>
      </div>
    </form>
  `
}

function renderHomeStatic(meta, products, guides) {
  const featured = Array.isArray(products) ? products : selectFeaturedProducts(products)
  const seriesLinks = selectHomepageSeriesLinks()
  const getGuide = (id) => (guides instanceof Map ? guides.get(id) : guides.find((guide) => guide?.id === id))
  const guideLinks = [
    getGuide('chakra-seven-chakras-explained'),
    getGuide('rituals-01'),
    getGuide('rituals-02'),
    getGuide('crystals-00'),
  ].filter(Boolean)
  return `
    <main data-no-auto-translate="true" style="max-width:1180px;margin:0 auto;padding:96px 20px 72px;font-family:system-ui,sans-serif;color:#3a2530">
      <section style="display:grid;gap:18px;align-items:start">
        <p style="margin:0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(58,37,48,0.56)">Lunar Talisman</p>
        <h1 style="margin:0;font-size:clamp(44px,7vw,84px);line-height:0.95;max-width:10ch">${htmlAttr(meta.home.heroTitle)}</h1>
        <p style="margin:0;max-width:760px;font-size:18px;line-height:1.8;color:rgba(58,37,48,0.74)">${htmlAttr(meta.home.heroDescription)}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a href="${seriesHref('chakra')}" style="padding:13px 18px;border-radius:999px;background:#3a2530;color:#fff;text-decoration:none;font-weight:900;letter-spacing:0.08em;text-transform:uppercase">Browse chakra collections</a>
          <a href="${seriesHref('crystals')}" style="padding:13px 18px;border-radius:999px;border:1px solid rgba(58,37,48,0.16);background:rgba(255,255,255,0.76);color:#3a2530;text-decoration:none;font-weight:900;letter-spacing:0.08em;text-transform:uppercase">Explore crystal talismans</a>
        </div>
      </section>

      <section style="margin-top:42px">
        <h2 style="margin:0 0 18px;font-size:28px">Start with the seven chakra paths</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">
          ${renderSeriesLinks(seriesLinks)}
        </div>
      </section>

      <section style="margin-top:48px">
        <h2 style="margin:0 0 18px;font-size:28px">Featured products</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
          ${featured.map((product) => renderProductCard(product)).join('')}
        </div>
      </section>

      <section style="margin-top:48px;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,0.9fr);gap:18px;align-items:start">
        <div style="padding:22px;border-radius:28px;background:rgba(255,255,255,0.84);border:1px solid rgba(58,37,48,0.12)">
          <h2 style="margin:0 0 14px;font-size:28px">Why people start here</h2>
          <p style="margin:0;font-size:16px;line-height:1.75;color:rgba(58,37,48,0.72)">Each talisman is shaped as a small daily cue: natural stone, hand-finished beads, and a clear page for meaning, ritual, and care. The collections are designed to help a visitor move from curiosity to a first piece without having to decode the entire catalog at once.</p>
          <ul style="margin:16px 0 0;padding-left:18px;font-size:15px;line-height:1.8;color:rgba(58,37,48,0.72)">
            <li>Natural stone, hand-finished jewelry, and ritual guidance.</li>
            <li>Visible product pages with clear materials, care, and price.</li>
            <li>Worldwide delivery, secure checkout, and support pages.</li>
          </ul>
        </div>
        <div>
          <h2 style="margin:0 0 14px;font-size:28px">Recent guide paths</h2>
          <div style="display:grid;gap:12px">
            ${guideLinks.map((guide) => renderGuideCard(guide)).join('')}
          </div>
        </div>
      </section>

      <section style="margin-top:48px">
        <h2 style="margin:0 0 14px;font-size:28px">What to expect</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
          ${[
            'Natural materials and careful finishing',
            'Crystal care, ritual, and meaning pages',
            'Worldwide shipping and order tracking',
            'Secure checkout and customer support',
          ]
            .map((item) => `<div style="padding:16px;border-radius:18px;background:rgba(255,255,255,0.8);border:1px solid rgba(58,37,48,0.12);font-size:15px;line-height:1.65">${htmlAttr(item)}</div>`)
            .join('')}
        </div>
      </section>

      <section style="margin-top:48px;display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,0.9fr);gap:18px">
        <div style="padding:22px;border-radius:28px;background:rgba(255,255,255,0.84);border:1px solid rgba(58,37,48,0.12)">
          <h2 style="margin:0 0 10px;font-size:28px">Explore the catalog</h2>
          <p style="margin:0;font-size:16px;line-height:1.75;color:rgba(58,37,48,0.72)">Browse by chakra, compare crystal meanings, or open a product to see material, energy, care, and price together in one place.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
            ${MAIN_SERIES_IDS.map((id) => `<a href="${seriesHref(id)}" style="padding:10px 14px;border-radius:999px;background:rgba(58,37,48,0.06);color:#3a2530;text-decoration:none;font-size:14px">${htmlAttr(id === 'chakra' ? 'Chakra' : id.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()))}</a>`).join('')}
          </div>
        </div>
        <div>${renderNewsletterForm()}</div>
      </section>
    </main>
  `
}

function renderSeriesStatic(meta, products, guides) {
  const introParagraphs = meta.series?.introParagraphs || [meta.description, `${meta.title} brings together products, guide paths, and related collections so you can move from context into a clear next step.`]
  const relatedGuides = meta.series?.guides?.length ? meta.series.guides : selectSeriesGuides(meta.series?.id || meta.seriesId || 'crystals', guides)
  const relatedSeries = meta.series?.relatedSeries || selectCrossSeriesLinks(meta.series?.id || meta.seriesId || 'crystals')
  const productCards = products.map((product) => renderProductCard(product)).join('')
  return `
    <main data-no-auto-translate="true" style="max-width:1200px;margin:0 auto;padding:96px 20px 72px;font-family:system-ui,sans-serif;color:#3a2530">
      <section style="display:grid;gap:16px;max-width:880px">
        <p style="margin:0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(58,37,48,0.56)">${htmlAttr(meta.collectionEyebrow || 'Series')}</p>
        <h1 style="margin:0;font-size:clamp(42px,6.5vw,80px);line-height:0.95">${htmlAttr(meta.heading)}</h1>
        ${introParagraphs.slice(0, 2).map((paragraph) => `<p style="margin:0;font-size:17px;line-height:1.8;color:rgba(58,37,48,0.74)">${htmlAttr(paragraph)}</p>`).join('')}
      </section>

      <section style="margin-top:42px">
        <h2 style="margin:0 0 18px;font-size:28px">All products in this series</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
          ${productCards}
        </div>
      </section>

      <section style="margin-top:48px;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,0.8fr);gap:18px;align-items:start">
        <div>
          <h2 style="margin:0 0 16px;font-size:28px">Related guides</h2>
          <div style="display:grid;gap:12px">
            ${relatedGuides.map((guide) => renderGuideCard(guide)).join('')}
          </div>
        </div>
        <div>
          <h2 style="margin:0 0 16px;font-size:28px">Explore other series</h2>
          <div style="display:grid;gap:12px">
            ${relatedSeries.map((series) => `<a href="${series.href}" style="display:grid;gap:4px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.82);border:1px solid rgba(58,37,48,0.12);color:#3a2530;text-decoration:none"><strong>${htmlAttr(series.label)}</strong><span style="font-size:13px;line-height:1.5;color:rgba(58,37,48,0.64)">${htmlAttr(series.description)}</span></a>`).join('')}
          </div>
        </div>
      </section>
    </main>
  `
}

function renderLegalStatic(meta) {
  const sections = meta.legal?.sections || []
  const preface = meta.legal?.preface || []
  const footerNote = meta.legal?.footerNote || ''
  return `
    <main data-no-auto-translate="true" style="max-width:980px;margin:0 auto;padding:96px 20px 72px;font-family:system-ui,sans-serif;color:#3a2530">
      <section style="display:grid;gap:16px">
        <p style="margin:0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(58,37,48,0.56)">${htmlAttr(meta.legal?.eyebrow || 'Policy')}</p>
        <h1 style="margin:0;font-size:clamp(42px,6.5vw,78px);line-height:0.96">${htmlAttr(meta.heading)}</h1>
        <p style="margin:0;max-width:780px;font-size:17px;line-height:1.8;color:rgba(58,37,48,0.74)">${htmlAttr(meta.description)}</p>
        ${preface.map((paragraph) => `<p style="margin:0;max-width:840px;font-size:16px;line-height:1.8;color:rgba(58,37,48,0.72)">${htmlAttr(paragraph)}</p>`).join('')}
      </section>
      <section style="margin-top:36px;display:grid;gap:18px">
        ${sections
          .map(
            (section) => `
              <article style="padding:22px;border-radius:26px;background:rgba(255,255,255,0.86);border:1px solid rgba(58,37,48,0.12)">
                <h2 style="margin:0 0 10px;font-size:24px">${htmlAttr(section.title)}</h2>
                ${section.body.map((paragraph) => `<p style="margin:0 0 12px;font-size:16px;line-height:1.8;color:rgba(58,37,48,0.72)">${htmlAttr(paragraph)}</p>`).join('')}
              </article>`,
          )
          .join('')}
      </section>
      ${footerNote ? `<p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:rgba(58,37,48,0.64)">${htmlAttr(footerNote)}</p>` : ''}
      ${meta.legal?.form || ''}
    </main>
  `
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

function globalSchemaNodes(canonicalUrl, description = SITE_DESCRIPTION) {
  return [
    {
      '@type': 'Organization',
      name: 'Lunar Talisman',
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/og-image.svg`,
      description:
        'Crystal jewelry, chakra bracelets, lunar rituals, and reflective crystal education.',
    },
    {
      '@type': 'WebSite',
      name: 'Lunar Talisman',
      url: SITE_ORIGIN,
      description,
    },
  ]
}

function ensureGraphSchema(nodes, canonicalUrl, description) {
  const graph = Array.isArray(nodes) ? [...nodes] : [nodes]
  const hasOrg = graph.some((node) => node && typeof node === 'object' && node['@type'] === 'Organization')
  const hasWebSite = graph.some((node) => node && typeof node === 'object' && node['@type'] === 'WebSite')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...(hasOrg ? [] : [globalSchemaNodes(canonicalUrl, description)[0]]),
      ...(hasWebSite ? [] : [globalSchemaNodes(canonicalUrl, description)[1]]),
      ...graph,
    ],
  }
}

function routeMeta(route, guides, productMap) {
  const normalizedRoute = route === '/' ? '/' : route.replace(/\/+$/, '')

  if (normalizedRoute === '/') {
    const featured = selectFeaturedProducts(productMap)
    return {
      kind: 'home',
      title: 'Lunar Talisman · Crystal Jewelry & Chakra Rituals',
      description:
        'Discover crystal jewelry, chakra bracelets, gemstone talismans, lunar rituals, and practical crystal guides from Lunar Talisman.',
      heading: 'Lunar Talisman Crystal Jewelry & Chakra Rituals',
      copy: 'Explore crystal talismans, chakra collections, lunar rituals, and gemstone bracelet guides.',
      home: {
        heroTitle: 'Crystal jewelry for mindful ritual, daily wear, and clear intention.',
        heroDescription:
          'Discover natural-stone bracelets, moonlit ritual pieces, and practical crystal guides. The site is organized so you can begin with a chakra path, compare every product, and follow related guides without leaving the page structure behind.',
        featuredProducts: featured,
        seriesLinks: selectHomepageSeriesLinks(),
        guides: [
          guides.get('chakra-seven-chakras-explained'),
          guides.get('rituals-01'),
          guides.get('rituals-02'),
          guides.get('crystals-00'),
        ].filter(Boolean),
      },
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
    const priceValue = Math.max(
      1,
      Math.round(Number(product?.price ?? legacyProduct?.price ?? 89)),
    )
    const displayPrice = `$${priceValue}`
    const imagePaths = product?.images?.length ? product.images : product?.image ? [product.image] : []
    const images = imagePaths.length
      ? imagePaths.map((image) => (image.startsWith('http') ? image : `${SITE_ORIGIN}${image}`))
      : legacyProduct?.image ? [legacyProduct.image] : [`${SITE_ORIGIN}/og-image.svg`]
    const seo = productSeo(product, id, category)
    const productSeriesPrefix = Object.keys(CHAKRA_BY_PREFIX).find((prefix) =>
      id.startsWith(`${prefix}-`),
    )
    const intro = product?.tagline?.trim() || legacyProduct?.description || `${seo.title}. A ${category.toLowerCase()} piece for mindful ritual and everyday wear.`
    const description = `${intro} ${product?.material?.trim() || legacyProduct?.description || ''}`
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180)
    return {
      kind: 'product',
      title: `${name} | Lunar Talisman`,
      description,
      heading: name,
      copy: `${description} Available from Lunar Talisman for ${displayPrice} USD.`,
      product: {
        name,
        price: priceValue,
        displayPrice,
        category,
        sku: id,
        images,
        tagline: intro,
        material: product?.material?.trim() || `A thoughtfully finished ${category.toLowerCase()} piece selected for comfortable everyday wear and reflective ritual.`,
        energy: product?.energy?.length ? product.energy : [
          `This ${category.toLowerCase()} talisman is designed as a visible reminder to pause, notice your intention, and return to a steadier rhythm.`,
          'Use it during meditation, journaling, moon rituals, or any quiet transition where a tactile cue helps you stay present.',
          'Its color, texture, and natural variation invite a slower kind of attention: notice what you feel, name what matters, and let the ritual remain practical.',
          'There is no required belief system. Treat the piece as a personal symbol that helps you make space for calm, courage, connection, or renewal.',
        ],
        benefits: product?.benefits?.length ? product.benefits : [
          'Offers a tangible focus for mindful intention setting.',
          'Layers easily into an everyday jewelry ritual.',
          'Makes a meaningful companion for reflection and personal growth.',
          'Creates a simple tactile cue for returning to your chosen intention throughout the day.',
        ],
        howToWear: product?.howToWear?.length ? product.howToWear : [
          'Wear it on the wrist or keep it nearby during a reflective practice.',
          'Pair it with a simple breath, journaling prompt, or lunar ritual.',
        ],
        careRitual: product?.careRitual?.length ? product.careRitual : [
          'Wipe gently with a soft dry cloth and store away from hard surfaces.',
          'For a reset, place it on a clean cloth under moonlight and set a quiet intention.',
        ],
        specs: product?.specs?.length ? product.specs : [category, 'Natural crystal or gemstone', 'Mindful everyday wear'],
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
    const seriesProducts = selectSeriesProducts(id, productMap)
    const seriesGuideKey = resolveSeriesGuideKey(id, chakraId)
    const seriesGuides = selectSeriesGuides(seriesGuideKey, guides)
    return {
      kind: 'collection',
      title: `${data.title} | Lunar Talisman`,
      description: data.description,
      heading: data.title,
      copy: data.description,
      collection: data.title,
      collectionEyebrow: chakra ? `${chakra} Chakra` : id.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
      keywords: data.keywords || CORE_KEYWORDS,
      intro: chakraGuide?.markdown || '',
      series: {
        id,
        products: seriesProducts,
        guides: (seriesGuides.length ? seriesGuides : selectSeriesGuides('crystals', guides)).slice(0, 5),
        relatedSeries: selectCrossSeriesLinks(id),
        introParagraphs: [
          data.description,
          chakraGuide?.excerpt
            ? chakraGuide.excerpt
            : `This collection brings ${seriesProducts.length} pieces into one place so you can move from theme to product without losing the thread. Open a product page to see the material, price, and care details together, then return here to compare the next piece.`,
        ],
      },
    }
  }

  if (normalizedRoute.slice(1) in LEGAL) {
    const [title, description] = LEGAL[normalizedRoute.slice(1)]
    const legalContent = LEGAL_STATIC_CONTENT[normalizedRoute.slice(1)] || LEGAL_STATIC_CONTENT.privacy
    return {
      kind: 'page',
      title: `${title} | Lunar Talisman`,
      description,
      heading: title,
      copy: description,
      legal: legalContent,
    }
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
    const productNode = {
      '@type': 'Product',
      name: meta.product.name,
      description: meta.description,
      sku: meta.product.sku,
      category: meta.product.category,
      keywords: meta.product.keywords,
      ...(meta.product.images?.length ? { image: [meta.product.images[0]] } : {}),
      brand: { '@type': 'Brand', name: 'Lunar Talisman' },
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'USD',
        price: meta.product.price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    }
    return ensureGraphSchema([productNode, breadcrumb], canonicalUrl, meta.description)
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
    return ensureGraphSchema(graph, canonicalUrl, meta.description)
  }
  if (meta.kind === 'collection') {
    return ensureGraphSchema(
      [
        {
          '@type': 'CollectionPage',
          name: meta.collection,
          description: meta.description,
          url: canonicalUrl,
          isPartOf: { '@type': 'WebSite', name: 'Lunar Talisman', url: SITE_ORIGIN },
          keywords: meta.keywords,
        },
        breadcrumb,
      ],
      canonicalUrl,
      meta.description,
    )
  }
  if (meta.kind === 'home') {
    return ensureGraphSchema(
      [
        {
          '@type': 'WebPage',
          name: meta.heading,
          description: meta.description,
          url: canonicalUrl,
          isPartOf: { '@type': 'WebSite', name: 'Lunar Talisman', url: SITE_ORIGIN },
        },
      ],
      canonicalUrl,
      meta.description,
    )
  }
  return ensureGraphSchema(
    [
      {
        '@type': 'WebPage',
        name: meta.heading,
        description: meta.description,
        url: canonicalUrl,
        isPartOf: { '@type': 'WebSite', name: 'Lunar Talisman', url: SITE_ORIGIN },
      },
      breadcrumb,
    ],
    canonicalUrl,
    meta.description,
  )
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
        ? `<main style="max-width:900px;margin:72px auto;padding:24px;font-family:system-ui,sans-serif;color:#3a2530"><article data-no-auto-translate="true"><h1>${escapeHtml(meta.heading)}</h1><div style="margin:14px 0 6px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(58,37,48,0.56)">Price</div><div class="price" style="margin-bottom:16px;font-size:34px;font-weight:900;letter-spacing:-0.04em;color:#3a2530">${escapeHtml(meta.product.displayPrice || `$${meta.product.price}`)}</div><p>${escapeHtml(meta.product.tagline || meta.description)}</p>${meta.product.material ? `<h2>Material</h2><p>${escapeHtml(meta.product.material)}</p>` : ''}${meta.product.energy?.length ? `<h2>Energy &amp; Meaning</h2>${meta.product.energy.map((item) => `<p>${escapeHtml(item)}</p>`).join('')}` : ''}${meta.product.benefits?.length ? `<h2>Benefits</h2><ul>${meta.product.benefits.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${meta.product.howToWear?.length ? `<h2>How to wear</h2><ul>${meta.product.howToWear.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${meta.product.careRitual?.length ? `<h2>Care &amp; ritual</h2><ul>${meta.product.careRitual.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${meta.product.specs?.length ? `<h2>Specs</h2><ul>${meta.product.specs.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}<h2>Ritual context</h2><p>This piece is made for an intentional everyday rhythm: a small, tactile reminder to pause before a decision, return to your breath, and notice what your body and attention are asking for. Wear it alongside journaling, meditation, a quiet walk, or a moon-phase practice. Crystal traditions are personal and symbolic; there is no single required way to work with a stone. Let the color, texture, and weight become part of a routine that feels honest, practical, and easy to repeat.</p><p>Over time, the meaning of a talisman can deepen through use. Keep the bracelet or necklace close to the moments you want to remember, and allow your own experience to guide how often you wear, rest, cleanse, and store it.</p></article></main>`
        : meta.kind === 'home'
          ? renderHomeStatic(meta, meta.home?.featuredProducts || [], meta.home?.guides || new Map())
        : meta.kind === 'collection'
          ? renderSeriesStatic(meta, meta.series?.products || [], meta.series?.guides instanceof Array ? new Map(meta.series.guides.map((guide) => [guide.id, guide])) : new Map())
          : meta.kind === 'page' && meta.legal
            ? renderLegalStatic(meta)
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

// The sitemap intentionally omits the root URL, but the root document also
// needs a complete static fallback for crawlers that do not execute React.
fs.writeFileSync(path.join(distDir, 'index.html'), renderPage(template, '/', routeMeta('/', guides, productMap)))

console.log(`Generated ${routes.length} static SEO route pages.`)
