import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const sourceRoot =
  process.env.GUIDE_SOURCE ||
  'C:\\Users\\Administrator\\.accio\\accounts\\1755840170\\agents\\DID-F456DA-2B0D4C\\project\\english-guide-content-md'
const sourceDataFile = path.join(projectRoot, 'src', 'data', 'importedSeriesGuides.ts')
const outputSeoFile = path.join(projectRoot, 'src', 'data', 'guideSeo.ts')
const outputSeoJson = path.join(projectRoot, 'public', 'guide-seo.json')

function guideIdForSlug(slug) {
  const match = slug.match(/^(worlds|rituals|connect|crystals)-(\d{2})(?:-|$)/)
  if (match) return `${match[1]}-${match[2]}`
  return slug
}

function titleFromMeta(value) {
  return String(value || '')
    .replace(/\s*\|\s*Lunar Talisman\s*$/i, '')
    .trim()
}

function markdownWordCount(markdown) {
  return markdown.split(/\s+/).filter(Boolean).length
}

const mapping = JSON.parse(fs.readFileSync(path.join(sourceRoot, '_mapping.json'), 'utf8'))
const sourceText = fs.readFileSync(sourceDataFile, 'utf8')
const assignment = 'export const importedSeriesGuides: ImportedSeriesGuide[] = '
const start = sourceText.indexOf(assignment)
const end = sourceText.lastIndexOf('\n]')
if (start < 0 || end < 0) throw new Error('Could not locate imported guide records.')

const currentGuides = JSON.parse(sourceText.slice(start + assignment.length, end + 2))
const byId = new Map(currentGuides.map((guide) => [guide.id, guide]))
const seo = {}

for (const [slug, record] of Object.entries(mapping)) {
  const file = path.join(sourceRoot, `${slug}.md`)
  const markdown = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim()
  if (!markdown || markdownWordCount(markdown) < 100) {
    throw new Error(`English guide is unexpectedly short: ${slug}`)
  }
  const id = guideIdForSlug(slug)
  const guide = byId.get(id)
  if (!guide) throw new Error(`No existing guide record for ${slug} (resolved ${id})`)
  guide.title = titleFromMeta(record.meta?.META_TITLE) || guide.title
  guide.excerpt = String(record.meta?.META_DESCRIPTION || guide.excerpt)
  guide.markdown = markdown
  seo[id] = {
    title: guide.title,
    description: guide.excerpt,
    keywords: [],
    faq: record.meta?.FAQ_JSONLD || null,
    sourceSlug: slug,
    words: record.words,
  }
}

if (Object.keys(seo).length !== 37) {
  throw new Error(`Expected 37 guide mappings, received ${Object.keys(seo).length}`)
}
if (currentGuides.length !== 37) {
  throw new Error(`Expected 37 current guide records, received ${currentGuides.length}`)
}

const guideSource = `/* Generated from user-supplied English guide content. Do not edit manually. */

export type GuideSeries = 'worlds' | 'chakra' | 'rituals' | 'crystals' | 'connect'

export type ImportedSeriesGuide = {
  id: string
  series: GuideSeries
  title: string
  eyebrow: string
  excerpt: string
  color: string
  image: string
  markdown: string
}

export const importedSeriesGuides: ImportedSeriesGuide[] = ${JSON.stringify(currentGuides, null, 2)}
`
fs.writeFileSync(sourceDataFile, guideSource, 'utf8')

const seoSource = `/* Generated from user-supplied English guide metadata. Do not edit manually. */

export type GuideSeoRecord = {
  title: string
  description: string
  keywords: string[]
  faq: Record<string, unknown> | null
  sourceSlug: string
  words: number
}

export const GUIDE_SEO_META: Record<string, GuideSeoRecord> = ${JSON.stringify(seo, null, 2)}
`
fs.writeFileSync(outputSeoFile, seoSource, 'utf8')
fs.writeFileSync(outputSeoJson, `${JSON.stringify(seo, null, 2)}\n`, 'utf8')

console.log(`Synced ${Object.keys(seo).length} English guides.`)
