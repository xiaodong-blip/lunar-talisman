import { readFile, writeFile } from 'node:fs/promises'

const sourcePath = new URL('../src/data/importedProducts.ts', import.meta.url)
const outputPath = new URL('../netlify/functions/_generated-catalog.mjs', import.meta.url)

const REMOVED_PRODUCT_IDS = new Set([
  'sacral-sacral-chakra-vitality-carnelian-bracelet-8mm',
  'sacral-sacral-chakra-honey-amber-bracelet-10mm',
  'sacral-sacral-chakra-passion-orange-garnet-bracelet-6mm',
  'sacral-sacral-chakra-faceted-carnelian-bracelet-10mm',
  'sacral-sacral-chakra-golden-tigers-eye-bracelet-10mm',
  'sacral-sacral-chakra-flame-orange-agate-bracelet-10mm',
  'sacral-sacral-chakra-radiance-sunstone-bracelet-8mm',
  'crown-i02-2503-ddd',
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
    price: Number(product.price),
    stock: 20,
    status: '上架',
  }))

const output = `// Generated from src/data/importedProducts.ts. Do not edit manually.\nexport const IMPORTED_CATALOG = ${JSON.stringify(
  products,
  null,
  2,
)}\n`

await writeFile(outputPath, output)
