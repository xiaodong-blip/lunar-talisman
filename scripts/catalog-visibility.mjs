import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const visibilityPath = path.join(rootDir, 'src', 'data', 'catalogVisibility.json')
const visibility = JSON.parse(fs.readFileSync(visibilityPath, 'utf8'))
const productDataPath = path.join(rootDir, 'src', 'data', 'importedProducts.ts')
const productData = fs.readFileSync(productDataPath, 'utf8')
const moderationMarker = 'const PUBLIC_PRODUCT_IMAGE_INDICES: Record<string, readonly number[]> = '
const moderationStart = productData.indexOf(moderationMarker)
const moderationEnd = productData.indexOf('\n}\n\nexport const importedProducts', moderationStart)

if (moderationStart < 0 || moderationEnd < 0) {
  throw new Error('Could not locate product image moderation configuration.')
}

const approvedImageIndices = Function(
  `"use strict"; return (${productData.slice(
    moderationStart + moderationMarker.length,
    moderationEnd + 2,
  )})`,
)()

export const PUBLIC_IMPORTED_PRODUCT_IDS = new Set(visibility.importedProductIds)
export const PUBLIC_LEGACY_PRODUCT_IDS = new Set(visibility.legacyProductIds)

export function applyPublicProductImageModeration(product) {
  const approvedIndices = approvedImageIndices[product.id]
  if (!approvedIndices) return product

  const images = approvedIndices
    .map((index) => product.images[index])
    .filter(Boolean)

  return {
    ...product,
    image: images[0] || product.image,
    images,
  }
}
