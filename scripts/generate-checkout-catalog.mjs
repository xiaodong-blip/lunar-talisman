import { readFile, writeFile } from 'node:fs/promises'

const sourcePath = new URL('../src/data/importedProducts.ts', import.meta.url)
const outputPath = new URL('../netlify/functions/_generated-catalog.mjs', import.meta.url)

// Keep the checkout catalog aligned with the full imported catalog so all
// in-stock products remain available to the storefront, sitemap, and backend.
const REMOVED_PRODUCT_IDS = new Set([
  'sacral-sacral-chakra-vitality-carnelian-bracelet-8mm',
])

const source = await readFile(sourcePath, 'utf8')
const assignment = 'export const importedProducts: ImportedProduct[] = '
const start = source.indexOf(assignment)
const end = source.lastIndexOf('\n]')

if (start < 0 || end < 0) {
  throw new Error('Could not locate the imported product catalog.')
}

const products = JSON.parse(source.slice(start + assignment.length, end + 2))
  .filter((product) => !REMOVED_PRODUCT_IDS.has(product.id))
  .map((product) => ({
    id: String(product.id),
    name: String(product.name),
    price: Number(product.price) < 100 ? Number(product.price) + 100 : Number(product.price),
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
