import { products } from './products'

export interface QuizQuestion {
  id: number
  question: string
  subtitle?: string
  icon: string
  chakraAccent: string
  options: QuizOption[]
}

export interface QuizOption {
  id: string
  label: string
  icon?: string
  chakraMapping: string[]
  zodiacAffinity?: string[]
}

export interface QuizResult {
  primaryChakra: string
  productIds: string[]
  reading: string
  affirmation: string
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: '你的星座是什么？',
    subtitle: '让星空为你指引',
    icon: 'Star',
    chakraAccent: 'chakra-crown',
    options: [
      { id: 'fire', label: '🔥 火象（白羊/狮子/射手）', chakraMapping: ['solar', 'root'] },
      { id: 'earth', label: '🌍 土象（金牛/处女/摩羯）', chakraMapping: ['root', 'heart'] },
      { id: 'air', label: '💨 风象（双子/天秤/水瓶）', chakraMapping: ['throat', 'third-eye'] },
      { id: 'water', label: '🌊 水象（巨蟹/天蝎/双鱼）', chakraMapping: ['sacral', 'crown'] },
    ],
  },
  {
    id: 2,
    question: '当前最想改善什么？',
    subtitle: '感受你此刻的能量需求',
    icon: 'Heart',
    chakraAccent: 'chakra-heart',
    options: [
      { id: 'love', label: '爱与关系', chakraMapping: ['heart'] },
      { id: 'confidence', label: '自信与行动力', chakraMapping: ['solar'] },
      { id: 'intuition', label: '直觉与洞察', chakraMapping: ['third-eye'] },
      { id: 'peace', label: '内心平静与安全感', chakraMapping: ['root'] },
      { id: 'creativity', label: '创造力与灵感', chakraMapping: ['sacral'] },
      { id: 'expression', label: '表达与沟通', chakraMapping: ['throat'] },
    ],
  },
  {
    id: 3,
    question: '哪种颜色最吸引你？',
    subtitle: '你的灵魂在选择它的共振频率',
    icon: 'Palette',
    chakraAccent: 'chakra-third-eye',
    options: [
      { id: 'red', label: '大地红 · 温暖扎根', chakraMapping: ['root'] },
      { id: 'orange', label: '蜜橙 · 流动与激情', chakraMapping: ['sacral'] },
      { id: 'gold', label: '蜂蜜金 · 光明与力量', chakraMapping: ['solar'] },
      { id: 'green', label: '鼠尾草绿 · 爱与疗愈', chakraMapping: ['heart'] },
      { id: 'blue', label: '雾蓝 · 宁静与表达', chakraMapping: ['throat'] },
      { id: 'purple', label: '紫水晶 · 灵性与直觉', chakraMapping: ['third-eye', 'crown'] },
    ],
  },
]

const chakraPriority = [
  'crown',
  'third-eye',
  'heart',
  'solar',
  'root',
  'sacral',
  'throat',
]

const chakraReadings: Record<string, { reading: string; affirmation: string }> = {
  root: {
    reading:
      '你的能量正在寻找更稳定的落点。最近你可能比平时更需要安全感、秩序感和身体层面的确认。适合选择能帮助你扎根的水晶，让自己先慢下来，再重新行动。',
    affirmation: '我安全，我扎根，我属于这片大地。',
  },
  sacral: {
    reading:
      '你的创造力正在回潮，只是它需要一点更柔软的空间。你适合靠近流动感强、能激活感受力的水晶。它会提醒你：灵感不是被逼出来的，而是在被允许时自然升起。',
    affirmation: '我拥抱创造力，我感受生命的流动。',
  },
  solar: {
    reading:
      '你的太阳轮正在呼唤更清晰的行动力。你已经知道自己想要什么，只是需要一个更明亮的推力。选择金色系或火元素水晶，会像一个小小的勇气开关，帮你把决定带进现实。',
    affirmation: '我充满力量，我勇敢行动，我相信自己。',
  },
  heart: {
    reading:
      '你的心轮需要被温柔照顾。你可能正在学习如何给予爱，也如何不忘记接住自己。适合选择疗愈感、亲密感更强的水晶，让边界和柔软同时存在。',
    affirmation: '我给予爱，我接受爱，我的心是敞开的。',
  },
  throat: {
    reading:
      '你的表达能量正在等待被打开。也许有些真实想法已经停留很久，只差一个出口。喉轮系水晶会帮助你整理语言、说出边界，并让自己的声音被更清楚地听见。',
    affirmation: '我说出真相，我表达自我，我被听见。',
  },
  'third-eye': {
    reading:
      '你的眉心轮很活跃，直觉正在给你微弱但清晰的信号。适合选择紫水晶、青金石一类能帮助洞察与梦境整理的水晶。此刻与其向外寻找答案，不如先相信内在的第一反应。',
    affirmation: '我信任直觉，我洞察真相，我的视野清晰。',
  },
  crown: {
    reading:
      '你的能量正在向更高频的连接打开。你可能对月相、梦境、符号和灵性感受更敏锐。顶轮系水晶适合帮助你净化杂讯，把直觉、信念和行动重新连成一条温柔的光线。',
    affirmation: '我与宇宙合一，我接受神圣指引，我是光。',
  },
}

export function calculateResult(answers: string[][]): QuizResult {
  const scores = new Map<string, number>()

  answers.flat().forEach((chakraId) => {
    scores.set(chakraId, (scores.get(chakraId) ?? 0) + 1)
  })

  const primaryChakra =
    Array.from(scores.entries()).sort((left, right) => {
      if (right[1] !== left[1]) return right[1] - left[1]

      return chakraPriority.indexOf(left[0]) - chakraPriority.indexOf(right[0])
    })[0]?.[0] ?? 'crown'

  const recommended = products
    .filter(
      (product) =>
        product.primaryChakra === primaryChakra ||
        product.secondaryChakra === primaryChakra,
    )
    .slice(0, 2)

  const fallback = products
    .filter((product) => !recommended.some((item) => item.id === product.id))
    .sort((left, right) => right.rating - left.rating)

  const productIds = [...recommended, ...fallback].slice(0, 2).map((product) => product.id)
  const reading = chakraReadings[primaryChakra] ?? chakraReadings.crown

  return {
    primaryChakra,
    productIds,
    reading: reading.reading,
    affirmation: reading.affirmation,
  }
}
