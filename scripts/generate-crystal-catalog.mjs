import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const sourceRoot = 'C:\\Users\\Administrator\\Desktop\\水晶图'
const projectRoot = process.cwd()
const publicProductsDir = path.join(projectRoot, 'public', 'products')
const generatedDataFile = path.join(projectRoot, 'src', 'data', 'importedProducts.ts')

const chakraFolders = [
  { prefix: '01-', id: 'root', name: 'Root Chakra', color: '#d98b7b' },
  { prefix: '02-', id: 'sacral', name: 'Sacral Chakra', color: '#e4ad7b' },
  { prefix: '03-', id: 'solar', name: 'Solar Plexus Chakra', color: '#ead58a' },
  { prefix: '04-', id: 'heart', name: 'Heart Chakra', color: '#a9d7a8' },
  { prefix: '05-', id: 'throat', name: 'Throat Chakra', color: '#9fcde0' },
  { prefix: '06-', id: 'third-eye', name: 'Third Eye Chakra', color: '#b2a9e1' },
  { prefix: '07-', id: 'crown', name: 'Crown Chakra', color: '#d8b4e5' },
]

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function normalizeText(value) {
  return value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

function section(text, title) {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(
    `(?:^|\\n)\\d+\\.\\s*${escapedTitle}\\s*\\n([\\s\\S]*?)(?=\\n\\d+\\.\\s|$)`,
    'i',
  )
  return normalizeText(text.match(pattern)?.[1] ?? '')
}

function toParagraphs(value) {
  return normalizeText(value)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/^[-•]\s*/gm, '').trim())
    .filter(Boolean)
}

function listItems(value) {
  return normalizeText(value)
    .split('\n')
    .map((line) => line.replace(/^[•*-]\s*/, '').trim())
    .filter(Boolean)
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'crystal-talisman'
}

function imageScore(fileName) {
  const value = fileName.toLowerCase()
  let score = 0
  if (value.includes('白底') || value.includes('white')) score += 100
  if (value.includes('正面') || value.includes('front')) score += 50
  if (value.includes('展示') || value.includes('display')) score += 35
  if (value.includes('45')) score += 20
  if (value.includes('手部') || value.includes('佩戴') || value.includes('特写')) score -= 15
  if (value.includes('截图') || value.includes('screen')) score -= 30
  return score
}

async function getFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(directory, entry.name))
}

async function getProductFolders(root) {
  const found = []
  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const textFiles = entries.filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.txt'),
    )
    if (textFiles.length) {
      found.push({
        directory,
        textFile: path.join(directory, textFiles[0].name),
      })
      return
    }

    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => walk(path.join(directory, entry.name))),
    )
  }

  await walk(root)
  return found
}

async function getProductImages(directory) {
  const files = await getFiles(directory)
  const images = files.filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
  if (!images.length) return []

  const primaryImage = images
    .map((file) => ({ file, score: imageScore(path.basename(file)) }))
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))[0].file

  const remainingImages = images
    .filter((file) => file !== primaryImage)
    .sort((a, b) =>
      path.basename(a).localeCompare(path.basename(b), undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    )

  return [primaryImage, ...remainingImages]
}

async function main() {
  await fs.mkdir(publicProductsDir, { recursive: true })
  const products = []
  const usedIds = new Set()

  for (const chakra of chakraFolders) {
    const sourceFolder = (await fs.readdir(sourceRoot, { withFileTypes: true }))
      .find((entry) => entry.isDirectory() && entry.name.startsWith(chakra.prefix))
    if (!sourceFolder) throw new Error(`Missing chakra folder for ${chakra.id}`)

    const folders = await getProductFolders(path.join(sourceRoot, sourceFolder.name))
    for (let index = 0; index < folders.length; index += 1) {
      const { directory, textFile } = folders[index]
      const sourceText = normalizeText(await fs.readFile(textFile, 'utf8'))
      const name = section(sourceText, 'Product Name') || path.basename(directory)
      const tagline = section(sourceText, 'Tagline') || `${chakra.name} crystal talisman.`
      const material = section(sourceText, 'Material')
      const energy = section(sourceText, 'Chakra & Energy')
      const benefits = listItems(section(sourceText, 'Benefits'))
      const howToWear = section(sourceText, 'How to Wear')
      const specs = section(sourceText, 'Specs')
      const careRitual = section(sourceText, 'Care & Ritual')
      const price = Number(specs.match(/Price:\s*\$(\d+(?:\.\d+)?)/i)?.[1] ?? 89)

      const baseId = `${chakra.id}-${slugify(name)}`
      const id = usedIds.has(baseId) ? `${baseId}-${index + 1}` : baseId
      usedIds.add(id)

      const productImages = await getProductImages(directory)
      if (!productImages.length) {
        throw new Error(`No product image found for ${name} (${directory})`)
      }

      const optimizedImages = []
      for (let imageIndex = 0; imageIndex < productImages.length; imageIndex += 1) {
        const outputName =
          imageIndex === 0 ? `${id}.webp` : `${id}-${imageIndex + 1}.webp`
        await sharp(productImages[imageIndex], { animated: false })
          .rotate()
          .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toFile(path.join(publicProductsDir, outputName))
        optimizedImages.push(`/products/${outputName}`)
      }

      products.push({
        id,
        chakra: chakra.id,
        chakraName: chakra.name,
        color: chakra.color,
        name,
        tagline,
        material,
        energy: toParagraphs(energy),
        benefits,
        howToWear: toParagraphs(howToWear),
        specs: listItems(specs).filter((item) => !/^price:/i.test(item)),
        careRitual: toParagraphs(careRitual),
        price,
        image: optimizedImages[0],
        images: optimizedImages,
      })
    }
  }

  const source = `/* This file is generated by scripts/generate-crystal-catalog.mjs. Do not edit manually. */

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
  image: string
  images: string[]
}

export const importedProducts: ImportedProduct[] = ${JSON.stringify(products, null, 2)}
`

  await fs.mkdir(path.dirname(generatedDataFile), { recursive: true })
  await fs.writeFile(generatedDataFile, source, 'utf8')

  console.log(`Generated ${products.length} products and optimized primary images.`)
  for (const chakra of chakraFolders) {
    console.log(`${chakra.id}: ${products.filter((product) => product.chakra === chakra.id).length}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
