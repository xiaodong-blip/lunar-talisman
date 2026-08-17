import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const sourceRoot = 'C:\\Users\\Administrator\\Desktop\\Lunar-Talisman-网站内容'
const projectRoot = process.cwd()
const outputImageDir = path.join(projectRoot, 'public', 'guides')
const outputDataFile = path.join(projectRoot, 'src', 'data', 'importedSeriesGuides.ts')

const entries = [
  ...[
    ['00-旅程总览', 'A Map of Your Crystal Journey'],
    ['01-海底轮世界', 'Root Chakra World'],
    ['02-脐轮世界', 'Sacral Chakra World'],
    ['03-太阳轮世界', 'Solar Plexus Chakra World'],
    ['04-心轮世界', 'Heart Chakra World'],
    ['05-喉轮世界', 'Throat Chakra World'],
    ['06-眉心轮世界', 'Third Eye World'],
    ['07-顶轮世界', 'Crown Chakra World'],
    ['08-新手启程指南', 'First Steps with Crystals'],
    ['09-能量频率指南', 'Energy Frequency Guide'],
  ].map(([file, title]) => ({
    id: `worlds-${file.slice(0, 2)}`,
    series: 'worlds',
    sourceDirectory: '01-WORLDS-水晶旅程',
    imageDirectory: 'worlds',
    file,
    title,
    eyebrow: 'Crystal Journey',
    color: '#dcd2f2',
    excerpt: 'A reflective guide for finding the crystal path that meets your present energy.',
  })),
  ...[
    ['00-月相仪式总览', 'A Complete Guide to Lunar Rituals'],
    ['01-新月仪式', 'New Moon Ritual'],
    ['02-满月仪式', 'Full Moon Ritual'],
    ['03-下弦月释放仪式', 'Waning Moon Release Ritual'],
    ['04-上弦月行动仪式', 'Waxing Moon Action Ritual'],
    ['05-水晶净化方法大全', 'Crystal Cleansing Methods'],
    ['06-水晶充能方法大全', 'Crystal Charging Methods'],
    ['07-设定意图指南', 'How to Set an Intention'],
    ['08-仪式工具与圣坛', 'Ritual Tools & Your Altar'],
    ['09-月相仪式Q&A', 'Lunar Ritual Q&A'],
  ].map(([file, title]) => ({
    id: `rituals-${file.slice(0, 2)}`,
    series: 'rituals',
    sourceDirectory: '03-RITUALS-月相仪式',
    imageDirectory: 'rituals',
    file,
    title,
    eyebrow: 'Lunar Rituals',
    color: '#c3e3f4',
    excerpt: 'A practical moon-led ritual guide for creating a quieter, more intentional rhythm.',
  })),
  ...[
    ['00-连接导览', 'Connection Guide'],
    ['01-水晶匹配测试', 'Crystal Matching Quiz'],
    ['02-脉轮自测问卷', 'Chakra Self-Check'],
    ['03-守护石选择指南', 'How to Choose Your Guardian Stone'],
    ['04-第一次佩戴指南', 'Your First Wear Guide'],
    ['05-能量激活证书使用说明', 'Your Energy Activation Certificate'],
    ['06-满月加持服务说明', 'Full Moon Blessing Service'],
  ].map(([file, title]) => ({
    id: `connect-${file.slice(0, 2)}`,
    series: 'connect',
    sourceDirectory: '06-CONNECT-开始连接',
    imageDirectory: 'connect',
    file,
    title,
    eyebrow: 'Begin the Connection',
    color: '#ece7fb',
    excerpt: 'A gentle next step for choosing, wearing, and building a personal ritual with your talisman.',
  })),
  {
    id: 'chakra-seven-chakras-explained',
    series: 'chakra',
    sourceDirectory: '05-CODEX-月之典籍',
    imageDirectory: 'codex',
    file: '01-七脉轮全解',
    title: 'The Seven Chakras Explained',
    eyebrow: 'Chakra Healing',
    color: '#dcedc2',
    excerpt: 'A complete reference for the seven energy centres, their traditional symbolism, and daily grounding practices.',
  },
  ...[
    ['00-知识库导览', 'Crystal Knowledge Guide'],
    ['02-水晶百科-红黑色系', 'Red & Black Crystal Guide'],
    ['03-水晶百科-橙黄色系', 'Orange & Yellow Crystal Guide'],
    ['04-水晶百科-绿粉色系', 'Green & Pink Crystal Guide'],
    ['05-水晶百科-蓝紫色系', 'Blue & Purple Crystal Guide'],
    ['06-水晶百科-白透明系', 'Clear & White Crystal Guide'],
  ].map(([file, title]) => ({
    id: `crystals-${file.slice(0, 2)}`,
    series: 'crystals',
    sourceDirectory: '05-CODEX-月之典籍',
    imageDirectory: 'codex',
    file,
    title,
    eyebrow: 'Crystal Talismans',
    color: '#f3cdd6',
    excerpt: 'A crystal reference guide to help you understand colour, symbolism, and how to choose with care.',
  })),
  {
    id: 'rituals-moon-phase-guide',
    series: 'rituals',
    sourceDirectory: '05-CODEX-月之典籍',
    imageDirectory: 'codex',
    file: '07-月相百科',
    title: 'Moon Phases Guide',
    eyebrow: 'Lunar Rituals',
    color: '#c3e3f4',
    excerpt: 'Understand the lunar cycle and choose a ritual rhythm that feels natural to you.',
  },
  {
    id: 'worlds-five-elements-guide',
    series: 'worlds',
    sourceDirectory: '05-CODEX-月之典籍',
    imageDirectory: 'codex',
    file: '08-五行水晶对应',
    title: 'Five Elements & Crystal Guide',
    eyebrow: 'Crystal Journey',
    color: '#dcd2f2',
    excerpt: 'Explore traditional five-element correspondences as another lens for crystal reflection and selection.',
  },
  {
    id: 'connect-crystal-care-faq',
    series: 'connect',
    sourceDirectory: '05-CODEX-月之典籍',
    imageDirectory: 'codex',
    file: '10-常见问题',
    title: 'Crystal Care FAQ',
    eyebrow: 'Begin the Connection',
    color: '#ece7fb',
    excerpt: 'Simple answers to common questions about choosing, wearing, cleansing, and caring for your talisman.',
  },
]

function normalizeMarkdown(value) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\uFEFF/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  await fs.mkdir(outputImageDir, { recursive: true })
  const guides = []

  for (const entry of entries) {
    const contentPath = path.join(sourceRoot, entry.sourceDirectory, `${entry.file}.md`)
    const imagePath = path.join(
      sourceRoot,
      entry.imageDirectory ?? entry.sourceDirectory,
      'images',
      `${entry.file}_1.png`,
    )
    const markdown = normalizeMarkdown(await fs.readFile(contentPath, 'utf8'))
    const outputName = `${toSlug(entry.id)}.webp`

    await sharp(imagePath, { animated: false })
      .rotate()
      .resize({ width: 1440, height: 1100, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(path.join(outputImageDir, outputName))

    guides.push({
      id: entry.id,
      series: entry.series,
      title: entry.title,
      eyebrow: entry.eyebrow,
      excerpt: entry.excerpt,
      color: entry.color,
      image: `/guides/${outputName}`,
      markdown,
    })
  }

  const source = `/* Generated from user-supplied reference content. Do not edit manually. */

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

export const importedSeriesGuides: ImportedSeriesGuide[] = ${JSON.stringify(guides, null, 2)}
`

  await fs.writeFile(outputDataFile, source, 'utf8')
  console.log(`Generated ${guides.length} guide records and optimized guide images.`)
  for (const series of ['worlds', 'chakra', 'rituals', 'crystals', 'connect']) {
    console.log(`${series}: ${guides.filter((guide) => guide.series === series).length}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
