import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const visibilityPath = path.join(rootDir, 'src', 'data', 'catalogVisibility.json')
const visibility = JSON.parse(fs.readFileSync(visibilityPath, 'utf8'))

export const PUBLIC_IMPORTED_PRODUCT_IDS = new Set(visibility.importedProductIds)
export const PUBLIC_LEGACY_PRODUCT_IDS = new Set(visibility.legacyProductIds)
