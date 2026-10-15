import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const projectRoot = process.cwd()
const sourceRoot = 'C:\\Users\\Administrator\\Desktop\\LT 产品'
const publicProductsDir = path.join(projectRoot, 'public', 'products')
const generatedDataFile = path.join(projectRoot, 'src', 'data', 'importedProducts.ts')
const visibilityFile = path.join(projectRoot, 'src', 'data', 'catalogVisibility.json')
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])
const NON_BRACELET_TERMS =
  /\banklet|earrings?|necklaces?|pendants?|rings?|lamp|night light|home decor|home decoration|home accessory|car kit|coaster|pens?|tassel|pyramid|point|carving|cluster|crystal heart|crystal tree|crystal set|bundle\b/i

const chakraMeta = {
  root: { name: 'Root Chakra', color: '#d98b7b' },
  sacral: { name: 'Sacral Chakra', color: '#e4ad7b' },
  solar: { name: 'Solar Plexus Chakra', color: '#ead58a' },
  heart: { name: 'Heart Chakra', color: '#a9d7a8' },
  throat: { name: 'Throat Chakra', color: '#9fcde0' },
  'third-eye': { name: 'Third Eye Chakra', color: '#b2a9e1' },
  crown: { name: 'Crown Chakra', color: '#d8b4e5' },
}

function normalizeText(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/^[-=]{4,}$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function sanitizeSourceText(value) {
  return normalizeText(value)
    .replace(/conscious items/gi, 'Lunar Talisman')
    .replace(/flower of life-inspired lunar talisman logo/gi, 'Lunar Talisman detail')
    .replace(/lunar talisman logo/gi, 'Lunar Talisman detail')
    .replace(
      /Sleep is the ultimate anti-aging treatment\.\s*And this bracelet seeks to sweep your mind into the type of sleep that helps you heal, repair, and glow\.\s*Imagine waking up rejuvenated and ready\.\s*It’s time for beauty sleep…but deeper\./gi,
      'Sleep can be a restorative part of a personal evening routine. This bracelet is a gentle reminder to slow down, put the day away, and make room for rest.',
    )
    .replace(
      /Addiction, depression, and financial worry can be passed down through generations\.\s*This crystal seeks to sever those threads\.\s*It says:\s*“This trauma didn’t start with you, but it can end with you\.”/gi,
      'Family patterns and financial worry can shape how a person sees the future. This crystal can serve as a symbolic reminder to reflect on those patterns and choose a different next step.',
    )
    .replace(
      /Rose Quartz fulfils the yearning for your other half by gravitating your soulmate towards you\./gi,
      'Rose Quartz is traditionally associated with heart-centered reflection, self-kindness, and the values you want to bring into relationships.',
    )
}

function section(text, startLabel, endLabel) {
  const start = text.indexOf(startLabel)
  if (start < 0) return ''
  const from = start + startLabel.length
  const end = endLabel ? text.indexOf(endLabel, from) : -1
  return normalizeText(text.slice(from, end >= 0 ? end : undefined))
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'crystal-product'
}

function paragraphs(value) {
  return normalizeText(value)
    .split(/\n\s*\n/)
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function listItems(value) {
  return normalizeText(value)
    .split('\n')
    .map((item) => item.replace(/^[-•*]\s*/, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function isBraceletProduct({ title, type, tags }) {
  const searchable = `${title} ${type} ${tags}`
  return /\bbracelet\b/i.test(searchable) && !NON_BRACELET_TERMS.test(searchable)
}

function inferChakra(source) {
  const value = source.toLowerCase()
  if (/voice|truth|communication|aquamarine|kyanite|blue/.test(value)) return 'throat'
  if (/amethyst|intuition|wisdom|sleep|labradorite|purple|moonstone/.test(value)) return 'third-eye'
  if (/clear quartz|selenite|spiritual|meditation|angel|chakra|crown/.test(value)) return 'crown'
  if (/love|rose quartz|heart|compassion|pink|peace|calm|emotional/.test(value)) return 'heart'
  if (/abundance|wealth|success|manifestation|citrine|tiger.?s eye|prosperity|power/.test(value)) return 'solar'
  if (/creativity|passion|transformation|joy|carnelian|orange/.test(value)) return 'sacral'
  return 'root'
}

function parseVariantLine(line) {
  const price = Number(line.match(/价格:\s*\$(\d+(?:\.\d+)?)/i)?.[1] || 0)
  const originalPrice = Number(line.match(/原价:\s*\$(\d+(?:\.\d+)?)/i)?.[1] || 0)
  const sku = line.match(/SKU:\s*([^|]+)/i)?.[1]?.trim() || ''
  const inStock = /有货/.test(line)
  const title = line.split('|')[0].replace(/^-\s*/, '').trim()
  return { title, price, originalPrice, sku, inStock }
}

async function productFolders(root) {
  const entries = await fs.readdir(root, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
}

async function productImages(folder) {
  const entries = await fs.readdir(folder, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.join(folder, entry.name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
}

function makeProduct({
  id,
  title,
  type,
  tags,
  variant,
  description,
  imagePaths,
}) {
  const fullSource = `${title} ${type} ${tags} ${description}`
  const chakra = inferChakra(fullSource)
  const meta = chakraMeta[chakra]
  const isBracelet = isBraceletProduct({ title, type, tags })
  const detailParagraphs = paragraphs(sanitizeSourceText(description))
  const firstParagraph = detailParagraphs[0] || `${title} is a natural crystal piece for reflective everyday wear.`
  const lastParagraph = detailParagraphs.at(-1) || firstParagraph
  const benefitSentences = detailParagraphs
    .join(' ')
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 24)
    .slice(0, 5)

  return {
    id,
    chakra,
    chakraName: meta.name,
    color: meta.color,
    name: title,
    tagline: firstParagraph.slice(0, 320),
    material: `${type} made with natural crystal materials selected for a tactile, everyday piece. ${tags ? `Tags: ${tags}.` : ''}`,
    energy: detailParagraphs.slice(0, 8),
    benefits: benefitSentences.length ? benefitSentences : [firstParagraph],
    howToWear: [`Wear this ${type.toLowerCase()} as part of a personal reflection or everyday styling ritual.`],
    specs: [
      `Product type: ${type}`,
      'Brand: Lunar Talisman',
      variant.sku ? `SKU: ${variant.sku}` : '',
      variant.title !== 'Default Title' ? `Variant: ${variant.title}` : '',
      tags ? `Tags: ${tags}` : '',
      variant.originalPrice ? `Original price: $${variant.originalPrice.toFixed(2)}` : '',
      variant.inStock ? 'Availability: In stock' : 'Availability: Currently unavailable',
    ].filter(Boolean),
    careRitual: [
      `${lastParagraph} For routine care, keep the piece away from harsh chemicals, prolonged water exposure, and impact.`,
    ],
    price: variant.price || 0,
    originalPrice: variant.originalPrice || undefined,
    stock: variant.inStock ? 20 : 0,
    status: variant.inStock && isBracelet ? '上架' : '下架',
    sku: variant.sku,
    productType: type,
    tags: tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    image: imagePaths[0] || '',
    images: imagePaths,
  }
}

await fs.mkdir(publicProductsDir, { recursive: true })
for (const entry of await fs.readdir(publicProductsDir, { withFileTypes: true })) {
  if (entry.isFile() && /^lt-.*\.webp$/i.test(entry.name)) {
    await fs.unlink(path.join(publicProductsDir, entry.name))
  }
}
const folders = await productFolders(sourceRoot)
const products = []
const ids = new Set()
let copiedImages = 0

for (const folder of folders) {
  const files = await fs.readdir(folder)
  const textName = files.find((name) => name.toLowerCase().endsWith('.txt'))
  if (!textName) throw new Error(`Missing TXT in ${folder}`)
  const text = normalizeText(await fs.readFile(path.join(folder, textName), 'utf8'))
  const header = text.split('\n').slice(0, text.indexOf('产品链接:') >= 0 ? text.slice(0, text.indexOf('产品链接:')).split('\n').length : 12)
  const title =
    header
      .map((line) => line.trim())
      .find((line) => line && !/^[-=]{4,}$/.test(line)) || path.basename(folder)
  const type = section(text, '产品类型:', '\n品牌:') || 'Crystal jewelry'
  const tags = section(text, '标签:', '\n\n')
  const variantsText = section(text, '价格与规格 (Variants)', '产品详情介绍')
  const variants = variantsText
    .split('\n')
    .filter((line) => line.trim().startsWith('-'))
    .map(parseVariantLine)
  const variant = variants.find((item) => item.inStock) || variants[0] || {
    title: 'Default Title',
    price: 0,
    originalPrice: 0,
    sku: '',
    inStock: false,
  }
  const description = sanitizeSourceText(section(text, '产品详情介绍'))
  const baseId = `lt-${slugify(title)}`
  let id = baseId
  let suffix = 2
  while (ids.has(id)) id = `${baseId}-${suffix++}`
  ids.add(id)

  if (!isBraceletProduct({ title, type, tags })) {
    products.push(
      makeProduct({
        id,
        title,
        type,
        tags,
        variant,
        description,
        imagePaths: [],
      }),
    )
    continue
  }

  const sourceImages = await productImages(folder)
  if (!sourceImages.length) throw new Error(`Missing product images in ${folder}`)
  const optimizedImages = []
  for (let index = 0; index < sourceImages.length; index += 1) {
    const outputName = index === 0 ? `${id}.webp` : `${id}-${index + 1}.webp`
    const outputPath = path.join(publicProductsDir, outputName)
    await sharp(sourceImages[index], { animated: false })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(outputPath)
    optimizedImages.push(`/products/${outputName}`)
    copiedImages += 1
  }

  products.push(
    makeProduct({
      id,
      title,
      type,
      tags,
      variant,
      description,
      imagePaths: optimizedImages,
    }),
  )
}

const source = `/* Generated from Desktop/LT 产品 by scripts/import-lt-products.mjs. */

export type ChakraId =
  | 'root'
  | 'sacral'
  | 'solar'
  | 'heart'
  | 'throat'
  | 'third-eye'
  | 'crown'

export type ImportedProduct = {
  id: string
  chakra: ChakraId
  chakraName: string
  color: string
  name: string
  tagline: string
  material: string
  energy: string[]
  benefits: string[]
  howToWear: string[]
  specs: string[]
  careRitual: string[]
  price: number
  originalPrice?: number
  stock?: number
  status?: '上架' | '下架'
  sku?: string
  productType?: string
  tags?: string[]
  image: string
  images: string[]
}

// Optional per-product image moderation. An empty map means every imported
// image is approved for the public catalog.
const PUBLIC_PRODUCT_IMAGE_INDICES: Record<string, readonly number[]> = {
}
void PUBLIC_PRODUCT_IMAGE_INDICES

export const importedProducts: ImportedProduct[] = ${JSON.stringify(products, null, 2)}
`

await fs.writeFile(generatedDataFile, source, 'utf8')
await fs.writeFile(
  visibilityFile,
  `${JSON.stringify(
    {
      importedProductIds: products.filter((product) => product.status === '上架').map((product) => product.id),
      legacyProductIds: [],
    },
    null,
    2,
  )}\n`,
  'utf8',
)

console.log(`Imported ${products.length} products and ${copiedImages} optimized images from ${sourceRoot}.`)
console.log(`Published: ${products.filter((product) => product.status === '上架').length}`)
console.log(`Out of stock: ${products.filter((product) => product.status !== '上架').length}`)
