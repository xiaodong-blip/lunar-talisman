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

## Product catalog

${productLines}
`

fs.writeFileSync(path.join(publicDir, 'llms.txt'), llms)
