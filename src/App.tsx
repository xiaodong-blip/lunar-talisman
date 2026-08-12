import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode, WheelEvent } from 'react'
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  X,
} from 'lucide-react'
import AdminPage from './AdminPage'
import { usePageMeta } from './hooks/usePageMeta'
import { trackPageView } from './services/analytics'
import { appendOrder } from './services/orders'
import type { PublicOrder } from './services/orders'
import { createPublicOrder, fetchPublishedProducts } from './services/backend'

const PORTAL_BG =
  'https://flick-award-65707097.figma.site/_assets/v11/bbc8d4f1308d5df012c4b0a657b44c6d92609c24.png'
const CURTAIN_LEFT =
  'https://flick-award-65707097.figma.site/_assets/v11/535b5bc4f8b600a7758bc74dc3540f405f0b89a6.png'
const CURTAIN_RIGHT =
  'https://flick-award-65707097.figma.site/_assets/v11/ab14033a7fe6dcedbae303726331b6a26d9d201c.png'
const WORLD_BG =
  'https://flick-award-65707097.figma.site/_assets/v11/4f4f0651516e75fbfeebf87e12be372c0683a7fd.png'
const BOTTOM_CLOUDS =
  'https://flick-award-65707097.figma.site/_assets/v11/fb811f79bccceab1c4cdbb81b5524632cffc9c52.png'

const CARD_IMAGES = [
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85',
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85',
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85',
]

const MAG = {
  world: 6,
  clouds: 9,
  portal: 7,
  curtainL: 14,
  curtainR: 14,
}

type NavigateFn = (path: string) => void
type Route =
  | { page: 'home' }
  | { page: 'series'; id: string }
  | { page: 'detail'; id: string }
  | { page: 'cart' }
  | { page: 'admin' }
  | { page: 'legal'; id: 'privacy' | 'terms' | 'shipping' | 'refund' | 'contact' }

type Tile = {
  id: string
  title: string
  desc: string
  color: string
  image?: string
  eyebrow?: string
  target: string
}

type SeriesPageData = {
  id: string
  title: string
  eyebrow: string
  desc: string
  color: string
  tiles: Tile[]
}

type DetailData = {
  id: string
  eyebrow: string
  title: string
  desc: string
  color: string
  image?: string
  specs: string[]
  body: string[]
}

type CartLine = {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  color: string
  eyebrow: string
}

type StoredAdminProduct = {
  id: string
  name: string
  collection: string
  price: number
  stock: number
  image: string
  status: '上架' | '草稿'
}

const ADMIN_PRODUCT_KEY = 'lunar-talisman-admin-products'
const CART_KEY = 'lunar-talisman-cart'
const ADMIN_SEED_PRODUCT_IDS = new Set(['P-001', 'P-002', 'P-003'])
const REMOVED_ZODIAC_IDS = new Set([
  'zodiac',
  'scorpio-amethyst',
  'aries-carnelian',
  'taurus-rose-quartz',
  'gemini-aquamarine',
  'cancer-moonstone',
  'leo-citrine',
  'virgo-amazonite',
  'libra-rose-quartz',
  'sagittarius-lapis',
  'capricorn-garnet',
  'aquarius-fluorite',
  'pisces-amethyst',
])

const PRODUCTS: DetailData[] = [
  {
    id: 'scorpio-amethyst',
    eyebrow: 'Zodiac Guardian',
    title: '天蝎守护 · 紫水晶手链',
    desc: '眉心轮的直觉之石，为天蝎与双鱼守护。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    specs: ['眉心轮', '紫水晶', '水象星座', '新月净化'],
    body: [
      '专为天蝎座打造的守护手链。紫水晶对应眉心轮，传说能增强直觉力，在月食之夜尤为强大。',
      '每一颗紫水晶珠都经过新月仪式净化，承载深邃的转化能量，适合在冥想、书写意图和睡前佩戴。',
    ],
  },
  {
    id: 'heart-rose-quartz',
    eyebrow: 'Heart Chakra',
    title: '心轮疗愈 · 玫瑰晶手链',
    desc: '心轮柔光，打开爱与自我接纳。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    specs: ['心轮', '玫瑰晶', '爱与关系', '满月净化'],
    body: [
      '玫瑰晶是心轮的代表水晶，传说能打开心扉，吸引无条件的爱。',
      '它不只关于浪漫爱情，也关于自我接纳、柔软边界和重新学习信任。',
    ],
  },
  {
    id: 'solar-citrine',
    eyebrow: 'Solar Plexus',
    title: '太阳轮 · 黄水晶勇气手链',
    desc: '太阳轮金色频率，点亮行动与自信。',
    color: '#f0e4c0',
    image: CARD_IMAGES[2],
    specs: ['太阳轮', '黄水晶', '行动力', '火元素'],
    body: [
      '黄水晶对应太阳轮，是自信与行动力的水晶化身。',
      '适合在做决定、启动新计划或需要驱散自我怀疑时佩戴。',
    ],
  },
  {
    id: 'new-moon-set',
    eyebrow: 'Lunar Ritual',
    title: '新月仪式 · 净化套装',
    desc: '白水晶、鼠尾草与意图卡的开端仪式。',
    color: '#c3e3f4',
    image: CARD_IMAGES[0],
    specs: ['新月', '白水晶', '鼠尾草', '意图书写'],
    body: [
      '新月仪式限定套装：白水晶手链、白鼠尾草棒与仪式指南卡。',
      '适合在新的周期开始时使用，为下一阶段设置温柔而清晰的方向。',
    ],
  },
  {
    id: 'root-garnet',
    eyebrow: 'Root Chakra',
    title: '海底轮 · 红石榴石扎根手链',
    desc: '海底轮扎根感，把安全感交还身体。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    specs: ['海底轮', '红石榴石', '土元素', '安全感'],
    body: [
      '红石榴石对应海底轮，帮助你扎根大地、找到稳定感。',
      '适合在焦虑、漂浮或需要重新建立边界时佩戴。',
    ],
  },
  {
    id: 'full-moon-necklace',
    eyebrow: 'Full Moon',
    title: '满月祝福 · 月光石项链',
    desc: '顶轮与眉心轮的满月祝福项链。',
    color: '#dcedc2',
    image: CARD_IMAGES[2],
    specs: ['满月', '月光石', '顶轮', '直觉'],
    body: [
      '满月之夜加持的月光石项链，与顶轮和眉心轮产生温柔共振。',
      '适合在满月净化、梦境记录或需要直觉指引时佩戴。',
    ],
  },
]

const ZODIAC_DETAILS: DetailData[] = [
  {
    id: 'aries-carnelian',
    eyebrow: 'Aries Guardian',
    title: '白羊守护 · 红玉髓勇气手链',
    desc: '火象白羊的行动护符，点燃勇气、热情与开创力。',
    color: '#f2cfb4',
    image: CARD_IMAGES[2],
    specs: ['白羊座', '红玉髓', '太阳轮', '火元素'],
    body: [
      '白羊座适合明亮、直接、能推动行动的晶石。红玉髓像一簇贴近身体的小火焰，提醒你把想法真正启动。',
      '适合在新项目、运动、谈判和需要突破拖延时佩戴。',
    ],
  },
  {
    id: 'taurus-rose-quartz',
    eyebrow: 'Taurus Guardian',
    title: '金牛守护 · 玫瑰晶丰盛手链',
    desc: '土象金牛的温柔护符，稳定心轮，也唤醒丰盛感。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    specs: ['金牛座', '玫瑰晶', '心轮', '土元素'],
    body: [
      '金牛座与身体、安全感和丰盛感深深相连。玫瑰晶让这份稳定多一点柔软和爱的流动。',
      '适合在关系修复、自我照顾和重建生活节奏时佩戴。',
    ],
  },
  {
    id: 'gemini-aquamarine',
    eyebrow: 'Gemini Guardian',
    title: '双子守护 · 海蓝宝表达项链',
    desc: '风象双子的表达护符，让灵感、语言与真实顺畅流动。',
    color: '#c3e3f4',
    image: CARD_IMAGES[0],
    specs: ['双子座', '海蓝宝', '喉轮', '风元素'],
    body: [
      '双子座天生连接信息、语言和好奇心。海蓝宝帮助表达变得更清澈，也让倾听更稳定。',
      '适合在写作、沟通、学习和内容输出前佩戴。',
    ],
  },
  {
    id: 'cancer-moonstone',
    eyebrow: 'Cancer Guardian',
    title: '巨蟹守护 · 月光石安抚手链',
    desc: '水象巨蟹的月光护符，安抚情绪，也守护内在柔软。',
    color: '#ece7fb',
    image: CARD_IMAGES[2],
    specs: ['巨蟹座', '月光石', '脐轮', '水元素'],
    body: [
      '巨蟹座与月亮、家庭和情绪潮汐相连。月光石像一层温柔的潮光，适合陪伴敏感的时刻。',
      '适合在情绪起伏、睡前冥想和需要被安抚时佩戴。',
    ],
  },
  {
    id: 'leo-citrine',
    eyebrow: 'Leo Guardian',
    title: '狮子守护 · 黄水晶光芒手链',
    desc: '火象狮子的自信护符，把创造力和舞台感带回身体。',
    color: '#f0e4c0',
    image: CARD_IMAGES[2],
    specs: ['狮子座', '黄水晶', '太阳轮', '火元素'],
    body: [
      '狮子座需要被看见，也需要相信自己的光。黄水晶对应太阳轮，适合加强自信、表达和创造力。',
      '适合在展示作品、登台、约会或需要主动争取机会时佩戴。',
    ],
  },
  {
    id: 'virgo-amazonite',
    eyebrow: 'Virgo Guardian',
    title: '处女守护 · 天河石平衡手链',
    desc: '土象处女的秩序护符，让理性、表达与身心节奏更平衡。',
    color: '#c3e3f4',
    image: CARD_IMAGES[0],
    specs: ['处女座', '天河石', '喉轮', '土元素'],
    body: [
      '处女座擅长整理细节，也容易对自己过度苛刻。天河石帮助思绪降噪，让表达更温和。',
      '适合在高压工作、整理计划和需要放松完美主义时佩戴。',
    ],
  },
  {
    id: 'libra-rose-quartz',
    eyebrow: 'Libra Guardian',
    title: '天秤守护 · 粉晶和谐手链',
    desc: '风象天秤的关系护符，让心轮在美、爱与边界之间保持平衡。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    specs: ['天秤座', '粉晶', '心轮', '风元素'],
    body: [
      '天秤座追求关系里的美感与平衡。粉晶让温柔不再等于讨好，也提醒你在爱里保留自己。',
      '适合在关系选择、社交场合和修复内在平衡时佩戴。',
    ],
  },
  {
    id: 'sagittarius-lapis',
    eyebrow: 'Sagittarius Guardian',
    title: '射手守护 · 青金石远见项链',
    desc: '火象射手的远行护符，打开视野、信念与高处的方向感。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    specs: ['射手座', '青金石', '眉心轮', '火元素'],
    body: [
      '射手座向往远方、知识和更大的世界。青金石帮助热情与洞察结合，让冒险不只是冲动。',
      '适合在旅行、学习、规划远期目标和寻找人生方向时佩戴。',
    ],
  },
  {
    id: 'capricorn-garnet',
    eyebrow: 'Capricorn Guardian',
    title: '摩羯守护 · 石榴石稳定手链',
    desc: '土象摩羯的扎根护符，守住长期主义、边界与内在稳定。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    specs: ['摩羯座', '石榴石', '海底轮', '土元素'],
    body: [
      '摩羯座擅长承担责任，也需要稳定的身体根基。石榴石对应海底轮，支持持久的行动力。',
      '适合在长期项目、事业推进和需要恢复安全感时佩戴。',
    ],
  },
  {
    id: 'aquarius-fluorite',
    eyebrow: 'Aquarius Guardian',
    title: '水瓶守护 · 萤石灵感手链',
    desc: '风象水瓶的灵感护符，让未来感、理性和直觉彼此接通。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    specs: ['水瓶座', '萤石', '眉心轮', '风元素'],
    body: [
      '水瓶座常常站在未来的边缘。萤石帮助灵感成形，也让跳跃的想法多一点清晰结构。',
      '适合在创意策划、技术学习和需要跳出旧框架时佩戴。',
    ],
  },
  {
    id: 'pisces-amethyst',
    eyebrow: 'Pisces Guardian',
    title: '双鱼守护 · 紫水晶梦境手链',
    desc: '水象双鱼的梦境护符，保护敏感，也连接直觉与灵性。',
    color: '#ece7fb',
    image: CARD_IMAGES[0],
    specs: ['双鱼座', '紫水晶', '顶轮', '水元素'],
    body: [
      '双鱼座与梦、共情和灵性想象相连。紫水晶帮助敏感不被淹没，让直觉更安静地发声。',
      '适合在睡前、冥想、创作和需要能量保护时佩戴。',
    ],
  },
]

const DETAILS: DetailData[] = [
  ...PRODUCTS.filter((product) => !REMOVED_ZODIAC_IDS.has(product.id)),
  ...ZODIAC_DETAILS.filter((detail) => !REMOVED_ZODIAC_IDS.has(detail.id)),
  {
    id: 'chakra',
    eyebrow: 'Collection',
    title: '脉轮疗愈系列',
    desc: '七个能量中心，在佩戴中缓慢校准。',
    color: '#dcedc2',
    image: CARD_IMAGES[1],
    specs: ['七脉轮', '心轮', '疗愈套装', '能量平衡'],
    body: [
      '脉轮疗愈系列覆盖海底轮到顶轮的完整能量路径。',
      '每件水晶都对应一个能量中心，帮助你更清楚地感受当下身体与情绪的需求。',
    ],
  },
  {
    id: 'lunar',
    eyebrow: 'Collection',
    title: '月相仪式系列',
    desc: '从新月到满月，让护符跟随月光呼吸。',
    color: '#c3e3f4',
    image: CARD_IMAGES[2],
    specs: ['新月', '满月', '月光净化', '仪式指南'],
    body: [
      '月相仪式系列把佩戴、净化、充能与周期节奏结合起来。',
      '它更像一套日常仪式系统，而不只是单件饰品。',
    ],
  },
  {
    id: 'chakra-test',
    eyebrow: 'Interactive Codex',
    title: '七脉轮自测入口',
    desc: '用三十秒感受你当前最需要平衡的能量中心。',
    color: '#f0e4c0',
    image: CARD_IMAGES[0],
    specs: ['颜色直觉', '能量需求', '脉轮频率', '产品推荐'],
    body: [
      '测试入口会从当下需求、颜色直觉和脉轮频率三个维度出发。',
      '最终结果会推荐你的守护脉轮和对应水晶。',
    ],
  },
  {
    id: 'sacral-moonstone',
    eyebrow: 'Sacral Chakra',
    title: '脐轮 · 月光石灵感手链',
    desc: '脐轮的流动频率，唤醒创造力、感受力与生命热情。',
    color: '#f2cfb4',
    image: CARD_IMAGES[2],
    specs: ['脐轮', '月光石', '水元素', '创造力'],
    body: [
      '脐轮掌管情绪流动、亲密关系与创造力。月光石的柔和光泽适合在灵感停滞、情绪堵塞时佩戴。',
      '把它作为每日小仪式的一部分，提醒自己允许感受流动，也允许新的灵感自然出现。',
    ],
  },
  {
    id: 'throat-aquamarine',
    eyebrow: 'Throat Chakra',
    title: '喉轮 · 海蓝宝表达项链',
    desc: '喉轮的清澈蓝光，帮助你说出真实、温柔而坚定的话。',
    color: '#c3e3f4',
    image: CARD_IMAGES[0],
    specs: ['喉轮', '海蓝宝', '以太元素', '表达'],
    body: [
      '喉轮连接表达、倾听与真实。海蓝宝像一层清澈的水光，适合在沟通、演讲、创作输出前佩戴。',
      '它不是让你变得更大声，而是帮助你更准确地说出真正想表达的东西。',
    ],
  },
  {
    id: 'third-eye-amethyst',
    eyebrow: 'Third Eye Chakra',
    title: '眉心轮 · 紫水晶洞察手链',
    desc: '眉心轮的直觉之石，让梦境、洞察与内在指引变得清晰。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    specs: ['眉心轮', '紫水晶', '光元素', '直觉'],
    body: [
      '眉心轮象征直觉、洞察和内在视觉。紫水晶适合在冥想、占星记录、梦境记录时佩戴。',
      '当你需要从复杂信息里辨认真正的方向，它会成为一枚安静的提醒。',
    ],
  },
  {
    id: 'crown-clear-quartz',
    eyebrow: 'Crown Chakra',
    title: '顶轮 · 白水晶连接手链',
    desc: '顶轮的高频白光，连接月光、意图与更高层次的自我。',
    color: '#ece7fb',
    image: CARD_IMAGES[1],
    specs: ['顶轮', '白水晶', '意识元素', '连接'],
    body: [
      '顶轮代表灵性连接、信任和更高意识。白水晶是适合承载意图的基础晶石，能与不同仪式组合使用。',
      '在新月写下愿望、满月净化水晶时，它都可以作为整套能量系统的中心。',
    ],
  },
  {
    id: 'full-moon-ritual',
    eyebrow: 'Ritual Guide',
    title: '满月净化仪式',
    desc: '八步唤醒晶石能量，让水晶重新回到明亮状态。',
    color: '#dcedc2',
    image: CARD_IMAGES[2],
    specs: ['满月', '净化', '充能', '肯定语'],
    body: [
      '满月适合释放、感谢与净化。把水晶置于月光下，配合短暂冥想即可完成一次轻仪式。',
      '重点不是复杂流程，而是清晰的意图和稳定重复。',
    ],
  },
]

const PRODUCT_TILES: Tile[] = PRODUCTS.filter((product) => !REMOVED_ZODIAC_IDS.has(product.id)).map(
  (product) => ({
    id: product.id,
    title: product.title.replace(' · ', '\n'),
    desc: product.desc,
    color: product.color,
    image: product.image,
    eyebrow: product.eyebrow,
    target: `/detail/${product.id}`,
  }),
)

const ZODIAC_TILES: Tile[] = [
  {
    id: 'aries-carnelian',
    title: '白羊守护\n红玉髓勇气手链',
    desc: '点燃勇气、热情与开创力。',
    color: '#f2cfb4',
    image: CARD_IMAGES[2],
    eyebrow: 'Aries',
    target: '/detail/aries-carnelian',
  },
  {
    id: 'taurus-rose-quartz',
    title: '金牛守护\n玫瑰晶丰盛手链',
    desc: '稳定心轮，也唤醒丰盛感。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    eyebrow: 'Taurus',
    target: '/detail/taurus-rose-quartz',
  },
  {
    id: 'gemini-aquamarine',
    title: '双子守护\n海蓝宝表达项链',
    desc: '让灵感、语言与真实顺畅流动。',
    color: '#c3e3f4',
    image: CARD_IMAGES[0],
    eyebrow: 'Gemini',
    target: '/detail/gemini-aquamarine',
  },
  {
    id: 'cancer-moonstone',
    title: '巨蟹守护\n月光石安抚手链',
    desc: '安抚情绪，也守护内在柔软。',
    color: '#ece7fb',
    image: CARD_IMAGES[2],
    eyebrow: 'Cancer',
    target: '/detail/cancer-moonstone',
  },
  {
    id: 'leo-citrine',
    title: '狮子守护\n黄水晶光芒手链',
    desc: '把创造力和舞台感带回身体。',
    color: '#f0e4c0',
    image: CARD_IMAGES[2],
    eyebrow: 'Leo',
    target: '/detail/leo-citrine',
  },
  {
    id: 'virgo-amazonite',
    title: '处女守护\n天河石平衡手链',
    desc: '让理性、表达与节奏更平衡。',
    color: '#c3e3f4',
    image: CARD_IMAGES[0],
    eyebrow: 'Virgo',
    target: '/detail/virgo-amazonite',
  },
  {
    id: 'libra-rose-quartz',
    title: '天秤守护\n粉晶和谐手链',
    desc: '在美、爱与边界之间保持平衡。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    eyebrow: 'Libra',
    target: '/detail/libra-rose-quartz',
  },
  {
    id: 'scorpio-amethyst',
    title: '天蝎守护\n紫水晶手链',
    desc: '眉心轮的直觉之石，守护深层转化。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    eyebrow: 'Scorpio',
    target: '/detail/scorpio-amethyst',
  },
  {
    id: 'sagittarius-lapis',
    title: '射手守护\n青金石远见项链',
    desc: '打开视野、信念与远方感。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    eyebrow: 'Sagittarius',
    target: '/detail/sagittarius-lapis',
  },
  {
    id: 'capricorn-garnet',
    title: '摩羯守护\n石榴石稳定手链',
    desc: '守住长期主义、边界与稳定。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    eyebrow: 'Capricorn',
    target: '/detail/capricorn-garnet',
  },
  {
    id: 'aquarius-fluorite',
    title: '水瓶守护\n萤石灵感手链',
    desc: '让未来感、理性与直觉接通。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    eyebrow: 'Aquarius',
    target: '/detail/aquarius-fluorite',
  },
  {
    id: 'pisces-amethyst',
    title: '双鱼守护\n紫水晶梦境手链',
    desc: '保护敏感，也连接直觉与灵性。',
    color: '#ece7fb',
    image: CARD_IMAGES[0],
    eyebrow: 'Pisces',
    target: '/detail/pisces-amethyst',
  },
]

const CHAKRA_TILES: Tile[] = [
  {
    id: 'root-garnet',
    title: '海底轮\n红石榴石扎根手链',
    desc: '海底轮扎根感，把安全感交还身体。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    eyebrow: 'Root Chakra',
    target: '/detail/root-garnet',
  },
  {
    id: 'sacral-moonstone',
    title: '脐轮\n月光石灵感手链',
    desc: '唤醒创造力、感受力与生命热情。',
    color: '#f2cfb4',
    image: CARD_IMAGES[2],
    eyebrow: 'Sacral Chakra',
    target: '/detail/sacral-moonstone',
  },
  {
    id: 'solar-citrine',
    title: '太阳轮\n黄水晶勇气手链',
    desc: '太阳轮金色频率，点亮行动与自信。',
    color: '#f0e4c0',
    image: CARD_IMAGES[2],
    eyebrow: 'Solar Plexus',
    target: '/detail/solar-citrine',
  },
  {
    id: 'heart-rose-quartz',
    title: '心轮疗愈\n玫瑰晶手链',
    desc: '心轮柔光，打开爱与自我接纳。',
    color: '#dcedc2',
    image: CARD_IMAGES[1],
    eyebrow: 'Heart Chakra',
    target: '/detail/heart-rose-quartz',
  },
  {
    id: 'throat-aquamarine',
    title: '喉轮\n海蓝宝表达项链',
    desc: '说出真实、温柔而坚定的话。',
    color: '#c3e3f4',
    image: CARD_IMAGES[0],
    eyebrow: 'Throat Chakra',
    target: '/detail/throat-aquamarine',
  },
  {
    id: 'third-eye-amethyst',
    title: '眉心轮\n紫水晶洞察手链',
    desc: '让梦境、洞察与内在指引变得清晰。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    eyebrow: 'Third Eye Chakra',
    target: '/detail/third-eye-amethyst',
  },
  {
    id: 'crown-clear-quartz',
    title: '顶轮\n白水晶连接手链',
    desc: '连接月光、意图与更高层次的自我。',
    color: '#ece7fb',
    image: CARD_IMAGES[1],
    eyebrow: 'Crown Chakra',
    target: '/detail/crown-clear-quartz',
  },
]

const MAIN_PROJECT_TILES: Tile[] = [
  {
    id: 'worlds',
    title: 'WORLDS\n水晶旅程',
    desc: '从脉轮、月相与水晶护符进入完整能量宇宙。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    eyebrow: 'Worlds',
    target: '/series/worlds',
  },
  {
    id: 'chakra',
    title: 'CHAKRAS\n脉轮疗愈',
    desc: '七个能量中心，从海底轮一路抵达顶轮。',
    color: '#dcedc2',
    image: CARD_IMAGES[1],
    eyebrow: 'Chakras',
    target: '/series/chakra',
  },
  {
    id: 'rituals',
    title: 'RITUALS\n月相仪式',
    desc: '新月设定意图，满月净化与充能。',
    color: '#c3e3f4',
    image: CARD_IMAGES[2],
    eyebrow: 'Rituals',
    target: '/series/rituals',
  },
  {
    id: 'crystals',
    title: 'CRYSTALS\n水晶护符',
    desc: '浏览所有水晶饰品与能量单页。',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    eyebrow: 'Crystals',
    target: '/series/crystals',
  },
  {
    id: 'codex',
    title: 'CODEX\n月之典籍',
    desc: '水晶、脉轮与月相知识入口。',
    color: '#f0e4c0',
    image: CARD_IMAGES[0],
    eyebrow: 'Codex',
    target: '/series/codex',
  },
  {
    id: 'connect',
    title: 'CONNECT\n开始连接',
    desc: '通过测试、指南与护符找到此刻频率。',
    color: '#ece7fb',
    image: CARD_IMAGES[2],
    eyebrow: 'Connect',
    target: '/series/connect',
  },
]

const SERIES: SeriesPageData[] = [
  {
    id: 'worlds',
    eyebrow: 'Worlds',
    title: '水晶旅程',
    desc: '从脉轮、月相与水晶护符入口进入，找到与你当前频率共振的护符。',
    color: '#f3cdd6',
    tiles: [
      {
        id: 'chakra',
        title: '脉轮疗愈',
        desc: '七个能量中心的完整路径',
        color: '#dcedc2',
        image: CARD_IMAGES[1],
        target: '/series/chakra',
      },
      {
        id: 'lunar',
        title: '月相仪式',
        desc: '新月、满月与日常净化',
        color: '#c3e3f4',
        image: CARD_IMAGES[2],
        target: '/series/lunar',
      },
    ],
  },
  {
    id: 'collections',
    eyebrow: 'Project Portals',
    title: '项目入口',
    desc: '从六个大入口进入：旅程、脉轮、仪式、水晶、典籍与连接。',
    color: '#f0e4c0',
    tiles: MAIN_PROJECT_TILES,
  },
  {
    id: 'rituals',
    eyebrow: 'Rituals',
    title: '月相仪式',
    desc: '在新月写下意图，在满月净化水晶，让佩戴成为一段可重复的能量节奏。',
    color: '#c3e3f4',
    tiles: [
      ...PRODUCT_TILES.filter((tile) =>
        ['new-moon-set', 'full-moon-necklace'].includes(tile.id),
      ),
      {
        id: 'full-moon-ritual',
        title: '满月净化\n仪式指南',
        desc: '八步唤醒晶石能量',
        color: '#dcedc2',
        image: CARD_IMAGES[2],
        target: '/detail/full-moon-ritual',
      },
    ],
  },
  {
    id: 'zodiac',
    eyebrow: 'Zodiac',
    title: '星座守护系列',
    desc: '从星盘特质出发，为直觉敏锐的人召唤专属守护水晶。',
    color: '#dcd2f2',
    tiles: ZODIAC_TILES,
  },
  {
    id: 'chakra',
    eyebrow: 'Chakras',
    title: '脉轮疗愈系列',
    desc: '七脉轮完整疗愈路径，每一件水晶都对应一个能量中心。',
    color: '#dcedc2',
    tiles: CHAKRA_TILES,
  },
  {
    id: 'lunar',
    eyebrow: 'Lunar',
    title: '月相仪式系列',
    desc: '从新月到满月，每件水晶都由特定月相时刻加持。',
    color: '#c3e3f4',
    tiles: PRODUCT_TILES.filter((tile) =>
      ['new-moon-set', 'full-moon-necklace'].includes(tile.id),
    ),
  },
  {
    id: 'crystals',
    eyebrow: 'Crystals',
    title: '全部水晶护符',
    desc: '浏览所有水晶产品，进入每件护符自己的能量单页。',
    color: '#f3cdd6',
    tiles: PRODUCT_TILES,
  },
  {
    id: 'codex',
    eyebrow: 'Codex',
    title: '月之典籍',
    desc: '水晶、脉轮与月相仪式的知识入口。',
    color: '#f0e4c0',
    tiles: [
      {
        id: 'chakra-test',
        title: '七脉轮\n自测',
        desc: '感受哪个能量中心需要平衡',
        color: '#dcedc2',
        image: CARD_IMAGES[1],
        target: '/detail/chakra-test',
      },
      {
        id: 'full-moon-ritual',
        title: '满月净化\n仪式',
        desc: '八步唤醒晶石能量',
        color: '#c3e3f4',
        image: CARD_IMAGES[2],
        target: '/detail/full-moon-ritual',
      },
    ],
  },
  {
    id: 'connect',
    eyebrow: 'Connect',
    title: '开始连接',
    desc: '从测试、典籍与水晶入口开始，找到此刻最适合你的护符路径。',
    color: '#ece7fb',
    tiles: [
      {
        id: 'chakra-test',
        title: '七脉轮\n自测',
        desc: '感受哪个能量中心需要平衡',
        color: '#dcedc2',
        image: CARD_IMAGES[1],
        target: '/detail/chakra-test',
      },
      {
        id: 'codex',
        title: '月之典籍\n知识入口',
        desc: '阅读水晶、星座与月相指南',
        color: '#f0e4c0',
        image: CARD_IMAGES[0],
        target: '/series/codex',
      },
      {
        id: 'crystals',
        title: '水晶护符\n全部入口',
        desc: '直接浏览所有水晶饰品',
        color: '#f3cdd6',
        image: CARD_IMAGES[2],
        target: '/series/crystals',
      },
    ],
  },
]

const ARC_CARDS: Tile[] = MAIN_PROJECT_TILES

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function readAdminProducts() {
  try {
    const raw = window.localStorage.getItem(ADMIN_PRODUCT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredAdminProduct[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((product) => product.status === '上架')
  } catch {
    return []
  }
}

function getPublishedAdminProducts() {
  return readAdminProducts().filter((product) => !ADMIN_SEED_PRODUCT_IDS.has(product.id))
}

function readCartLines() {
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && item.id && item.name && Number(item.quantity) > 0)
      .map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      }))
  } catch {
    return []
  }
}

function saveCartLines(items: CartLine[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items))
}

function detailToCartLine(detail: DetailData): CartLine {
  return {
    id: detail.id,
    name: detail.title.replace(/\n/g, ' '),
    price: getDetailPrice(detail),
    quantity: 1,
    image: detail.image,
    color: detail.color,
    eyebrow: detail.eyebrow,
  }
}

function adminProductToTile(product: StoredAdminProduct): Tile {
  return {
    id: `admin-${product.id}`,
    title: product.name.replace(' · ', '\n'),
    desc: `${product.collection} · 库存 ${product.stock} · ${formatProductPrice(product.price)}`,
    color: '#ece7fb',
    image: product.image,
    eyebrow: 'Admin Product',
    target: `/detail/admin-${product.id}`,
  }
}

function adminProductToDetail(product: StoredAdminProduct): DetailData {
  return {
    id: `admin-${product.id}`,
    eyebrow: product.collection,
    title: product.name,
    desc: `后台上架商品 · 库存 ${product.stock} · ${formatProductPrice(product.price)}`,
    color: '#ece7fb',
    image: product.image,
    specs: [product.collection, `库存 ${product.stock}`, formatProductPrice(product.price), '后台上架'],
    body: [
      '这件护符由管理后台上传并发布到前台展示。',
      '当前版本会先用浏览器本地数据打通发布链路；接入真实后端后，可替换为数据库商品信息、库存和订单系统。',
    ],
  }
}

function formatProductPrice(value: number) {
  return `$${value.toLocaleString('en-US')}`
}

function getDetailPrice(detail: DetailData) {
  const priceSpec = detail.specs.find((spec) => spec.startsWith('$'))
  if (priceSpec) {
    const parsed = Number(priceSpec.replace(/[^0-9.]/g, ''))
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  const priceMap: Record<string, number> = {
    'scorpio-amethyst': 89,
    'heart-rose-quartz': 69,
    'solar-citrine': 79,
    'new-moon-set': 129,
    'root-garnet': 75,
    'full-moon-necklace': 149,
  }

  return priceMap[detail.id] ?? 89
}

function getTileDetail(tile: Tile) {
  if (!tile.target.startsWith('/detail/')) return null
  const detailId = tile.target.slice('/detail/'.length)
  return (
    getPublishedAdminProducts()
      .map(adminProductToDetail)
      .find((detail) => detail.id === detailId) ??
    DETAILS.find((detail) => detail.id === detailId) ??
    null
  )
}

function getTileAction(tile: Tile) {
  return tile.target.startsWith('/detail/') ? '查看详情' : '进入系列'
}

function getTileSpecs(tile: Tile) {
  const detail = getTileDetail(tile)
  if (!detail) return []
  return detail.specs.slice(0, 3)
}

function getSeriesIdForDetail(detailId: string) {
  if (CHAKRA_TILES.some((tile) => tile.id === detailId)) return 'chakra'
  if (
    ['new-moon-set', 'full-moon-necklace', 'full-moon-ritual'].includes(detailId)
  ) {
    return 'lunar'
  }
  if (PRODUCT_TILES.some((tile) => tile.id === detailId)) return 'crystals'
  return 'crystals'
}

function getSeriesListTitle(id: string) {
  if (id === 'crystals') return '全部护符'
  if (id === 'chakra') return '七脉轮护符'
  if (id === 'lunar' || id === 'rituals') return '月相仪式商品'
  if (id === 'codex') return '知识与测试入口'
  if (id === 'connect') return '连接入口'
  if (id === 'worlds') return '探索路径'
  return '系列项目'
}

function SeriesFeaturePanel({
  series,
  tiles,
  navigate,
}: {
  series: SeriesPageData
  tiles: Tile[]
  navigate: NavigateFn
}) {
  const featured = tiles[0]
  const featuredDetail = featured ? getTileDetail(featured) : null

  return (
    <section
      style={{
        marginTop: 34,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 0.95fr) minmax(320px, 1.05fr)',
        gap: 24,
        alignItems: 'stretch',
      }}
      className="max-[900px]:!grid-cols-1"
    >
      <button
        type="button"
        onClick={() => featured && navigate(featured.target)}
        style={{
          minHeight: 520,
          border: '1px solid rgba(255,255,255,0.26)',
          borderRadius: 36,
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: featured?.color ?? series.color,
          backgroundImage: featured?.image ? `url(${featured.image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 30px 90px rgba(38,20,55,0.28)',
          cursor: featured ? 'pointer' : 'default',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(16,8,18,0.42))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            bottom: 24,
            color: '#fff',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              opacity: 0.78,
            }}
          >
            Featured
          </p>
          <h2
            style={{
              margin: '10px 0 0',
              fontFamily: "'Viaoda Libre', serif",
              fontSize: 'clamp(42px, 6vw, 76px)',
              lineHeight: 0.9,
              whiteSpace: 'pre-line',
              textShadow: '0 2px 24px rgba(0,0,0,0.35)',
            }}
          >
            {featured?.title ?? series.title}
          </h2>
          <div
            style={{
              marginTop: 18,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid rgba(255,255,255,0.32)',
              borderRadius: 999,
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(14px)',
              fontSize: 13,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {featuredDetail ? formatProductPrice(getDetailPrice(featuredDetail)) : 'Enter'}
            <span>→</span>
          </div>
        </div>
      </button>

      <div
        style={{
          borderRadius: 36,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.84), rgba(236,231,251,0.72))',
          border: '1px solid rgba(255,255,255,0.34)',
          boxShadow: '0 30px 90px rgba(38,20,55,0.2)',
          padding: 'clamp(28px, 4vw, 46px)',
          color: '#3a2530',
          backdropFilter: 'blur(18px)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'rgba(58,37,48,0.5)',
          }}
        >
          {series.eyebrow} Collection
        </p>
        <h1
          style={{
            margin: '16px 0 0',
            fontFamily: "'Viaoda Libre', serif",
            fontSize: 'clamp(52px, 7vw, 92px)',
            lineHeight: 0.9,
            whiteSpace: 'pre-line',
          }}
        >
          {series.title}
        </h1>
        <p
          style={{
            margin: '22px 0 0',
            maxWidth: 560,
            fontSize: 18,
            lineHeight: 1.72,
            color: 'rgba(58,37,48,0.66)',
          }}
        >
          {series.desc}
        </p>
        <div
          style={{
            marginTop: 28,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
          }}
          className="max-[560px]:!grid-cols-1"
        >
          {[
            ['ITEMS', `${tiles.length}`],
            ['STYLE', featuredDetail ? 'Product' : 'Portal'],
            ['MOOD', 'Crystal'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                borderRadius: 20,
                border: '1px solid rgba(58,37,48,0.1)',
                background: 'rgba(255,255,255,0.48)',
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(58,37,48,0.44)',
                }}
              >
                {label}
              </div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900 }}>{value}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 30,
            borderTop: '1px solid rgba(58,37,48,0.12)',
            paddingTop: 20,
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {tiles.slice(0, 4).map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => navigate(tile.target)}
              style={{
                border: '1px solid rgba(58,37,48,0.14)',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.44)',
                color: 'rgba(58,37,48,0.66)',
                padding: '9px 12px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {tile.title.replace(/\n/g, ' · ')}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function SeriesListingGrid({
  title,
  subtitle,
  tiles,
  navigate,
}: {
  title: string
  subtitle: string
  tiles: Tile[]
  navigate: NavigateFn
}) {
  return (
    <section style={{ marginTop: 44 }}>
      <div style={{ marginBottom: 18 }}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.52)',
          }}
        >
          {subtitle}
        </p>
        <h2
          style={{
            margin: '10px 0 0',
            fontFamily: "'Viaoda Libre', serif",
            fontSize: 'clamp(34px, 4.2vw, 60px)',
            lineHeight: 1,
            color: '#fff',
          }}
        >
          {title}
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 18,
        }}
      >
        {tiles.map((tile) => {
          const detail = getTileDetail(tile)
          const action = getTileAction(tile)
          const specs = getTileSpecs(tile)

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => navigate(tile.target)}
              style={{
                border: '1px solid rgba(255,255,255,0.28)',
                borderRadius: 28,
                overflow: 'hidden',
                padding: 0,
                textAlign: 'left',
                background: 'rgba(255,255,255,0.56)',
                color: '#3a2530',
                boxShadow: '0 22px 70px rgba(60,33,80,0.12)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                cursor: 'pointer',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 5',
                  backgroundColor: tile.color,
                  backgroundImage: tile.image ? `url(${tile.image})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(20,12,18,0.18) 100%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    padding: '7px 11px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.28)',
                    border: '1px solid rgba(255,255,255,0.32)',
                    color: '#fff',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {tile.eyebrow}
                </span>
                {detail ? (
                  <span
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: 14,
                      padding: '7px 11px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.88)',
                      color: '#3a2530',
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {formatProductPrice(getDetailPrice(detail))}
                  </span>
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    left: 14,
                    right: 14,
                    bottom: 14,
                    padding: 14,
                    borderRadius: 22,
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    color: '#fff',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "'Viaoda Libre', serif",
                      fontSize: 28,
                      lineHeight: 0.96,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {tile.title}
                  </h3>
                </div>
              </div>

              <div style={{ padding: 18 }}>
                <p
                  style={{
                    margin: 0,
                    color: 'rgba(58,37,48,0.64)',
                    lineHeight: 1.65,
                    fontSize: 15,
                  }}
                >
                  {tile.desc}
                </p>

                {specs.length ? (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginTop: 14,
                    }}
                  >
                    {specs.map((spec) => (
                      <span
                        key={spec}
                        style={{
                          border: '1px solid rgba(58,37,48,0.12)',
                          borderRadius: 999,
                          padding: '7px 11px',
                          fontSize: 12,
                          color: 'rgba(58,37,48,0.72)',
                        }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    borderTop: '1px solid rgba(58,37,48,0.1)',
                    paddingTop: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'rgba(58,37,48,0.52)',
                    }}
                  >
                    {action}
                  </span>
                  <span style={{ fontWeight: 900, color: '#3a2530' }}>→</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function routeFromPath(): Route {
  const [page, id] = window.location.pathname.split('/').filter(Boolean)

  if (page === 'series' && id) return { page: 'series', id }
  if (page === 'detail' && id) return { page: 'detail', id }
  if (page === 'cart') return { page: 'cart' }
  if (page === 'admin') return { page: 'admin' }
  if (
    page === 'privacy' ||
    page === 'terms' ||
    page === 'shipping' ||
    page === 'refund' ||
    page === 'contact'
  ) {
    return { page: 'legal', id: page }
  }

  return { page: 'home' }
}

function useRoute() {
  const [route, setRoute] = useState<Route>(() => routeFromPath())

  useEffect(() => {
    const onPop = () => setRoute(routeFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    trackPageView(window.location.pathname)
  }, [route])

  const navigate = (path: string) => {
    window.history.pushState(null, '', path)
    setRoute(routeFromPath())
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return { route, navigate }
}

function useViewportMode() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isDesktop: true }
    }

    return {
      isMobile: window.matchMedia('(max-width: 767px)').matches,
      isDesktop: window.matchMedia('(min-width: 1100px)').matches,
    }
  })

  useEffect(() => {
    const mobileMedia = window.matchMedia('(max-width: 767px)')
    const desktopMedia = window.matchMedia('(min-width: 1100px)')
    const onChange = () =>
      setMode({
        isMobile: mobileMedia.matches,
        isDesktop: desktopMedia.matches,
      })

    onChange()
    mobileMedia.addEventListener('change', onChange)
    desktopMedia.addEventListener('change', onChange)

    return () => {
      mobileMedia.removeEventListener('change', onChange)
      desktopMedia.removeEventListener('change', onChange)
    }
  }, [])

  return mode
}

function useMouseParallax() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const rawMouseRef = useRef({ x: 0, y: 0 })
  const smoothMouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let raf = 0

    const onMouseMove = (event: MouseEvent) => {
      rawMouseRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      }
    }

    const update = () => {
      smoothMouseRef.current.x = lerp(
        smoothMouseRef.current.x,
        rawMouseRef.current.x,
        0.07,
      )
      smoothMouseRef.current.y = lerp(
        smoothMouseRef.current.y,
        rawMouseRef.current.y,
        0.07,
      )
      setMouse({ ...smoothMouseRef.current })
      raf = requestAnimationFrame(update)
    }

    window.addEventListener('mousemove', onMouseMove)
    raf = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return mouse
}

function StarLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <path
        d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="14" cy="24" r="1.5" fill="white" opacity="0.6" />
      <circle cx="6" cy="6" r="1" fill="white" opacity="0.4" />
      <circle cx="22" cy="6" r="1" fill="white" opacity="0.4" />
    </svg>
  )
}

function ScrollChevron() {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        border: '1.5px solid rgba(255,255,255,0.5)',
        display: 'grid',
        placeItems: 'center',
        animation: 'bobUp 1.8s ease-in-out infinite',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path
          d="M3 5l4 4 4-4"
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function PortalImage({
  src,
  alt,
  style,
}: {
  src: string
  alt: string
  style?: CSSProperties
}) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

function Navigation({
  navigate,
  cartCount = 0,
  onOpenCart,
}: {
  navigate: NavigateFn
  cartCount?: number
  onOpenCart?: () => void
}) {
  const navStyle: CSSProperties = {
    fontFamily: "'Imprima', sans-serif",
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#fff',
    opacity: 0.9,
    textDecoration: 'none',
    background: 'transparent',
    border: 0,
    padding: 0,
  }

  const navButton = (label: string, path: string) => (
    <button key={label} type="button" onClick={() => navigate(path)} style={navStyle}>
      {label}
    </button>
  )
  const cartButton = (
    <button
      type="button"
      onClick={() => (onOpenCart ? onOpenCart() : navigate('/cart'))}
      aria-label={`购物车，共 ${cartCount} 件商品`}
      style={{
        ...navStyle,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 999,
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>◐</span>
      <span className="hidden lg:inline">Cart</span>
      {cartCount > 0 ? (
        <span
          style={{
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            display: 'grid',
            placeItems: 'center',
            background: '#f0e4c0',
            color: '#3a2530',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 0,
          }}
        >
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      ) : null}
    </button>
  )

  return (
    <nav
      style={{
        position: 'absolute',
        inset: '0 0 auto',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'auto',
      }}
      className="px-5 py-[18px] md:px-12 md:py-[22px]"
    >
      <div className="flex w-full items-center justify-between md:hidden">
        {navButton('Explore', '/series/worlds')}
        <button type="button" onClick={() => navigate('/')} style={navStyle}>
          <StarLogo />
        </button>
        {cartButton}
      </div>

      <div className="hidden w-full items-center justify-between md:flex">
        <div style={{ display: 'flex', gap: 36 }}>
          {navButton('Worlds', '/series/worlds')}
          {navButton('Chakras', '/series/chakra')}
          {navButton('Rituals', '/series/rituals')}
        </div>
        <button type="button" onClick={() => navigate('/')} style={navStyle}>
          <StarLogo />
        </button>
        <div style={{ display: 'flex', gap: 36 }}>
          {navButton('Crystals', '/series/crystals')}
          {navButton('Codex', '/series/codex')}
          {navButton('Connect', '/series/connect')}
          {cartButton}
        </div>
      </div>
    </nav>
  )
}

function HeroHeading({
  tablet,
  desktop,
}: {
  tablet?: boolean
  desktop?: boolean
}) {
  const isLightText = desktop

  return (
    <h1
      style={{
        margin: 0,
        fontFamily: "'Viaoda Libre', serif",
        color: isLightText ? '#fff' : '#3b1a0a',
        textShadow: isLightText
          ? '0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)'
          : 'none',
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: desktop
            ? 'clamp(32px, 4.5vw, 54px)'
            : tablet
              ? 'clamp(28px, 5vw, 44px)'
              : 'clamp(26px, 7vw, 42px)',
          lineHeight: desktop ? 1.1 : 1.04,
          letterSpacing: desktop ? '0.04em' : '0.12em',
        }}
      >
        LUNAR{' '}
        <span
          style={{
            color: desktop ? 'rgba(255,220,180,0.7)' : '#6b2e0e',
            fontSize: '0.8em',
          }}
        >
          &gt;
        </span>{' '}
        <em style={{ fontStyle: 'italic' }}>TALISMAN</em>
      </span>
      <span
        style={{
          display: 'block',
          fontSize: desktop
            ? 'clamp(50px, 7.5vw, 88px)'
            : tablet
              ? 'clamp(60px, 12vw, 86px)'
              : 'clamp(52px, 16vw, 80px)',
          lineHeight: desktop ? 0.9 : 0.92,
          letterSpacing: desktop ? '-0.02em' : '-0.035em',
        }}
      >
        月之护符
      </span>
    </h1>
  )
}

function HeroCopy({
  mobile,
  tablet,
  desktop,
}: {
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
}) {
  return (
    <p
      style={{
        margin: desktop ? '22px 0 0' : 0,
        maxWidth: desktop ? 300 : tablet ? 400 : mobile ? 280 : 320,
        fontFamily: "'Imprima', sans-serif",
        fontSize: desktop ? 18 : tablet ? 16 : 15,
        lineHeight: desktop ? 1.7 : 1.65,
        color: desktop ? 'rgba(255,245,235,0.88)' : '#5c2d0e',
        textShadow: desktop ? '0 1px 12px rgba(0,0,0,0.8)' : 'none',
      }}
    >
      以月光为引，将七脉轮能量注入每一颗水晶。选择你的护符，开启内在的能量之旅。
    </p>
  )
}

function SceneOneUI({
  opacity,
  uiVisible,
  isMobile,
  isDesktop,
  onDescend,
  onProgressJump,
}: {
  opacity: number
  uiVisible: boolean
  isMobile: boolean
  isDesktop: boolean
  onDescend: () => void
  onProgressJump: (progress: number) => void
}) {
  const commonFade: CSSProperties = {
    opacity: uiVisible ? opacity : 0,
    transform: uiVisible ? 'translateY(0)' : 'translateY(18px)',
    transition: 'opacity 0.9s ease, transform 0.9s ease',
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        pointerEvents: opacity > 0.05 ? 'auto' : 'none',
      }}
    >
      {isMobile ? (
        <div
          style={{
            ...commonFade,
            transitionDelay: '0.3s',
            minHeight: '100vh',
            padding: '80px 24px 100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            textAlign: 'center',
          }}
        >
          <HeroHeading />
          <HeroCopy mobile />
        </div>
      ) : !isDesktop ? (
        <div
          style={{
            ...commonFade,
            transitionDelay: '0.3s',
            minHeight: '100vh',
            width: '100%',
            padding: '80px 32px 96px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            textAlign: 'center',
          }}
        >
          <HeroHeading tablet />
          <HeroCopy tablet />
        </div>
      ) : (
        <>
          <div
            style={{
              ...commonFade,
              transitionDelay: '0.3s',
              position: 'absolute',
              top: '46%',
              left: 60,
              maxWidth: 440,
              transform: uiVisible
                ? 'translateY(-50%)'
                : 'translateY(calc(-50% + 18px))',
            }}
          >
            <HeroHeading desktop />
            <HeroCopy desktop />
          </div>
        </>
      )}

      <div
        style={{
          opacity: uiVisible ? opacity : 0,
          transform: uiVisible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.9s ease 0.8s, transform 0.9s ease 0.8s',
          position: 'absolute',
          bottom: 'clamp(28px, 5vw, 40px)',
          left: isDesktop ? 60 : '50%',
          translate: isDesktop ? '0 0' : '-50% 0',
          display: 'flex',
          gap: 8,
        }}
      >
        {[0, 1, 2, 3].map((dot) => (
          <button
            key={dot}
            type="button"
            aria-label={`跳转到第 ${dot + 1} 段体验`}
            onClick={() => onProgressJump([0, 0.34, 0.72, 0.88][dot])}
            style={{
              appearance: 'none',
              padding: 0,
              border: 0,
              cursor: 'pointer',
              width: dot === 0 ? 28 : 14,
              height: 4,
              borderRadius: 2,
              background:
                dot === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>

      {isDesktop ? (
        <button
          type="button"
          aria-label="向下滚动进入七脉轮水晶宇宙"
          onClick={onDescend}
          style={{
            appearance: 'none',
            padding: 0,
            border: 0,
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            opacity: uiVisible ? opacity : 0,
            transform: uiVisible ? 'translateX(-50%)' : 'translate(-50%, 14px)',
            transition: 'opacity 0.9s ease 0.9s, transform 0.9s ease 0.9s',
            position: 'absolute',
            bottom: 36,
            left: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Descend
          </span>
          <ScrollChevron />
        </button>
      ) : null}
    </div>
  )
}

function SceneTwoUI({ opacity }: { opacity: number }) {
  return (
    <section
      id="collections"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 46,
        opacity,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '8vh 24px 0',
      }}
      className="md:pt-[12vh]"
    >
      <h2
        style={{
          margin: 0,
          fontFamily: "'Viaoda Libre', serif",
          fontSize: 'clamp(28px, 8vw, 78px)',
          color: '#fff',
          letterSpacing: '0.03em',
          lineHeight: 1.05,
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
        }}
      >
        七脉轮水晶宇宙
      </h2>
      <p
        style={{
          margin: '16px 0 0',
          maxWidth: 480,
          fontFamily: "'Imprima', sans-serif",
          fontSize: 'clamp(14px, 2.1vw, 20px)',
          lineHeight: 1.6,
          letterSpacing: '-0.01em',
          color: 'rgba(255,255,255,0.82)',
        }}
      >
        脉轮疗愈、月相仪式与水晶护符交织成一条旅程；每一件水晶都对应你此刻最需要的频率。
      </p>
    </section>
  )
}

function ArcCardSlider({
  cards,
  rotationOffset,
  isMobile,
  opacity,
  navigate,
  animated = false,
  compact = false,
  focusIndex,
}: {
  cards: Tile[]
  rotationOffset: number
  isMobile: boolean
  opacity: number
  navigate: NavigateFn
  animated?: boolean
  compact?: boolean
  focusIndex?: number
}) {
  const cardSpacingDeg = isMobile ? (compact ? 10 : 12) : 9
  const arcRadius = isMobile ? (compact ? 360 : 700) : 1100
  const cardW = isMobile ? (compact ? 140 : 160) : 220
  const cardH = isMobile ? (compact ? 160 : 175) : 230
  const sliderH = isMobile ? (compact ? 300 : 260) : 360
  const lift = isMobile ? (compact ? 120 : 140) : 200
  // Keep the scene's fade-in timing, but let the active card become solid
  // as soon as the carousel is meaningfully visible. Otherwise the parent
  // opacity would make even the focused option look washed out.
  const revealOpacity = clamp(opacity * 2.7)
  const rawCarouselFocus =
    focusIndex ??
    (cards.length > 0 ? Math.round(rotationOffset / cardSpacingDeg) : 0)
  const carouselFocus =
    cards.length > 0
      ? ((rawCarouselFocus % cards.length) + cards.length) % cards.length
      : 0
  const carouselRemainder =
    focusIndex === undefined
      ? rotationOffset - rawCarouselFocus * cardSpacingDeg
      : 0

  const getCardDeg = (index: number) => {
    let carouselOffset = index - carouselFocus
    if (cards.length > 0) {
      const half = cards.length / 2
      if (carouselOffset > half) carouselOffset -= cards.length
      if (carouselOffset < -half) carouselOffset += cards.length
    }

    return carouselOffset * cardSpacingDeg - carouselRemainder
  }

  // The current item in the circular queue is the only fully opaque one.
  // This keeps the carousel's existing arc and spacing intact while making the
  // current destination visually unambiguous.
  const focalIndex = cards.length > 0 ? carouselFocus : -1

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 47,
        left: '50%',
        bottom: isMobile ? 60 : 80,
        translate: '-50% 0',
        width: '100vw',
        height: sliderH,
        opacity: 1,
        pointerEvents: opacity > 0.12 ? 'auto' : 'none',
      }}
    >
      {cards.map((card, index) => {
        const deg = getCardDeg(index)
        const isFocal = index === focalIndex
        const rad = (deg * Math.PI) / 180
        const x = Math.sin(rad) * arcRadius
        const y = arcRadius - Math.cos(rad) * arcRadius

        return (
          <button
            type="button"
            key={`${card.title}-${index}`}
            onClick={() => navigate(card.target)}
            style={{
              position: 'absolute',
              left: `calc(50% + ${x}px - ${cardW / 2}px)`,
              bottom: -y + lift,
              width: cardW,
              height: cardH,
              borderRadius: isMobile ? 18 : 26,
              background: card.color,
              opacity: revealOpacity * (isFocal ? 1 : 0.42),
              border: 0,
              boxShadow: '0 8px 40px rgba(80,40,60,0.18)',
              transform: `rotate(${deg}deg)`,
              transformOrigin: `${cardW / 2}px ${arcRadius}px`,
              transition: animated
                ? 'left 0.7s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease'
                : 'opacity 0.45s ease',
              willChange: animated ? 'left, bottom, transform, opacity' : 'opacity',
              padding: isMobile ? 16 : 22,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                alignSelf: 'flex-end',
                width: 24,
                height: 24,
                borderRadius: 999,
                border: '1.5px solid rgba(80,50,60,0.3)',
                color: 'rgba(80,50,60,0.6)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 10,
                fontFamily: "'Imprima', sans-serif",
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3
                style={{
                  margin: 0,
                  whiteSpace: 'pre-line',
                  fontFamily: "'Viaoda Libre', serif",
                  fontSize: isMobile ? 22 : 30,
                  lineHeight: 1,
                  color: '#3a2530',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  margin: '10px 0 0',
                  fontFamily: "'Imprima', sans-serif",
                  fontSize: isMobile ? 12 : 15,
                  lineHeight: 1.35,
                  color: 'rgba(58,37,48,0.65)',
                }}
              >
                {card.desc}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function AtmosphericShell({
  navigate,
  children,
  cartCount = 0,
  onOpenCart,
}: {
  navigate: NavigateFn
  children: ReactNode
  cartCount?: number
  onOpenCart?: () => void
}) {
  const mouse = useMouseParallax()
  const mx = mouse.x
  const my = mouse.y

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#0a0608',
        color: '#fff',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          transform: `translate3d(${-mx * 8}px, ${-my * 8}px, 0) scale(1.08)`,
          transformOrigin: '50% 50%',
          pointerEvents: 'none',
        }}
      >
        <PortalImage src={WORLD_BG} alt="" />
      </div>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.08), transparent 28%), linear-gradient(180deg, rgba(10,6,8,0.1), rgba(10,6,8,0.84))',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
          transform: `translate3d(${-mx * 10}px, ${-my * 4}px, 0) scale(1.08)`,
          pointerEvents: 'none',
        }}
      >
        <img
          src={BOTTOM_CLOUDS}
          alt=""
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </div>
      <Navigation navigate={navigate} cartCount={cartCount} onOpenCart={onOpenCart} />
      <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>
    </main>
  )
}

function SeriesPage({
  id,
  navigate,
  cartCount,
  onOpenCart,
}: {
  id: string
  navigate: NavigateFn
  cartCount: number
  onOpenCart?: () => void
}) {
  const series = SERIES.find((item) => item.id === id && item.id !== 'zodiac') ?? SERIES[0]
  const adminProducts = getPublishedAdminProducts()
  const adminTiles = adminProducts
    .filter((product) => product.collection !== '星座守护')
    .map(adminProductToTile)
  const collectionMap: Record<string, string> = {
    chakra: '脉轮疗愈',
    lunar: '月相仪式',
    crystals: '水晶护符',
  }
  const linkedAdminTiles =
    id === 'crystals'
      ? adminTiles
      : adminProducts
          .filter((product) => product.collection === collectionMap[id])
          .map(adminProductToTile)
  const displaySeries =
    linkedAdminTiles.length > 0
      ? {
          ...series,
          tiles: [...linkedAdminTiles, ...series.tiles].filter(
            (tile) => !REMOVED_ZODIAC_IDS.has(tile.id),
          ),
        }
      : { ...series, tiles: series.tiles.filter((tile) => !REMOVED_ZODIAC_IDS.has(tile.id)) }
  usePageMeta({
    title: `${displaySeries.title.replace(/\n/g, ' ')} | Lunar Talisman`,
    description: displaySeries.desc,
  })

  return (
    <AtmosphericShell navigate={navigate} cartCount={cartCount} onOpenCart={onOpenCart}>
      <section
        style={{
          width: 'min(1180px, calc(100% - 40px))',
          margin: '0 auto',
          padding: '128px 0 96px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.78)',
            padding: '10px 16px',
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          ← Back to portal
        </button>

        <SeriesFeaturePanel
          series={displaySeries}
          tiles={displaySeries.tiles}
          navigate={navigate}
        />
        <SeriesListingGrid
          title={getSeriesListTitle(id)}
          subtitle={`${displaySeries.eyebrow} · Collection`}
          tiles={displaySeries.tiles}
          navigate={navigate}
        />
      </section>
    </AtmosphericShell>
  )
}

function DetailPage({
  id,
  navigate,
  addToCart,
  cartCount,
  onOpenCart,
}: {
  id: string
  navigate: NavigateFn
  addToCart: (item: CartLine) => void
  cartCount: number
  onOpenCart?: () => void
}) {
  const [cartNotice, setCartNotice] = useState('')
  const adminDetail = getPublishedAdminProducts()
    .filter((product) => product.collection !== '星座守护')
    .map(adminProductToDetail)
    .find((item) => item.id === id)
  const detail =
    adminDetail ??
    DETAILS.find((item) => item.id === id && !REMOVED_ZODIAC_IDS.has(item.id)) ??
    DETAILS.find((item) => item.id === 'chakra-test')!
  usePageMeta({
    title: `${detail.title.replace(/\n/g, ' ')} | Lunar Talisman`,
    description: detail.desc,
  })
  const detailPrice = getDetailPrice(detail)
  const detailSeriesId = getSeriesIdForDetail(detail.id)
  const relatedTiles = (
    SERIES.find((item) => item.id === detailSeriesId)?.tiles ?? PRODUCT_TILES
  )
    .filter((tile) => tile.id !== detail.id && !REMOVED_ZODIAC_IDS.has(tile.id))
    .slice(0, 4)
  const handleAddToCart = () => {
    addToCart(detailToCartLine(detail))
    setCartNotice('已加入购物车。可以继续浏览，也可以前往结账填写物流和留言。')
  }

  return (
    <AtmosphericShell navigate={navigate} cartCount={cartCount} onOpenCart={onOpenCart}>
      <article
        style={{
          width: 'min(1120px, calc(100% - 40px))',
          margin: '0 auto',
          padding: '128px 0 96px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.9fr) minmax(320px, 1.1fr)',
          gap: 34,
          alignItems: 'stretch',
        }}
        className="max-[900px]:!grid-cols-1"
      >
        <div
          style={{
            minHeight: 520,
            borderRadius: 38,
            border: '1px solid rgba(255,255,255,0.18)',
            backgroundImage: detail.image ? `url(${detail.image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.34)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(10,6,8,0.76), rgba(10,6,8,0.08))',
            }}
          />
          <button
            type="button"
            onClick={() => navigate('/series/crystals')}
            style={{
              position: 'absolute',
              left: 24,
              bottom: 24,
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              padding: '12px 18px',
              fontSize: 13,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Browse crystals
          </button>
        </div>

        <div
          style={{
            borderRadius: 38,
            background: detail.color,
            padding: 'clamp(28px, 4vw, 48px)',
            color: '#3a2530',
            boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          }}
        >
          <button
            type="button"
            onClick={() => navigate(`/series/${detailSeriesId}`)}
            style={{
              border: '1px solid rgba(58,37,48,0.22)',
              borderRadius: 999,
              background: 'transparent',
              color: 'rgba(58,37,48,0.68)',
              padding: '8px 14px',
              fontSize: 12,
            }}
          >
            ← 返回系列
          </button>
          <p
            style={{
              margin: '28px 0 0',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(58,37,48,0.56)',
            }}
          >
            {detail.eyebrow}
          </p>
          <h1
            style={{
              margin: '12px 0 0',
              fontFamily: "'Viaoda Libre', serif",
              fontSize: 'clamp(48px, 7vw, 82px)',
              lineHeight: 0.92,
              color: '#3a2530',
            }}
          >
            {detail.title}
          </h1>
          <p
            style={{
              margin: '18px 0 0',
              fontSize: 19,
              lineHeight: 1.65,
              color: 'rgba(58,37,48,0.68)',
            }}
          >
            {detail.desc}
          </p>
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {detail.specs.map((spec) => (
              <span
                key={spec}
                style={{
                  border: '1px solid rgba(58,37,48,0.22)',
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontSize: 13,
                  color: 'rgba(58,37,48,0.68)',
                }}
              >
                {spec}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            {detail.body.map((paragraph) => (
              <p
                key={paragraph}
                style={{
                  margin: '0 0 14px',
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: 'rgba(58,37,48,0.72)',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div
            style={{
              marginTop: 28,
              borderTop: '1px solid rgba(58,37,48,0.14)',
              paddingTop: 22,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>
                  {formatProductPrice(detailPrice)}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: 'rgba(58,37,48,0.58)',
                    fontSize: 13,
                  }}
                >
                  可加入购物车，结账时填写物流地址与订单留言。
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                style={{
                  border: 0,
                  borderRadius: 999,
                  background: '#3a2530',
                  color: '#fff',
                  padding: '13px 18px',
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 14px 30px rgba(58,37,48,0.22)',
                }}
              >
                加入购物车
              </button>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  handleAddToCart()
                  onOpenCart?.()
                }}
                style={{
                  border: '1px solid rgba(58,37,48,0.2)',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.7)',
                  color: '#3a2530',
                  padding: '12px 16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                立即结账
              </button>
              {cartNotice ? (
                <div
                  style={{
                    borderRadius: 999,
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.54)',
                    color: '#55744f',
                    fontSize: 13,
                    lineHeight: 1.4,
                    fontWeight: 800,
                  }}
                >
                  {cartNotice}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </article>
      <div
        style={{
          width: 'min(1120px, calc(100% - 40px))',
          margin: '-52px auto 96px',
        }}
      >
        <SeriesListingGrid
          title="继续探索同频护符"
          subtitle={`${detail.eyebrow} · Related`}
          tiles={relatedTiles.length ? relatedTiles : PRODUCT_TILES.slice(0, 4)}
          navigate={navigate}
        />
      </div>
    </AtmosphericShell>
  )
}

const LEGAL_PAGES = {
  privacy: {
    eyebrow: 'Privacy',
    title: '隐私政策',
    desc: '我们只收集完成订单、客户服务和网站体验优化所必需的信息。',
    sections: [
      {
        title: '我们收集的信息',
        body: '当你下单、订阅或联系我们时，可能会收集姓名、邮箱、收货地址、订单内容和必要的浏览数据。',
      },
      {
        title: '信息如何使用',
        body: '这些信息用于订单履约、物流通知、售后沟通、网站安全和基础数据分析。',
      },
      {
        title: '数据保护',
        body: '正式接入后端后，敏感数据应存放在受保护的数据库和支付平台中，不应暴露在前端代码里。',
      },
    ],
  },
  terms: {
    eyebrow: 'Terms',
    title: '服务条款',
    desc: '使用 Lunar Talisman 网站即表示你理解并接受本页面列出的基础条款。',
    sections: [
      {
        title: '商品说明',
        body: '水晶饰品因天然纹理、色泽和尺寸可能存在轻微差异，这也是天然晶石的独特之处。',
      },
      {
        title: '能量与疗愈免责声明',
        body: '网站中的脉轮、水晶能量和仪式内容属于生活方式与灵性体验表达，不替代医疗、心理或专业建议。',
      },
      {
        title: '订单责任',
        body: '请在下单前确认商品、数量和收货信息。若地址填写错误，请尽快联系品牌方处理。',
      },
    ],
  },
  shipping: {
    eyebrow: 'Shipping',
    title: '配送政策',
    desc: '我们会在订单确认后尽快准备护符，并提供清晰的发货状态。',
    sections: [
      {
        title: '处理时间',
        body: '常规商品预计 2-5 个工作日内处理。月相仪式批次可能根据新月或满月日期安排发货。',
      },
      {
        title: '物流信息',
        body: '正式订单系统接入后，发货后会通过邮件发送物流单号和追踪链接。',
      },
      {
        title: '国际配送',
        body: '不同国家和地区的配送时效、关税和进口要求可能不同，最终以物流服务商信息为准。',
      },
    ],
  },
  refund: {
    eyebrow: 'Refund',
    title: '退换货政策',
    desc: '我们希望每一件护符都被认真选择，也认真抵达。',
    sections: [
      {
        title: '可申请场景',
        body: '如商品在运输中损坏、错发或存在明显质量问题，请在收到后 7 日内联系我们。',
      },
      {
        title: '不可退换场景',
        body: '已佩戴、影响二次销售、定制仪式商品或因天然纹理差异产生的主观偏好，一般不支持退换。',
      },
      {
        title: '处理方式',
        body: '请保留包装、商品照片和订单信息。确认后可根据情况安排补发、换货或退款。',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: '联系我们',
    desc: '关于订单、合作、商品咨询或月相仪式批次，都可以从这里开始。',
    sections: [
      {
        title: '客户服务',
        body: '邮箱：hello@lunartalisman.com。正式邮箱配置完成后，可接入后台工单和自动回复。',
      },
      {
        title: '品牌合作',
        body: '如果你是内容创作者、买手店或灵性空间主理人，欢迎发送合作意向与渠道介绍。',
      },
      {
        title: '响应时间',
        body: '通常会在 1-3 个工作日内回复。满月和新品批次期间可能略有延迟。',
      },
    ],
  },
} satisfies Record<
  'privacy' | 'terms' | 'shipping' | 'refund' | 'contact',
  {
    eyebrow: string
    title: string
    desc: string
    sections: Array<{ title: string; body: string }>
  }
>

function LegalPage({
  id,
  navigate,
  cartCount,
  onOpenCart,
}: {
  id: 'privacy' | 'terms' | 'shipping' | 'refund' | 'contact'
  navigate: NavigateFn
  cartCount: number
  onOpenCart?: () => void
}) {
  const page = LEGAL_PAGES[id]
  usePageMeta({
    title: `${page.title} | Lunar Talisman`,
    description: page.desc,
  })

  return (
    <AtmosphericShell navigate={navigate} cartCount={cartCount} onOpenCart={onOpenCart}>
      <section
        style={{
          width: 'min(960px, calc(100% - 40px))',
          margin: '0 auto',
          padding: '128px 0 96px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.78)',
            padding: '10px 16px',
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          ← Back to portal
        </button>
        <p
          style={{
            margin: '44px 0 0',
            fontSize: 13,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          {page.eyebrow}
        </p>
        <h1
          style={{
            margin: '14px 0 0',
            fontFamily: "'Viaoda Libre', serif",
            fontSize: 'clamp(54px, 8vw, 108px)',
            lineHeight: 0.94,
            color: '#fff',
            textShadow: '0 2px 24px rgba(0,0,0,0.45)',
          }}
        >
          {page.title}
        </h1>
        <p
          style={{
            margin: '22px 0 34px',
            maxWidth: 680,
            fontSize: 19,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          {page.desc}
        </p>
        <div
          style={{
            borderRadius: 38,
            background: 'rgba(255,255,255,0.82)',
            padding: 'clamp(28px, 4vw, 46px)',
            color: '#3a2530',
            boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          }}
        >
          {page.sections.map((section) => (
            <section key={section.title} style={{ marginBottom: 26 }}>
              <h2 style={{ margin: 0, fontSize: 22 }}>{section.title}</h2>
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: 'rgba(58,37,48,0.72)',
                }}
              >
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </section>
    </AtmosphericShell>
  )
}

function CartPage({
  navigate,
  cart,
  setCart,
  clearCart,
  cartCount,
  drawer = false,
  onClose,
}: {
  navigate: NavigateFn
  cart: CartLine[]
  setCart: (items: CartLine[]) => void
  clearCart: () => void
  cartCount: number
  drawer?: boolean
  onClose?: () => void
}) {
  usePageMeta({
    title: '购物车 | Lunar Talisman',
    description: '查看购物车、填写物流、留下留言并提交订单。',
  })

  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [doneOrderId, setDoneOrderId] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    shippingMethod: 'standard',
    message: '',
  })

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = form.shippingMethod === 'express' ? 18 : 8
  const total = subtotal + (cart.length ? shippingFee : 0)

  const updateQuantity = (id: string, quantity: number) => {
    setNotice('')
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== id))
      return
    }

    setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cart.length) {
      setNotice('购物车为空，请先加入商品。')
      return
    }

    if (!form.name.trim() || !form.email.trim() || !form.address.trim()) {
      setNotice('请补全姓名、邮箱和收货地址。')
      return
    }

    const order: PublicOrder = {
      id: `LT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
        Date.now(),
      ).slice(-4)}`,
      customer: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      product:
        cart.length === 1
          ? cart[0].name
          : `${cart[0].name} 等 ${cart.reduce((sum, item) => sum + item.quantity, 0)} 件商品`,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      channel: '官网购物车',
      amount: total,
      shippingMethod: form.shippingMethod,
      shippingFee,
      shippingStatus: '待发货',
      message: form.message.trim(),
      status: '待处理',
      createdAt: new Date().toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setSubmitting(true)
    try {
      const created = await createPublicOrder(order)
      appendOrder(created)
      setDoneOrderId(created.id)
      clearCart()
      setNotice('订单已进入后台，后续可在后台查看物流与留言。')
      setForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        shippingMethod: 'standard',
        message: '',
      })
    } catch {
      appendOrder(order)
      setDoneOrderId(order.id)
      clearCart()
      setNotice('已保存到本地兜底订单；数据库同步稍后完成时会写入后台。')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!drawer) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawer, onClose])

  const content = (
      <section
        style={{
          width: drawer ? '100%' : 'min(1180px, calc(100% - 40px))',
          margin: drawer ? 0 : '0 auto',
          padding: drawer ? '0 0 28px' : '128px 0 96px',
          display: drawer ? 'block' : 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
          gap: 28,
        }}
        className={drawer ? '' : 'max-[980px]:!grid-cols-1'}
      >
        <div
          style={{
            borderRadius: 38,
            background: 'rgba(255,255,255,0.84)',
            color: '#3a2530',
            padding: 'clamp(26px, 4vw, 42px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.56)' }}>
                Checkout
              </p>
              <h1 style={{ margin: '10px 0 0', fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(42px, 6vw, 72px)', lineHeight: 0.95 }}>
                购物车与物流信息
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigate('/series/crystals')}
              style={{
                border: '1px solid rgba(58,37,48,0.16)',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.55)',
                color: '#3a2530',
                padding: '10px 14px',
                cursor: 'pointer',
              }}
            >
              继续选购
            </button>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gap: 14 }}>
            {cart.length ? cart.map((item) => (
              <article
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '96px minmax(0, 1fr) auto',
                  gap: 16,
                  alignItems: 'center',
                  padding: 14,
                  borderRadius: 24,
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(58,37,48,0.08)',
                }}
                className="max-[640px]:!grid-cols-1"
              >
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 22,
                    overflow: 'hidden',
                    background: item.color,
                    backgroundImage: item.image ? `url(${item.image})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.5)' }}>
                    {item.eyebrow}
                  </p>
                  <h3 style={{ margin: '8px 0 0', fontSize: 22 }}>{item.name}</h3>
                  <p style={{ margin: '8px 0 0', color: 'rgba(58,37,48,0.64)' }}>
                    {formatProductPrice(item.price)} / 件
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifySelf: 'end', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ border: 0, width: 36, height: 36, borderRadius: 999, background: '#f2ede6', cursor: 'pointer' }} aria-label="减少数量">
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 900 }}>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ border: 0, width: 36, height: 36, borderRadius: 999, background: '#f2ede6', cursor: 'pointer' }} aria-label="增加数量">
                    <Plus size={16} />
                  </button>
                  <button type="button" onClick={() => updateQuantity(item.id, 0)} style={{ border: 0, width: 36, height: 36, borderRadius: 999, background: '#f9e8e8', cursor: 'pointer' }} aria-label="删除商品">
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            )) : (
              <div
                style={{
                  borderRadius: 28,
                  padding: '40px 24px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.56)',
                  color: 'rgba(58,37,48,0.68)',
                }}
              >
                <ShoppingBag size={44} style={{ margin: '0 auto 14px', opacity: 0.35 }} />
                <div style={{ fontSize: 18, fontWeight: 900 }}>你的护符尚未被召唤</div>
                <p style={{ margin: '10px 0 0' }}>先去系列里挑选一件，再回来填写物流和留言。</p>
              </div>
            )}
          </div>
        </div>

        <aside
          style={{
            borderRadius: 38,
            background: 'rgba(255,255,255,0.8)',
            color: '#3a2530',
            padding: 'clamp(24px, 4vw, 36px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            alignSelf: 'start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={18} />
            <h2 style={{ margin: 0, fontSize: 22 }}>结账信息</h2>
          </div>
          <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <MessageSquare size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                姓名
              </span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} style={formFieldStyle} placeholder="收货人姓名" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <Mail size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                邮箱
              </span>
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} style={formFieldStyle} placeholder="用于订单通知" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <Phone size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                电话
              </span>
              <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} style={formFieldStyle} placeholder="可选" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                收货地址
              </span>
              <textarea rows={3} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} style={{ ...formFieldStyle, resize: 'vertical', fontFamily: 'inherit' }} placeholder="详细地址" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <Truck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                物流方式
              </span>
              <select value={form.shippingMethod} onChange={(event) => setForm((current) => ({ ...current, shippingMethod: event.target.value }))} style={formFieldStyle}>
                <option value="standard">标准物流 · $8</option>
                <option value="express">加急物流 · $18</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <MessageSquare size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                订单留言
              </span>
              <textarea rows={4} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} style={{ ...formFieldStyle, resize: 'vertical', fontFamily: 'inherit' }} placeholder="例如：请尽量避光包装 / 送礼备注 / 其他要求" />
            </label>

            <div style={{ marginTop: 8, borderTop: '1px solid rgba(58,37,48,0.12)', paddingTop: 16, display: 'grid', gap: 8 }}>
              <Row label="商品小计" value={formatProductPrice(subtotal)} />
              <Row label="物流费用" value={cart.length ? formatProductPrice(shippingFee) : '$0'} />
              <Row label="合计" value={formatProductPrice(total)} strong />
            </div>

            <button type="submit" disabled={submitting} style={{ border: 0, borderRadius: 999, background: '#3a2530', color: '#fff', padding: '14px 18px', fontWeight: 900, cursor: submitting ? 'wait' : 'pointer', boxShadow: '0 14px 30px rgba(58,37,48,0.22)', opacity: submitting ? 0.72 : 1 }}>
              {submitting ? '提交订单中...' : '提交订单'}
            </button>

            {notice ? (
              <div style={{ borderRadius: 18, padding: '12px 14px', background: 'rgba(255,255,255,0.6)', color: '#55744f', fontSize: 13, fontWeight: 800, lineHeight: 1.5 }}>
                {notice}
                {doneOrderId ? <div style={{ marginTop: 4, color: '#3a2530' }}>订单号：{doneOrderId}</div> : null}
              </div>
            ) : null}
          </form>
        </aside>
      </section>
  )

  if (drawer) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="购物车抽屉"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 120,
          background:
            'linear-gradient(90deg, rgba(12,8,14,0.08), rgba(48,30,62,0.28))',
          backdropFilter: 'blur(6px) saturate(1.08)',
        }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose?.()
        }}
      >
        <aside
          style={{
            marginLeft: 'auto',
            height: '100%',
            width: 'min(520px, 100%)',
            overflowY: 'auto',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(236,231,251,0.84) 46%, rgba(255,245,255,0.88))',
            borderLeft: '1px solid rgba(255,255,255,0.52)',
            boxShadow: '-24px 0 90px rgba(70,42,92,0.24)',
            padding: '28px 24px 24px',
            color: '#3a2530',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'rgba(58,37,48,0.48)',
                }}
              >
                Checkout
              </p>
              <h2
                style={{
                  margin: '8px 0 0',
                  fontFamily: "'Viaoda Libre', serif",
                  fontSize: 34,
                  lineHeight: 1,
                  color: '#3a2530',
                }}
              >
                购物车
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭购物车"
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                border: '1px solid rgba(58,37,48,0.12)',
                background: 'rgba(255,255,255,0.48)',
                color: '#3a2530',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ color: 'rgba(58,37,48,0.58)', fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
            在当前页面右侧完成购物车、物流与留言，不跳转到单独页面。
          </div>
          {content}
        </aside>
      </div>
    )
  }

  return <AtmosphericShell navigate={navigate} cartCount={cartCount}>{content}</AtmosphericShell>
}

const formFieldStyle: CSSProperties = {
  border: '1px solid rgba(58,37,48,0.14)',
  borderRadius: 18,
  background: 'rgba(255,255,255,0.72)',
  color: '#3a2530',
  padding: '13px 14px',
  outline: 0,
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: strong ? 18 : 14, fontWeight: strong ? 900 : 700 }}>
      <span style={{ color: 'rgba(58,37,48,0.64)' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function HomePage({
  navigate,
  cartCount,
  onOpenCart,
}: {
  navigate: NavigateFn
  cartCount: number
  onOpenCart?: () => void
}) {
  usePageMeta({
    title: 'Lunar Talisman · 月之护符',
    description: '高端七脉轮水晶饰品品牌站，进入一场月光、脉轮与水晶护符的沉浸式旅程。',
  })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [manualLoopRotation, setManualLoopRotation] = useState(0)
  const scrollProgressRef = useRef(0)
  const wheelLockRef = useRef(0)
  const [curtainsOpen, setCurtainsOpen] = useState(false)
  const [uiVisible, setUiVisible] = useState(true)
  const [entranceDone, setEntranceDone] = useState(false)
  const { isMobile, isDesktop } = useViewportMode()
  const mouse = useMouseParallax()

  useEffect(() => {
    const openTimer = window.setTimeout(() => setCurtainsOpen(true), 100)
    const uiTimer = window.setTimeout(() => setUiVisible(true), 600)
    const doneTimer = window.setTimeout(() => setEntranceDone(true), 2200)

    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(uiTimer)
      window.clearTimeout(doneTimer)
    }
  }, [])

  useEffect(() => {
    let raf = 0

    const update = () => {
      const container = containerRef.current
      if (container) {
        const maxScroll = container.scrollHeight - window.innerHeight
        const nextProgress = clamp(window.scrollY / Math.max(1, maxScroll))
        scrollProgressRef.current = nextProgress
        setScrollProgress(nextProgress)
      }
      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  const scrollToProgress = useCallback((targetProgress: number) => {
    const container = containerRef.current
    const maxScroll = container
      ? container.scrollHeight - window.innerHeight
      : document.documentElement.scrollHeight - window.innerHeight
    const safeMaxScroll = Math.max(1, maxScroll)
    const offsetTop = container?.offsetTop ?? 0

    window.scrollTo({
      top: offsetTop + safeMaxScroll * clamp(targetProgress),
      behavior: 'smooth',
    })
  }, [])

  const scrollToSceneTwo = useCallback(() => {
    scrollToProgress(0.74)
  }, [scrollToProgress])

  const handleHomeWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      const progress = scrollProgressRef.current
      const isAtEnd = progress >= 0.995 && event.deltaY > 0
      if (!isAtEnd) return

      const now = Date.now()
      if (now - wheelLockRef.current < 420 || Math.abs(event.deltaY) < 12) {
        return
      }

      event.preventDefault()
      wheelLockRef.current = now
      setManualLoopRotation(
        (current) => current + (isMobile ? 12 : 9) * (event.deltaY > 0 ? 1 : -1),
      )
    },
    [isMobile],
  )

  const values = useMemo(() => {
    const ep = easeInOut(scrollProgress)
    const scene1Opacity = clamp(1 - scrollProgress / 0.22)
    const scene2Opacity = clamp((scrollProgress - 0.68) / 0.16)
    // One complete cycle ends back on the first card, so the queue never
    // gets stuck on the final item.
    const arcSweepDeg = ARC_CARDS.length * (isMobile ? 12 : 9)
    const rotationOffset = lerp(
      0,
      arcSweepDeg,
      clamp((scrollProgress - 0.7) / 0.3),
    )
    return {
      ep,
      scene1Opacity,
      scene2Opacity,
      rotationOffset: rotationOffset + manualLoopRotation,
      mx: isMobile ? 0 : mouse.x,
      my: isMobile ? 0 : mouse.y,
    }
  }, [isMobile, manualLoopRotation, mouse.x, mouse.y, scrollProgress])

  const worldTransform = `translate3d(${-values.mx * MAG.world}px, ${-values.my * MAG.world}px, 0) scale(${lerp(1, 1.18, values.ep)})`
  const cloudTransform = `translate3d(${-values.mx * MAG.clouds}px, ${-values.my * MAG.clouds * 0.4}px, 0) scale(${lerp(1, 1.4, values.ep)})`
  const portalTransform = `translate3d(${-values.mx * MAG.portal}px, ${-values.my * MAG.portal}px, 0) scale(${lerp(1, 7.5, values.ep)})`
  const curtainLTransform = `translate3d(${(curtainsOpen ? -62 : 0) - lerp(0, 150, values.ep)}%, ${-values.my * MAG.curtainL * 0.3}px, 0) translateX(${-values.mx * MAG.curtainL}px) scale(${lerp(1, 1.3, values.ep)})`
  const curtainRTransform = `translate3d(${(curtainsOpen ? 62 : 0) + lerp(0, 150, values.ep)}%, ${-values.my * MAG.curtainR * 0.3}px, 0) translateX(${-values.mx * MAG.curtainR}px) scale(${lerp(1, 1.3, values.ep)})`

  return (
    <div ref={containerRef} style={{ height: '480vh', position: 'relative' }}>
      <div
        onWheel={handleHomeWheel}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: '#0a0608',
          color: '#fff',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: '50% 50%',
            transform: worldTransform,
            willChange: 'transform',
          }}
        >
          <PortalImage src={WORLD_BG} alt="" />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            transformOrigin: '50% 100%',
            transform: cloudTransform,
            opacity: lerp(0.7, 1, clamp(scrollProgress / 0.05)),
            willChange: 'transform, opacity',
          }}
        >
          <img
            src={BOTTOM_CLOUDS}
            alt=""
            draggable={false}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <ArcCardSlider
          cards={ARC_CARDS}
          rotationOffset={values.rotationOffset}
        isMobile={isMobile}
        opacity={values.scene2Opacity}
        navigate={navigate}
        animated
      />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 15,
            transformOrigin: '52% 38%',
            transform: portalTransform,
            opacity:
              scrollProgress <= 0.65
                ? 1
                : clamp(1 - (scrollProgress - 0.65) / 0.2),
            willChange: 'transform, opacity',
          }}
        >
          <PortalImage src={PORTAL_BG} alt="" />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '40%',
            zIndex: 16,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 16,
            transformOrigin: 'left center',
            transform: curtainLTransform,
            transition: entranceDone
              ? 'none'
              : 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          <PortalImage
            src={CURTAIN_LEFT}
            alt=""
            style={{ objectPosition: 'right center' }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 16,
            transformOrigin: 'right center',
            transform: curtainRTransform,
            transition: entranceDone
              ? 'none'
              : 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          <PortalImage
            src={CURTAIN_RIGHT}
            alt=""
            style={{ objectPosition: 'left center' }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '42vh',
            zIndex: 45,
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <Navigation navigate={navigate} cartCount={cartCount} onOpenCart={onOpenCart} />
        <SceneOneUI
          opacity={values.scene1Opacity}
          uiVisible={uiVisible}
          isMobile={isMobile}
          isDesktop={isDesktop}
          onDescend={scrollToSceneTwo}
          onProgressJump={scrollToProgress}
        />
        <SceneTwoUI opacity={values.scene2Opacity} />
      </div>
    </div>
  )
}

function App() {
  const { route, navigate } = useRoute()
  const [, refreshAdminProducts] = useState(0)
  const [cart, setCartState] = useState<CartLine[]>(() => readCartLines())
  const [cartOpen, setCartOpen] = useState(route.page === 'cart')
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const openCart = useCallback(() => {
    setCartOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setCartOpen(false)
    if (window.location.pathname === '/cart') {
      navigate('/')
    }
  }, [navigate])

  const goTo = useCallback(
    (path: string) => {
      if (path === '/cart') {
        setCartOpen(true)
        return
      }

      setCartOpen(false)
      navigate(path)
    },
    [navigate],
  )

  const setCart = useCallback((items: CartLine[]) => {
    setCartState(items)
    saveCartLines(items)
  }, [])

  const addToCart = useCallback(
    (item: CartLine) => {
      setCartState((current) => {
        const existing = current.find((line) => line.id === item.id)
        const next = existing
          ? current.map((line) =>
              line.id === item.id ? { ...line, quantity: line.quantity + item.quantity } : line,
            )
          : [item, ...current]
        saveCartLines(next)
        return next
      })
    },
    [],
  )

  const clearCart = useCallback(() => {
    setCartState([])
    saveCartLines([])
  }, [])

  useEffect(() => {
    let active = true

    fetchPublishedProducts()
      .then((products) => {
        if (!active || products.length === 0) return
        window.localStorage.setItem(ADMIN_PRODUCT_KEY, JSON.stringify(products))
        refreshAdminProducts((version) => version + 1)
      })
      .catch(() => {
        // 前台商品接口不可用时继续使用内置商品和本地兜底数据。
      })

    return () => {
      active = false
    }
  }, [])

  if (route.page === 'series') {
    return (
      <>
        <SeriesPage
          id={route.id}
          navigate={goTo}
          cartCount={cartCount}
          onOpenCart={openCart}
        />
        {cartOpen && (
          <CartPage
            navigate={goTo}
            cart={cart}
            setCart={setCart}
            clearCart={clearCart}
            cartCount={cartCount}
            drawer
            onClose={closeCart}
          />
        )}
      </>
    )
  }

  if (route.page === 'detail') {
    return (
      <>
        <DetailPage
          id={route.id}
          navigate={goTo}
          addToCart={addToCart}
          cartCount={cartCount}
          onOpenCart={openCart}
        />
        {cartOpen && (
          <CartPage
            navigate={goTo}
            cart={cart}
            setCart={setCart}
            clearCart={clearCart}
            cartCount={cartCount}
            drawer
            onClose={closeCart}
          />
        )}
      </>
    )
  }

  if (route.page === 'cart') {
    return (
      <>
        <HomePage navigate={goTo} cartCount={cartCount} onOpenCart={openCart} />
        <CartPage
          navigate={goTo}
          cart={cart}
          setCart={setCart}
          clearCart={clearCart}
          cartCount={cartCount}
          drawer
          onClose={closeCart}
        />
      </>
    )
  }

  if (route.page === 'admin') {
    return <AdminPage navigate={navigate} />
  }

  if (route.page === 'legal') {
    return (
      <>
        <LegalPage id={route.id} navigate={goTo} cartCount={cartCount} onOpenCart={openCart} />
        {cartOpen && (
          <CartPage
            navigate={goTo}
            cart={cart}
            setCart={setCart}
            clearCart={clearCart}
            cartCount={cartCount}
            drawer
            onClose={closeCart}
          />
        )}
      </>
    )
  }

  return (
    <>
      <HomePage navigate={goTo} cartCount={cartCount} onOpenCart={openCart} />
      {cartOpen && (
        <CartPage
          navigate={goTo}
          cart={cart}
          setCart={setCart}
          clearCart={clearCart}
          cartCount={cartCount}
          drawer
          onClose={closeCart}
        />
      )}
    </>
  )
}

export default App
