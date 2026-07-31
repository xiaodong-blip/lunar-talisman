export type ChakraKey =
  | 'root'
  | 'sacral'
  | 'solar'
  | 'heart'
  | 'throat'
  | 'third-eye'
  | 'crown'

export type SiteProduct = {
  id: string
  name: string
  collection: string
  chakra: ChakraKey
  tone: string
  price: number
  description: string
  materials: string[]
  energies: string[]
  rituals: string[]
}

export type CollectionItem = {
  id: string
  title: string
  subtitle: string
  description: string
  chakra: ChakraKey
  featuredIds: string[]
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  paragraphs: string[]
}

export const chakraMap: Record<
  ChakraKey,
  { label: string; color: string; meaning: string }
> = {
  root: { label: '海底轮', color: '#c4816b', meaning: '扎根与安全感' },
  sacral: { label: '脐轮', color: '#d49a6a', meaning: '创造与流动' },
  solar: { label: '太阳轮', color: '#d4b76a', meaning: '自信与行动' },
  heart: { label: '心轮', color: '#8aa88a', meaning: '疗愈与联结' },
  throat: { label: '喉轮', color: '#8aa4b8', meaning: '表达与真实' },
  'third-eye': { label: '眉心轮', color: '#8a8eb8', meaning: '直觉与洞察' },
  crown: { label: '顶轮', color: '#9b8ec4', meaning: '连接与灵性' },
}

export const collections: CollectionItem[] = [
  {
    id: 'zodiac',
    title: 'Zodiac 星象系列',
    subtitle: '紫脉轮 / 顶轮',
    description: '为敏感、直觉强、常常和宇宙频道接线的人准备。',
    chakra: 'crown',
    featuredIds: ['amethyst-crown', 'moon-archive'],
  },
  {
    id: 'chakra',
    title: 'Chakra 能量系列',
    subtitle: '绿脉轮 / 心轮',
    description: '适合疗愈、修复边界感、重新把心安稳放回身体里。',
    chakra: 'heart',
    featuredIds: ['sage-bridge', 'solar-amber'],
  },
  {
    id: 'lunar',
    title: 'Lunar 月相系列',
    subtitle: '金脉轮 / 太阳轮',
    description: '面向仪式感、行动力和想让日子更明亮的人。',
    chakra: 'solar',
    featuredIds: ['lunar-orbit', 'dawn-pearl'],
  },
]

export const products: SiteProduct[] = [
  {
    id: 'amethyst-crown',
    name: '紫晶月冠手链',
    collection: 'Zodiac 星象系列',
    chakra: 'crown',
    tone: '柔紫晶',
    price: 288,
    description: '帮助你把注意力收回来，安静地听见内心的方向。',
    materials: ['紫水晶', '925 银扣', '弹力绳'],
    energies: ['直觉', '清明', '静心'],
    rituals: ['晨起佩戴 3 分钟', '在月光下静置', '冥想时轻握'],
  },
  {
    id: 'moon-archive',
    name: '月档案项链',
    collection: 'Zodiac 星象系列',
    chakra: 'third-eye',
    tone: '靛蓝冷光',
    price: 328,
    description: '更适合整理脑内噪音，让判断变得安静、准确。',
    materials: ['拉长石', '包金吊坠', '细链'],
    energies: ['洞察', '梦境', '专注'],
    rituals: ['写下本周意图', '贴近锁骨佩戴', '睡前取下擦拭'],
  },
  {
    id: 'sage-bridge',
    name: '鼠尾草绿戒指',
    collection: 'Chakra 能量系列',
    chakra: 'heart',
    tone: '雾绿',
    price: 198,
    description: '把温柔重新接回手上，适合恢复边界和安全感。',
    materials: ['东陵玉', '可调戒圈', '镀金点缀'],
    energies: ['疗愈', '联结', '安心'],
    rituals: ['洗手后佩戴', '对镜深呼吸', '写三件感恩的小事'],
  },
  {
    id: 'solar-amber',
    name: '蜂蜜金耳钉',
    collection: 'Chakra 能量系列',
    chakra: 'solar',
    tone: '暖金',
    price: 238,
    description: '亮一点、稳一点，给当天的决定多一点能量背书。',
    materials: ['黄水晶', '925 银针', '微镶镀金'],
    energies: ['行动', '自信', '表达'],
    rituals: ['出门前佩戴', '记录一件完成的事', '晚间收纳于盒中'],
  },
  {
    id: 'lunar-orbit',
    name: '月轨手串',
    collection: 'Lunar 月相系列',
    chakra: 'solar',
    tone: '蜂蜜金',
    price: 268,
    description: '让日常更像一个有方向的仪式，而不是散开的碎片。',
    materials: ['黄水晶', '珍珠', '金属隔珠'],
    energies: ['秩序', '节奏', '愿望'],
    rituals: ['固定在早晨佩戴', '搭配月相记录', '一周净化一次'],
  },
  {
    id: 'dawn-pearl',
    name: '晨光珍珠吊坠',
    collection: 'Lunar 月相系列',
    chakra: 'root',
    tone: '奶油白',
    price: 256,
    description: '像清晨第一口空气，柔和却能把人稳稳托住。',
    materials: ['淡水珍珠', '红玉髓', '包金链'],
    energies: ['扎根', '安心', '守护'],
    rituals: ['在入睡前收回盒中', '旅行时随身佩戴', '搭配一句肯定语'],
  },
]

export const blogPosts: BlogPost[] = [
  {
    slug: 'moon-phase-rituals',
    title: '月相与佩戴：让水晶跟着节奏呼吸',
    excerpt: '把水晶佩戴变成一个有节奏感的小仪式。',
    category: '月相指南',
    readTime: '4 分钟',
    paragraphs: [
      '新月适合写意图，满月适合清理和感谢，佩戴时的心念比动作本身更重要。',
      '如果你正在建立水晶习惯，把佩戴、收纳和净化固定在同一个时间点，会更容易坚持。',
      '不需要复杂规则，稳定地重复，就是最温柔也最有效的方式。',
    ],
  },
  {
    slug: 'chakra-color-match',
    title: '七脉轮配色如何影响视觉情绪',
    excerpt: '颜色不是装饰，它会先于文字抵达人的感受。',
    category: '配色灵感',
    readTime: '5 分钟',
    paragraphs: [
      '暖奶油底色会把整个界面往松弛、明亮的方向推，让脉轮色更像功能高光而不是噪音。',
      '每个脉轮色都承担不同任务：红色扎根，金色行动，紫色则负责灵性与想象。',
      '当主色明确、辅色克制时，页面更容易形成记忆点，也更容易被信任。',
    ],
  },
  {
    slug: 'charging-stones-gently',
    title: '温柔净化：给水晶一个安静的收尾',
    excerpt: '不需要仪式感过量，关键是让动作和意图都足够清楚。',
    category: '养护方法',
    readTime: '3 分钟',
    paragraphs: [
      '放在自然光下、以清水擦拭、配合短暂冥想，已经足够构成一次完整的净化。',
      '如果饰品经常佩戴，建议形成固定的晚间收纳动作，让它有回到“休息状态”的信号。',
      '养护的核心不是流程，而是你对它的照顾有没有持续。',
    ],
  },
]
