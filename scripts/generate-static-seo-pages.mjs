import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { IMPORTED_CATALOG } from '../netlify/functions/_generated-catalog.mjs'

const SITE_ORIGIN = 'https://lunartalisman.com'
const rootDir = fileURLToPath(new URL('..', import.meta.url))
const distDir = path.join(rootDir, 'dist')
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml')
const guidesPath = path.join(rootDir, 'src', 'data', 'importedSeriesGuides.ts')

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
  },
  'solar-citrine': {
    name: 'Solar Plexus Citrine Courage Bracelet',
    category: 'Solar Plexus Chakra Crystal Jewelry',
    price: 179,
  },
  'new-moon-set': {
    name: 'New Moon Ritual Cleansing Set',
    category: 'Lunar Ritual Set',
    price: 129,
  },
  'root-garnet': {
    name: 'Root Chakra Garnet Grounding Bracelet',
    category: 'Root Chakra Crystal Jewelry',
    price: 174,
  },
  'full-moon-necklace': {
    name: 'Full Moon Moonstone Blessing Necklace',
    category: 'Lunar Crystal Jewelry',
    price: 189,
  },
  'chakra-test': {
    name: 'Seven Chakra Crystal Bracelet',
    category: 'Chakra Crystal Jewelry',
    price: 189,
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
  const records = [...source.matchAll(
    /^\s*"id": "([^"]+)",[\s\S]*?^\s*"series": "([^"]+)",[\s\S]*?^\s*"title": "([^"]+)",[\s\S]*?^\s*"eyebrow": "([^"]+)",[\s\S]*?^\s*"excerpt": "([^"]+)"/gm,
  )]

  return new Map(
    records.map((match) => [
      match[1],
      {
        id: match[1],
        series: match[2],
        title: CJK.test(match[3]) ? 'Crystal Ritual Guide' : match[3],
        eyebrow: CJK.test(match[4]) ? 'Crystal Guide' : match[4],
        excerpt: CJK.test(match[5])
          ? 'A practical Lunar Talisman guide to crystal rituals, chakra reflection, and mindful jewelry.'
          : match[5],
      },
    ]),
  )
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
      : [`${SITE_ORIGIN}/og-image.svg`]
    const description = `${name} — a ${category.toLowerCase()} piece for mindful ritual and everyday wear.`
    return {
      kind: 'product',
      title: `${name} | Lunar Talisman`,
      description,
      heading: name,
      copy: `${description} Available from Lunar Talisman for $${price} USD.`,
      product: { name, price, category, sku: id, images },
    }
  }

  if (normalizedRoute.startsWith('/guide/')) {
    const guide = guides.get(normalizedRoute.slice('/guide/'.length))
    const title = guide?.title || 'Crystal Ritual Guide'
    const description = guide
      ? `${guide.title}: ${guide.excerpt}`
      : 'A practical Lunar Talisman guide to crystal rituals, chakra reflection, and mindful jewelry.'
    return {
      kind: 'article',
      title: `${title} | Lunar Talisman`,
      description,
      heading: title,
      copy: description,
      article: { title, series: guide?.series || 'crystals' },
    }
  }

  if (normalizedRoute.startsWith('/series/')) {
    const id = normalizedRoute.slice('/series/'.length)
    const chakraId = id.replace(/^chakra-/, '')
    const chakra = CHAKRA_BY_PREFIX[chakraId]
    const data = chakra
      ? {
          title: `${chakra} Crystal Collection`,
          description: `Explore ${chakra} bracelets and crystal talismans curated for mindful ritual, reflection, and everyday wear.`,
        }
      : SERIES[id] || SERIES.crystals
    return {
      kind: 'collection',
      title: `${data.title} | Lunar Talisman`,
      description: data.description,
      heading: data.title,
      copy: data.description,
      collection: data.title,
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
  if (meta.kind === 'product') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: meta.product.name,
      description: meta.description,
      sku: meta.product.sku,
      category: meta.product.category,
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
    }
  }
  if (meta.kind === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.article.title,
      description: meta.description,
      mainEntityOfPage: canonicalUrl,
      author: { '@type': 'Organization', name: 'Lunar Talisman' },
      publisher: { '@type': 'Organization', name: 'Lunar Talisman', url: SITE_ORIGIN },
      isPartOf: { '@type': 'CollectionPage', name: `${meta.article.series} crystal guides` },
    }
  }
  if (meta.kind === 'collection') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: meta.collection,
      description: meta.description,
      url: canonicalUrl,
      isPartOf: { '@type': 'WebSite', name: 'Lunar Talisman', url: SITE_ORIGIN },
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.heading,
    description: meta.description,
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: 'Lunar Talisman', url: SITE_ORIGIN },
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
    <meta property="og:image" content="${SITE_ORIGIN}/og-image.svg" />
    <meta property="og:image:alt" content="Lunar Talisman crystal jewelry and chakra rituals" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${SITE_ORIGIN}/og-image.svg" />
    <script id="lunar-talisman-page-jsonld" type="application/ld+json">${jsonLd}</script>`
  const fallback = `<main style="max-width:760px;margin:72px auto;padding:24px;font-family:system-ui,sans-serif;color:#3a2530"><h1>${escapeHtml(meta.heading)}</h1><p>${escapeHtml(meta.copy)}</p><p><a href="${SITE_ORIGIN}/series/crystals/">Browse crystal talismans</a> · <a href="${SITE_ORIGIN}/series/chakra/">Explore chakra collections</a></p></main>`

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
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`)
}

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  throw new Error('dist/index.html is missing. Run this script after vite build.')
}

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
const routes = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>https:\/\/lunartalisman\.com([^<]*)<\/loc>/g)]
  .map((match) => match[1] || '/')
  .filter((route) => route !== '/')
const guides = readGuides()
const productMap = new Map(IMPORTED_CATALOG.map((product) => [product.id, product]))

for (const route of routes) {
  const targetDir = path.join(distDir, route.replace(/^\//, ''))
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, 'index.html'), renderPage(template, route, routeMeta(route, guides, productMap)))
}

console.log(`Generated ${routes.length} static SEO route pages.`)
