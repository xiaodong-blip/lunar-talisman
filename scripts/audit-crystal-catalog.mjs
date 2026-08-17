import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const sourceRoot = 'C:\\Users\\Administrator\\Desktop\\水晶图'
const projectRoot = process.cwd()
const generatedDataFile = path.join(projectRoot, 'src', 'data', 'importedProducts.ts')

const chakraFolders = [
  { prefix: '01-', id: 'root' },
  { prefix: '02-', id: 'sacral' },
  { prefix: '03-', id: 'solar' },
  { prefix: '04-', id: 'heart' },
  { prefix: '05-', id: 'throat' },
  { prefix: '06-', id: 'third-eye' },
  { prefix: '07-', id: 'crown' },
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
  if (
    value.includes('白底') ||
    value.includes('white') ||
    value.includes('产品完整') ||
    value.includes('完整居中')
  ) {
    score += 1000
  }
  if (value.includes('正面') || value.includes('front')) score += 850
  if (value.includes('展示') || value.includes('display')) score += 700
  if (value.includes('45') || value.includes('斜侧')) score += 550
  if (value.includes('主体')) score += 500
  if (value.includes('手部') || value.includes('佩戴') || value.includes('手腕') || value.includes('小臂')) {
    score -= 700
  }
  if (value.includes('露脸') || value.includes('生活化') || value.includes('lifestyle')) score -= 850
  if (value.includes('特写') || value.includes('细节') || value.includes('macro')) score -= 500
  if (value.includes('截图') || value.includes('screen')) score -= 1000
  if (/^1\.(png|jpe?g|webp)$/i.test(fileName)) score += 400
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
      found.push({ directory, textFile: path.join(directory, textFiles[0].name) })
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

async function sourceImages(directory) {
  const images = (await getFiles(directory)).filter((file) =>
    imageExtensions.has(path.extname(file).toLowerCase()),
  )
  return images
    .map((file) => ({
      file,
      score: imageScore(path.basename(file)),
    }))
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
}

async function colorFeature(file) {
  const { data } = await sharp(file)
    .rotate()
    .removeAlpha()
    .resize({ width: 48, height: 48, fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const bins = new Array(64).fill(0)
  for (let index = 0; index < data.length; index += 3) {
    const red = data[index] >> 6
    const green = data[index + 1] >> 6
    const blue = data[index + 2] >> 6
    bins[red * 16 + green * 4 + blue] += 1
  }
  const magnitude = Math.hypot(...bins) || 1
  return bins.map((value) => value / magnitude)
}

function cosineSimilarity(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0)
}

async function main() {
  const raw = await fs.readFile(generatedDataFile, 'utf8')
  const dataJson = raw
    .split('export const importedProducts: ImportedProduct[] = ')[1]
    .replace(/\n$/, '')
  const generatedProducts = JSON.parse(dataJson)
  const generatedById = new Map(generatedProducts.map((product) => [product.id, product]))
  const expected = []
  const usedIds = new Set()

  for (const chakra of chakraFolders) {
    const chakraFolder = (await fs.readdir(sourceRoot, { withFileTypes: true }))
      .find((entry) => entry.isDirectory() && entry.name.startsWith(chakra.prefix))
    if (!chakraFolder) throw new Error(`Missing source folder: ${chakra.id}`)

    const folders = await getProductFolders(path.join(sourceRoot, chakraFolder.name))
    for (let index = 0; index < folders.length; index += 1) {
      const { directory, textFile } = folders[index]
      const text = normalizeText(await fs.readFile(textFile, 'utf8'))
      const name = section(text, 'Product Name') || path.basename(directory)
      const baseId = `${chakra.id}-${slugify(name)}`
      const id = usedIds.has(baseId) ? `${baseId}-${index + 1}` : baseId
      usedIds.add(id)
      expected.push({
        id,
        name,
        chakra: chakra.id,
        directory,
        images: await sourceImages(directory),
      })
    }
  }

  const errors = []
  const primaryKinds = { white: 0, front: 0, display: 0, angle: 0, numbered: 0, fallback: 0 }
  const fallbackPrimary = []
  const consistencyScores = []

  for (const item of expected) {
    const generated = generatedById.get(item.id)
    if (!generated) {
      errors.push(`Missing generated product: ${item.id}`)
      continue
    }
    if (generated.name !== item.name) {
      errors.push(`Name mismatch: ${item.id}`)
    }
    if (!Array.isArray(generated.images) || generated.images.length !== item.images.length) {
      errors.push(`Image count mismatch: ${item.id}`)
    }
    for (const image of generated.images ?? []) {
      const file = path.join(projectRoot, 'public', image.replace(/^\//, ''))
      try {
        await fs.access(file)
      } catch {
        errors.push(`Missing optimized image: ${image}`)
      }
    }

    const primaryName = path.basename(item.images[0]?.file ?? '')
    const lower = primaryName.toLowerCase()
    if (lower.includes('白底') || lower.includes('white') || lower.includes('产品完整')) primaryKinds.white += 1
    else if (lower.includes('正面') || lower.includes('front')) primaryKinds.front += 1
    else if (lower.includes('展示') || lower.includes('display')) primaryKinds.display += 1
    else if (lower.includes('45') || lower.includes('斜侧')) primaryKinds.angle += 1
    else if (/^1\.(png|jpe?g|webp)$/i.test(primaryName)) primaryKinds.numbered += 1
    else {
      primaryKinds.fallback += 1
      fallbackPrimary.push(`${item.id} → ${primaryName}`)
    }

    if (item.images.length > 1) {
      const features = await Promise.all(item.images.map(({ file }) => colorFeature(file)))
      const primaryFeature = features[0]
      const scores = features.slice(1).map((feature) => cosineSimilarity(primaryFeature, feature))
      consistencyScores.push({
        id: item.id,
        score: Math.min(...scores),
        mean: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      })
    }
  }

  if (generatedProducts.length !== expected.length) {
    errors.push(
      `Product count mismatch: generated ${generatedProducts.length}, source ${expected.length}`,
    )
  }
  if (generatedById.size !== expected.length) {
    errors.push('Generated product IDs are not unique.')
  }

  console.log(`Source products: ${expected.length}`)
  console.log(`Generated products: ${generatedProducts.length}`)
  console.log(`Name matches: ${expected.length - errors.filter((item) => item.startsWith('Name mismatch')).length}/${expected.length}`)
  console.log(`Image groups matched: ${expected.length - errors.filter((item) => item.startsWith('Image count mismatch')).length}/${expected.length}`)
  console.log(`Primary image selection: ${JSON.stringify(primaryKinds)}`)
  if (fallbackPrimary.length) {
    console.log(`Fallback primary files:\n${fallbackPrimary.join('\n')}`)
  }
  console.log(
    `Lowest primary-image similarity:\n${consistencyScores
      .sort((left, right) => left.mean - right.mean)
      .slice(0, 30)
      .map((item) => `${item.id} → ${(item.mean * 100).toFixed(1)}%`)
      .join('\n')}`,
  )
  console.log(`Errors: ${errors.length}`)
  if (errors.length) {
    console.log(errors.join('\n'))
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
