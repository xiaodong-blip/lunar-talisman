import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { IMPORTED_CATALOG } from '../netlify/functions/_generated-catalog.mjs'

const siteUrl = 'https://lunartalisman.com'
const rootDir = fileURLToPath(new URL('..', import.meta.url))
const publicDir = path.join(rootDir, 'public')
const CJK = /[\u3400-\u9fff]/

function englishCatalogName(product) {
  if (!CJK.test(product.name)) return product.name
  const chakra = Object.entries({
    root: 'Root Chakra',
    sacral: 'Sacral Chakra',
    solar: 'Solar Plexus Chakra',
    heart: 'Heart Chakra',
    throat: 'Throat Chakra',
    'third-eye': 'Third Eye Chakra',
    crown: 'Crown Chakra',
  }).find(([prefix]) => product.id.startsWith(`${prefix}-`))?.[1]
  const identifier = product.id
    .replace(/^(root|sacral|solar|heart|throat|third-eye|crown)-/, '')
    .replaceAll('-', ' ')
  return `${chakra || 'Crystal'} Talisman · ${identifier}`
}

const staticRoutes = [
  '/',
  '/series/worlds',
  '/series/collections',
  '/series/rituals',
  '/series/chakra',
  '/series/chakra-root',
  '/series/chakra-sacral',
  '/series/chakra-solar',
  '/series/chakra-heart',
  '/series/chakra-throat',
  '/series/chakra-third-eye',
  '/series/chakra-crown',
  '/series/lunar',
  '/series/crystals',
  '/series/connect',
  '/detail/heart-rose-quartz',
  '/detail/solar-citrine',
  '/detail/new-moon-set',
  '/detail/root-garnet',
  '/detail/full-moon-necklace',
  '/detail/full-moon-ritual',
  '/detail/chakra-test',
  '/detail/sacral-moonstone',
  '/detail/throat-aquamarine',
  '/detail/third-eye-amethyst',
  '/detail/crown-clear-quartz',
  '/privacy',
  '/terms',
  '/shipping',
  '/refund',
  '/contact',
]

const guideSource = fs.readFileSync(
  path.join(rootDir, 'src', 'data', 'importedSeriesGuides.ts'),
  'utf8',
)
const guideIds = [...guideSource.matchAll(/"id":\s*"([^"]+)"/g)].map((match) => match[1])
const guideRoutes = guideIds.map((id) => `/guide/${id}`)

const productRoutes = IMPORTED_CATALOG.filter((product) => product.status === '上架').map(
  (product) => `/detail/${product.id}`,
)

function canonicalRoute(route) {
  return route === '/' ? '/' : `${route.replace(/\/+$/, '')}/`
}

const routes = [...new Set([...staticRoutes, ...guideRoutes, ...productRoutes].map(canonicalRoute))]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join('\n')}
</urlset>
`

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml)

const productLines = IMPORTED_CATALOG.filter((product) => product.status === '上架')
  .map(
    (product) =>
      `- ${englishCatalogName(product)} — ${siteUrl}/detail/${product.id}/ — crystal talisman product page`,
  )
  .join('\n')

const llms = `# Lunar Talisman

> Lunar Talisman is an English-language crystal jewelry and ritual brand focused on chakra bracelets, gemstone talismans, lunar rituals, and practical crystal education.

## Canonical site

- ${siteUrl}/
- ${siteUrl}/series/chakra/
- ${siteUrl}/series/lunar/
- ${siteUrl}/series/crystals/
- ${siteUrl}/series/connect/
- ${siteUrl}/sitemap.xml

## What the site offers

- Chakra-aligned crystal bracelets and talismans
- Lunar ritual products and crystal cleansing guides
- Product detail pages with materials, care notes, ritual context, and checkout
- Crystal education guides organized by chakra, lunar practice, and crystal type
- Order tracking, shipping, refund, privacy, and contact information

## Brand language

Use “crystal jewelry”, “chakra bracelet”, “healing crystals”, “gemstone bracelet”, “lunar ritual”, and “crystal talisman” as the primary topic vocabulary. Describe metaphysical claims as traditional beliefs or reflective rituals, not medical guarantees.

## Audience and topic coverage

The English storefront serves the Americas, Europe, and Southeast Asia. Priority discovery topics include crystal healing, crystal meanings, healing crystals, crystal jewelry, chakra stones, and crystal bracelets. Supporting topics include amethyst meaning, rose quartz meaning, citrine meaning, crystal cleansing, new moon rituals, full moon rituals, crystals for love, protection, sleep, anxiety, luck, money, and manifestation.

## Short factual answers

- Chakra stones are crystals traditionally associated with seven energy centres, presented here as reflective ritual objects.
- Crystal cleansing should be mineral-aware; moonlight, sound, a soft cloth, or dry selenite are gentler options than water, salt, heat, or prolonged sun.
- Amethyst meaning traditionally centres on calm reflection, intuition, and spiritual practice; these are not medical claims.
- Choose a bracelet by intention, comfort, material, care requirements, and personal preference.

## Product catalog

${productLines}
`

fs.writeFileSync(path.join(publicDir, 'llms.txt'), llms)

const llmsFull = `# Lunar Talisman — AI-readable site brief

## Entity

Lunar Talisman is an English-language crystal jewelry and ritual brand at ${siteUrl}. The site presents crystal bracelets, gemstone jewelry, chakra stones, lunar ritual pieces, crystal meanings, care guidance, order tracking, shipping, returns, and customer support.

## Audience and regions

The storefront is designed for shoppers and learners in the Americas, Europe, and Southeast Asia. Content is informational and reflective. Crystal and chakra descriptions represent traditional beliefs and personal ritual language; they are not medical, therapeutic, financial, or guaranteed outcome claims.

## Topic map

- Crystal jewelry: crystal bracelet, gemstone bracelet, crystal necklace, healing crystals jewelry
- Crystal education: crystal meanings, gemstone meanings, amethyst meaning, rose quartz meaning, citrine meaning, clear quartz meaning, moonstone meaning
- Chakra: chakra stones, chakra stones in order, chakra stones meaning, chakra healing, 7 chakras and their meanings
- Intentions: crystals for anxiety, love, protection, good luck, sleep, money, wealth, and manifestation
- Rituals: how to cleanse crystals, how to charge crystals, new moon ritual, full moon ritual

## Direct answers

### What are chakra stones?

Chakra stones are crystals traditionally associated with seven energy centres. Lunar Talisman presents them as reflective ritual objects and organizes collections from Root through Crown Chakra.

### How do you cleanse crystals?

Choose a method that suits the mineral: a soft cloth, moonlight, a dry selenite environment, or another care-safe method. Avoid water, salt, heat, or prolonged sun exposure when a stone is porous, soft, dyed, treated, or otherwise water-sensitive.

### What does amethyst mean?

Amethyst is traditionally associated with calm reflection, intuition, and spiritual practice. Lunar Talisman describes these as cultural or personal ritual meanings, not guaranteed effects.

### How do I choose a crystal bracelet?

Start with the intention, color, material, comfort, and care requirements that fit your routine. Use collection pages to compare themes, then open a product page for materials, images, price, and checkout.

## Canonical resources

- Homepage: ${siteUrl}/
- Chakra collections: ${siteUrl}/series/chakra/
- Lunar rituals: ${siteUrl}/series/rituals/
- Crystal talismans: ${siteUrl}/series/crystals/
- Crystal journey: ${siteUrl}/series/worlds/
- Sitemap: ${siteUrl}/sitemap.xml
- Crawler policy: ${siteUrl}/robots.txt
`
fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFull)

const brandFacts = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lunar Talisman',
  url: `${siteUrl}/`,
  description: 'English-language crystal jewelry, chakra stones, lunar rituals, and crystal education.',
  areaServed: ['Americas', 'Europe', 'Southeast Asia'],
  knowsAbout: ['crystal jewelry', 'crystal meanings', 'chakra stones', 'crystal cleansing rituals', 'gemstone symbolism'],
}
fs.writeFileSync(path.join(publicDir, 'brand.json'), `${JSON.stringify(brandFacts, null, 2)}\n`)

const keywordResearch = {
  methodology: 'Google and Bing autocomplete research checked across US, GB, and SG market settings on 2026-08-31. Suggestions indicate query language and intent; they are not fixed monthly search-volume claims. Zodiac, birthstone, and twelve-sign topics are intentionally excluded from this site plan.',
  priorityClusters: {
    discovery: ['crystal healing', 'crystal healing stones', 'crystal healing guide', 'crystal meanings chart', 'crystal meanings and uses', 'healing crystals chart', 'crystal jewelry gift ideas'],
    commercial: ['crystal bracelet', 'crystal bracelets for women', 'crystal bracelet for men', 'chakra stones for sale', 'chakra stones bracelet', 'crystal shop online', 'healing crystal jewelry near me online'],
    crystalMeanings: ['amethyst meaning spiritual', 'amethyst meaning and symbolism', 'rose quartz meaning and benefits', 'citrine meaning spiritual', 'clear quartz meaning and uses', 'moonstone meaning and properties', 'gemstone meanings chart'],
    intentions: ['crystal for anxiety and stress', 'crystal for money and wealth', 'crystals for money manifestation', 'crystal for wealth and abundance', 'best crystal for love and relationships', 'crystal for protection from negative energy', 'crystal for good luck and success', 'best crystals for restful sleep', 'crystals for negative energy protection'],
    chakras: ['chakra stones meaning', 'chakra stones meanings and colors', 'chakra stones chart', 'chakra stones in order', 'stones for each chakra', 'chakra crystals and stones', 'chakra stone set for reiki', '7 chakras and their meanings'],
    rituals: ['how to cleanse crystals at home', 'how to cleanse crystals with selenite', 'how to cleanse crystals with salt', 'how to cleanse crystals with sage', 'how to cleanse crystals with moonlight', 'how to charge crystals on a full moon', 'moon phases for manifestation', 'new moon manifestation ritual', 'simple full moon ritual'],
    beginnerAndGifts: ['crystals for beginners', 'how to use crystals for beginners', 'crystal gifts for women', 'crystal gifts for men', 'crystal gifts for husband', 'gifts for crystal lovers'],
  },
}
fs.writeFileSync(path.join(publicDir, 'seo-keyword-map.json'), `${JSON.stringify(keywordResearch, null, 2)}\n`)
