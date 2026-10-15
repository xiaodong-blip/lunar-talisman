import { readFile, writeFile } from 'node:fs/promises'
import { PUBLIC_IMPORTED_PRODUCT_IDS } from './catalog-visibility.mjs'

const sourcePath = new URL('../src/data/importedProducts.ts', import.meta.url)
const outputPath = new URL('../netlify/functions/_generated-catalog.mjs', import.meta.url)

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

function salePrice(id, value) {
  const originalPrice = Math.max(1, Math.round(adjustedProductPrice(value)))
  const discountPercent = originalPrice > 200 ? 20 + (promotionSeed(id) % 11) : 6 + (promotionSeed(id) % 10)
  return Math.max(1, Math.round((originalPrice * (100 - discountPercent)) / 100))
}

const source = await readFile(sourcePath, 'utf8')
const assignment = source.includes('const rawImportedProducts: ImportedProduct[] = ')
  ? 'const rawImportedProducts: ImportedProduct[] = '
  : 'export const importedProducts: ImportedProduct[] = '
const start = source.indexOf(assignment)
const end = source.lastIndexOf('\n]')

if (start < 0 || end < 0) {
  throw new Error('Could not locate the imported product catalog.')
}

const products = JSON.parse(source.slice(start + assignment.length, end + 2))
  .filter((product) => PUBLIC_IMPORTED_PRODUCT_IDS.has(product.id))
  .map((product) => ({
    id: String(product.id),
    name: String(product.name),
    price: salePrice(String(product.id), product.price),
    image: String(product.image || ''),
    images: Array.isArray(product.images)
      ? product.images.map((image) => String(image)).filter(Boolean).slice(0, 8)
      : [],
    stock: 20,
    status: '上架',
  }))

const output = `// Generated from src/data/importedProducts.ts. Do not edit manually.\nexport const IMPORTED_CATALOG = ${JSON.stringify(
  products,
  null,
  2,
)}\n`

await writeFile(outputPath, output)
