import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const sourceRoot =
  process.env.GUIDE_SOURCE ||
  'C:\\Users\\Administrator\\.accio\\accounts\\1755840170\\agents\\DID-F456DA-2B0D4C\\project\\english-guide-content-md'
const sourceDataFile = path.join(projectRoot, 'src', 'data', 'importedSeriesGuides.ts')
const outputSeoFile = path.join(projectRoot, 'src', 'data', 'guideSeo.ts')
const outputSeoJson = path.join(projectRoot, 'public', 'guide-seo.json')

function faqPage(entries) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: {
        '@type': 'Answer',
        text,
      },
    })),
  }
}

// These pages retain their established URLs and long-form educational copy, while
// presenting the storefront's crystal-first focus in visible titles, metadata, and
// entity descriptions. Chakra terminology remains supporting cultural context—not
// the primary commercial topic.
const CRYSTAL_FOCUS_META = {
  'chakra-seven-chakras-explained': {
    title: '7 Chakras and Their Meanings: Chakra Stones in Order',
    description:
      'A clear guide to the seven chakras, chakra stones in order, colors, traditional meanings, and reflective crystal practice.',
    keywords: ['7 chakras and their meanings', 'chakra stones in order', 'chakra stones chart', 'chakra stones meaning'],
    faq: faqPage([
      ['What are the 7 chakras in order?', 'The seven chakras are traditionally described from root to crown: root, sacral, solar plexus, heart, throat, third eye, and crown. Colors and crystal associations vary across traditions.'],
      ['Which crystal is best for each chakra?', 'Traditional associations include red stones for root, carnelian for sacral, citrine for solar plexus, rose quartz for heart, blue stones for throat, amethyst for third eye, and clear quartz or amethyst for crown.'],
      ['How do I use chakra crystals?', 'Wear or carry a stone, place it nearby during reflection, and pair it with a simple intention. Chakra traditions are symbolic frameworks, and crystals are not medical treatment.'],
      ['Are crystal meanings medical advice?', 'No. Crystal and energy-related statements are traditional beliefs for reflection and ritual; crystal jewelry is not a medical device or a substitute for professional care.'],
    ]),
  },
  'connect-02': {
    title: 'Crystal Intention Quiz: Find a Stone for Today',
    description:
      'Use a reflective crystal intention quiz to choose a stone by the feeling, color, and everyday ritual you want to support.',
    keywords: ['crystal quiz', 'find your crystal', 'crystal intentions', 'healing crystals'],
    faq: faqPage([
      ['How does the crystal intention quiz work?', 'The quiz invites you to reflect on the intention, color, and daily feeling that matter most to you, then suggests a crystal theme to explore.'],
      ['Is there a wrong answer in a crystal quiz?', 'No. Treat the result as a prompt for reflection rather than a diagnosis or fixed label; choose the stone that feels useful and beautiful to you today.'],
      ['Can crystals replace professional care?', 'No. Crystals are companions for personal ritual and reflection, not a replacement for medical, mental-health, legal, or financial advice.'],
    ]),
  },
  'worlds-01': {
    title: 'Grounding Crystals: Red Stone Meanings',
    description: 'Explore red and grounding crystal meanings, care, and a simple daily ritual for steady everyday reflection.',
    keywords: ['grounding crystals', 'red crystal meaning', 'red gemstone bracelet', 'crystal jewelry'],
    faq: faqPage([
      ['What are grounding crystals?', 'Grounding crystals are stones traditionally chosen for a steady, anchored ritual; red-toned pieces are a common place to begin.'],
      ['How can I wear a red crystal bracelet?', 'Wear it where it feels comfortable, let the color be a visual cue for your intention, and remove it before activities that may scratch or strain the jewelry.'],
    ]),
  },
  'worlds-02': {
    title: 'Creative Flow Crystals: Carnelian Meanings',
    description: 'Explore warm-toned crystal meanings for creativity, expression, and an easy everyday ritual.',
    keywords: ['carnelian meaning', 'orange crystals', 'creative flow crystals', 'crystal bracelet'],
    faq: faqPage([
      ['What does carnelian mean in traditional crystal symbolism?', 'Carnelian is traditionally associated with warmth, creative momentum, and expression; meanings vary by culture and personal practice.'],
      ['How do I care for an orange crystal bracelet?', 'Wipe it with a soft dry cloth, avoid perfume and hard impacts, and store it separately from harder jewelry when you are not wearing it.'],
    ]),
  },
  'worlds-03': {
    title: 'Confidence Crystals: Citrine Meanings',
    description: 'Explore golden crystal meanings for confidence, focus, and intentional action.',
    keywords: ['citrine meaning', 'confidence crystals', 'yellow crystals', 'gemstone bracelet'],
    faq: faqPage([
      ['What does citrine mean in traditional crystal symbolism?', 'Citrine is traditionally associated with bright focus, confidence, and purposeful action; it is a cultural meaning rather than a guaranteed result.'],
      ['How can a crystal support a daily intention?', 'Use the piece as a tactile or visual reminder, pair it with a short written intention, and return to it during a quiet moment in your day.'],
    ]),
  },
  'worlds-04': {
    title: 'Love Crystals: Rose Quartz Meanings',
    description: 'Explore pink and green crystal meanings for love, compassion, and self-acceptance.',
    keywords: ['rose quartz meaning', 'love crystals', 'pink crystal bracelet', 'crystal meanings'],
    faq: faqPage([
      ['What does rose quartz mean in traditional crystal symbolism?', 'Rose quartz is traditionally associated with love, compassion, and gentle self-reflection, making it a popular choice for personal rituals and gifts.'],
      ['How should I choose a love crystal?', 'Choose a stone whose color, material, and story you enjoy, then use it as a reminder of the relationship or self-care intention that matters to you.'],
    ]),
  },
  'worlds-05': {
    title: 'Clarity Crystals: Blue Stone Meanings',
    description: 'Explore blue crystal traditions, color, care, and mindful communication as part of a reflective crystal practice.',
    keywords: ['blue crystal meaning', 'clarity crystals', 'crystal meanings', 'crystal care'],
    faq: faqPage([
      ['What do blue crystals traditionally symbolize?', 'Blue crystals are often associated in traditional symbolism with calm expression, considered communication, and a slower, more reflective pace.'],
      ['Are crystal meanings universal?', 'No. Crystal symbolism comes from many living traditions and personal practices, so meanings are best used as invitations to reflect rather than fixed rules.'],
    ]),
  },
  'worlds-06': {
    title: 'Intuition Crystals: Amethyst Meanings',
    description: 'Explore purple crystal meanings for intuition, reflection, and quiet focus.',
    keywords: ['amethyst meaning', 'purple crystals', 'intuition crystals', 'amethyst bracelet'],
    faq: faqPage([
      ['What does amethyst mean in traditional crystal symbolism?', 'Amethyst is traditionally associated with stillness, reflection, and focused attention; many people choose it for a quiet daily ritual.'],
      ['How should I care for an amethyst bracelet?', 'Use a soft dry cloth, avoid harsh chemicals and impacts, and keep the piece out of prolonged direct sunlight to help preserve its color.'],
    ]),
  },
  'worlds-07': {
    title: 'Stillness Crystals: Clear Quartz Meanings',
    description: 'Explore clear and white crystal meanings for stillness, ritual, and reflection.',
    keywords: ['clear quartz meaning', 'clear crystals', 'stillness crystals', 'crystal ritual'],
    faq: faqPage([
      ['What does clear quartz mean in traditional crystal symbolism?', 'Clear quartz is commonly associated with clarity, intention, and ritual in many crystal traditions; people often choose it for its luminous, versatile appearance.'],
      ['How can I begin a simple crystal ritual?', 'Choose a quiet moment, hold or place your jewelry safely nearby, name one intention in plain language, and let the piece remind you of it during the week.'],
    ]),
  },
}

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
  const crystalFocus = CRYSTAL_FOCUS_META[id]
  guide.title = crystalFocus?.title || titleFromMeta(record.meta?.META_TITLE) || guide.title
  guide.excerpt = crystalFocus?.description || String(record.meta?.META_DESCRIPTION || guide.excerpt)
  guide.markdown = markdown
  seo[id] = {
    title: guide.title,
    description: guide.excerpt,
    keywords: crystalFocus?.keywords || [],
    faq: crystalFocus?.faq || record.meta?.FAQ_JSONLD || null,
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
