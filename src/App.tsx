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
import { trackEvent, trackPageView } from './services/analytics'
import type { PublicOrder } from './services/orders'
import {
  cancelPaypalOrder,
  capturePaypalOrder,
  createPaypalOrder,
  createPublicOrder,
  fetchPublishedProducts,
  getPaymentConfiguration,
  submitSupportRequest,
  trackPublicOrder,
} from './services/backend'
import type { PublicTrackingOrder } from './services/backend'
import { useEnglishUi } from './hooks/useEnglishUi'
import { importedProducts, type ChakraId } from './data/importedProducts'
import {
  importedSeriesGuides,
  type GuideSeries,
  type ImportedSeriesGuide,
} from './data/importedSeriesGuides'

const SITE_ORIGIN = 'https://lunartalisman.com'

// These atmospheric layers are deliberately served from this site rather than
// the old Figma prototype host. That keeps the current visual intact while
// removing an external single point of failure from the homepage experience.
const PORTAL_BG = '/atmosphere/portal.webp'
const CURTAIN_LEFT = '/atmosphere/curtain-left.webp'
const CURTAIN_RIGHT = '/atmosphere/curtain-right.webp'
const WORLD_BG = '/atmosphere/world.webp'
const BOTTOM_CLOUDS = '/atmosphere/bottom-clouds.webp'

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
  | { page: 'guide'; id: string }
  | { page: 'notFound' }
  | { page: 'cart' }
  | { page: 'track' }
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
  images?: string[]
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

type ShippingRegion = 'Americas' | 'Europe' | 'Southeast Asia'

const SHIPPING_DESTINATIONS: Record<ShippingRegion, readonly string[]> = {
  Americas: [
    'Antigua and Barbuda',
    'Argentina',
    'Bahamas',
    'Barbados',
    'Belize',
    'Bolivia',
    'Brazil',
    'Canada',
    'Chile',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'El Salvador',
    'Grenada',
    'Guatemala',
    'Guyana',
    'Haiti',
    'Honduras',
    'Jamaica',
    'Mexico',
    'Nicaragua',
    'Panama',
    'Paraguay',
    'Peru',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Suriname',
    'Trinidad and Tobago',
    'United States',
    'Uruguay',
    'Venezuela',
  ],
  Europe: [
    'Albania',
    'Andorra',
    'Armenia',
    'Austria',
    'Azerbaijan',
    'Belarus',
    'Belgium',
    'Bosnia and Herzegovina',
    'Bulgaria',
    'Croatia',
    'Cyprus',
    'Czechia',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Georgia',
    'Germany',
    'Greece',
    'Hungary',
    'Iceland',
    'Ireland',
    'Italy',
    'Kazakhstan',
    'Kosovo',
    'Latvia',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Moldova',
    'Monaco',
    'Montenegro',
    'Netherlands',
    'North Macedonia',
    'Norway',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'San Marino',
    'Serbia',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
    'Switzerland',
    'Turkey',
    'Ukraine',
    'United Kingdom',
    'Vatican City',
  ],
  'Southeast Asia': [
    'Brunei',
    'Cambodia',
    'Indonesia',
    'Laos',
    'Malaysia',
    'Myanmar',
    'Philippines',
    'Singapore',
    'Thailand',
    'Timor-Leste',
    'Vietnam',
  ],
}

const SHIPPING_RATES: Record<ShippingRegion, { standard: number; express: number }> = {
  Americas: { standard: 8, express: 18 },
  Europe: { standard: 14, express: 28 },
  'Southeast Asia': { standard: 12, express: 24 },
}

function getShippingRegionForCountry(country: string): ShippingRegion {
  return (
    (Object.entries(SHIPPING_DESTINATIONS).find(([, countries]) =>
      countries.includes(country),
    )?.[0] as ShippingRegion | undefined) ?? 'Americas'
  )
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
const REMOVED_IMPORTED_PRODUCT_IDS = new Set([
  'sacral-sacral-chakra-vitality-carnelian-bracelet-8mm',
  'sacral-sacral-chakra-honey-amber-bracelet-10mm',
  'sacral-sacral-chakra-passion-orange-garnet-bracelet-6mm',
  'sacral-sacral-chakra-faceted-carnelian-bracelet-10mm',
  'sacral-sacral-chakra-golden-tigers-eye-bracelet-10mm',
  'sacral-sacral-chakra-flame-orange-agate-bracelet-10mm',
  // The supplier's primary image is an access-denied placeholder rather than
  // product content, so do not expose its collection card or detail URL.
  'sacral-sacral-chakra-radiance-sunstone-bracelet-8mm',
  'crown-i02-2503-ddd',
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

const CHAKRA_COLLECTIONS = [
  {
    id: 'root',
    title: 'ROOT\nRoot Chakra',
    eyebrow: 'Root Chakra',
    desc: 'Grounding, safety, and the steady foundation beneath every beginning.',
  },
  {
    id: 'sacral',
    title: 'SACRAL\nSacral Chakra',
    eyebrow: 'Sacral Chakra',
    desc: 'Flow, creativity, and the warmth of feeling fully alive.',
  },
  {
    id: 'solar',
    title: 'SOLAR\nSolar Plexus Chakra',
    eyebrow: 'Solar Plexus Chakra',
    desc: 'Confidence, clarity, and the courage to take up your own space.',
  },
  {
    id: 'heart',
    title: 'HEART\nHeart Chakra',
    eyebrow: 'Heart Chakra',
    desc: 'Love, compassion, and a softer way of returning to yourself.',
  },
  {
    id: 'throat',
    title: 'THROAT\nThroat Chakra',
    eyebrow: 'Throat Chakra',
    desc: 'Truth, expression, and a voice that feels like your own.',
  },
  {
    id: 'third-eye',
    title: 'THIRD EYE\nThird Eye Chakra',
    eyebrow: 'Third Eye Chakra',
    desc: 'Intuition, insight, and the quiet intelligence of inner vision.',
  },
  {
    id: 'crown',
    title: 'CROWN\nCrown Chakra',
    eyebrow: 'Crown Chakra',
    desc: 'Stillness, spiritual connection, and a wider field of possibility.',
  },
] as const

const CHAKRA_SEO_META: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  root: {
    title: 'Root Chakra Stones for Grounding & Safety',
    description:
      'Explore root chakra stones and crystal bracelets for grounding, safety, stability, and reflective everyday ritual.',
    keywords: ['root chakra stones', 'root chakra bracelet', 'grounding crystals', 'crystals for protection'],
  },
  sacral: {
    title: 'Sacral Chakra Stones for Creativity & Passion',
    description:
      'Explore sacral chakra stones and crystal bracelets for creativity, passion, emotional flow, and joyful ritual.',
    keywords: ['sacral chakra stones', 'sacral chakra bracelet', 'creativity crystals', 'passion crystals'],
  },
  solar: {
    title: 'Solar Plexus Chakra Stones for Confidence & Personal Power',
    description:
      'Explore solar plexus chakra stones for confidence, clarity, courage, wealth intentions, and personal power.',
    keywords: ['solar plexus chakra stones', 'confidence crystals', 'crystals for wealth', 'chakra bracelet'],
  },
  heart: {
    title: 'Heart Chakra Stones for Love & Compassion',
    description:
      'Explore heart chakra stones for love, compassion, emotional balance, and mindful relationship rituals.',
    keywords: ['heart chakra stones', 'heart chakra bracelet', 'rose quartz meaning', 'crystals for love'],
  },
  throat: {
    title: 'Throat Chakra Stones for Truth & Expression',
    description:
      'Explore throat chakra stones for clear expression, honest communication, and a confident everyday voice.',
    keywords: ['throat chakra stones', 'throat chakra bracelet', 'communication crystals', 'blue crystals'],
  },
  'third-eye': {
    title: 'Third Eye Chakra Stones for Intuition & Insight',
    description:
      'Explore third eye chakra stones for intuition, insight, meditation, and reflective inner vision.',
    keywords: ['third eye chakra crystals', 'third eye chakra bracelet', 'amethyst meaning', 'intuition crystals'],
  },
  crown: {
    title: 'Crown Chakra Stones for Spiritual Connection & Clarity',
    description:
      'Explore crown chakra stones for spiritual connection, clarity, stillness, and lunar reflection.',
    keywords: ['crown chakra crystals', 'crown chakra bracelet', 'clear quartz meaning', 'spiritual crystals'],
  },
}

const SERIES_SEO_META: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  worlds: {
    title: 'Crystal Healing Guide & Crystal Meanings',
    description:
      'Explore crystal healing traditions, crystal meanings, chakra stones, lunar rituals, and mindful crystal jewelry.',
    keywords: ['crystal healing', 'crystal meanings', 'healing crystals', 'crystal meaning guide'],
  },
  collections: {
    title: 'Crystal Jewelry, Chakra Bracelets & Gemstone Jewelry',
    description:
      'Shop crystal jewelry, gemstone bracelets, chakra bracelets, and healing crystal jewelry from Lunar Talisman.',
    keywords: ['crystal jewelry', 'gemstone jewelry', 'crystal bracelet', 'healing crystals jewelry'],
  },
  rituals: {
    title: 'How to Cleanse Crystals & Moon Ritual Guides',
    description:
      'Learn how to cleanse crystals at home, charge crystals safely, and create new moon and full moon rituals.',
    keywords: ['how to cleanse crystals', 'how to cleanse crystals at home', 'how to charge crystals', 'new moon ritual', 'full moon ritual'],
  },
  chakra: {
    title: 'Chakra Stones in Order & 7 Chakra Meanings',
    description:
      'Explore chakra stones in order, chakra stones meaning and colors, seven chakra collections, and chakra bracelets.',
    keywords: ['chakra stones in order', 'chakra stones meaning', 'chakra stones chart', 'chakra stones bracelet', '7 chakras and their meanings'],
  },
  lunar: {
    title: 'Moon Phases & Crystals: New Moon and Full Moon Rituals',
    description:
      'Use moon phases and crystals as a reflective rhythm for new moon intentions, full moon release, cleansing, and charging.',
    keywords: ['moon phases and crystals', 'new moon ritual crystals', 'full moon ritual crystals', 'crystal cleansing'],
  },
  crystals: {
    title: 'Crystal Meanings Chart & Healing Crystal Jewelry',
    description:
      'Browse a crystal meanings chart, gemstone meanings, healing crystals, crystal bracelets, necklaces, and talisman jewelry.',
    keywords: ['crystal meaning chart', 'gemstone meanings chart', 'healing crystals', 'crystal shop online', 'healing crystals jewelry'],
  },
  connect: {
    title: 'Crystals for Beginners: Choose Your Crystal Bracelet',
    description:
      'A beginner-friendly path to crystal meanings, chakra stones, crystal bracelets, gifts, and mindful everyday wear.',
    keywords: ['crystals for beginners', 'crystal bracelet for women', 'crystal bracelet for men', 'crystal gift for her', 'crystal gift for him'],
  },
}

const GUIDE_SEO_META: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  'chakra-seven-chakras-explained': {
    title: '7 Chakras and Their Meanings: Chakra Stones in Order',
    description:
      'A clear guide to the seven chakras, chakra stones in order, colors, traditional meanings, and reflective practice.',
    keywords: ['7 chakras and their meanings', 'chakra stones in order', 'chakra stones chart', 'chakra stones meaning'],
  },
  'crystals-00': {
    title: 'Crystal Meanings Chart & Gemstone Meanings Guide',
    description:
      'Use this crystal meanings chart and gemstone meanings guide to compare traditional symbolism, colors, care, and ritual use.',
    keywords: ['crystal meaning chart', 'crystal meaning guide', 'gemstone meanings chart', 'crystal meanings list'],
  },
  'worlds-08': {
    title: 'Crystals for Beginners: A Practical Starting Guide',
    description:
      'Learn how to choose, wear, cleanse, and care for your first crystal without overcomplicating the ritual.',
    keywords: ['crystals for beginners', 'how to use crystals for beginners', 'crystal bracelet'],
  },
  'rituals-05': {
    title: 'How to Cleanse Crystals at Home',
    description:
      'Learn safe ways to cleanse crystals at home with moonlight, selenite, sound, and mineral-aware care.',
    keywords: ['how to cleanse crystals', 'how to cleanse crystals at home', 'cleanse crystals with selenite', 'cleanse crystals with moonlight'],
  },
  'rituals-06': {
    title: 'How to Charge Crystals Safely',
    description:
      'Learn reflective ways to charge crystals with moonlight, intention, sound, and care-safe placement.',
    keywords: ['how to charge crystals', 'how to charge crystals on a full moon', 'crystal charging methods'],
  },
  'rituals-01': {
    title: 'New Moon Crystal Ritual for Fresh Intentions',
    description:
      'A simple new moon crystal ritual for setting intentions, journaling, and beginning a new reflective cycle.',
    keywords: ['new moon ritual', 'new moon ritual crystals', 'new moon manifestation ritual'],
  },
  'rituals-02': {
    title: 'Full Moon Crystal Ritual for Release & Reflection',
    description:
      'A simple full moon crystal ritual for gratitude, release, cleansing, and reflective closure.',
    keywords: ['full moon ritual', 'full moon ritual crystals', 'releasing ritual during full moon'],
  },
  'rituals-moon-phase-guide': {
    title: 'Moon Phases and Crystals: A Practical Guide',
    description:
      'Understand moon phases and crystals as a reflective rhythm for intention setting, cleansing, charging, and release.',
    keywords: ['moon phases and crystals', 'phases of the moon', 'crystals for full moon'],
  },
  'connect-crystal-care-faq': {
    title: 'Crystal Care FAQ: Meanings, Wearing & Cleansing',
    description:
      'Answers to common questions about crystal meanings, choosing a bracelet, wearing crystals, cleansing, and care.',
    keywords: ['crystal meanings', 'crystal bracelet', 'how to cleanse crystals', 'crystals for beginners'],
  },
}

function getProductSeoMeta(id: string, title: string) {
  const source = `${id} ${title}`.toLowerCase()
  if (source.includes('amethyst')) {
    return {
      title: 'Amethyst Bracelet Meaning & Benefits',
      description:
        'Explore amethyst bracelet meaning, traditional benefits, care, and mindful everyday wear from Lunar Talisman.',
      keywords: ['amethyst meaning', 'amethyst benefits', 'healing crystal bracelet'],
    }
  }
  if (source.includes('rose quartz')) {
    return {
      title: 'Rose Quartz Bracelet for Love & Emotional Balance',
      description:
        'Explore rose quartz meaning, traditional love symbolism, care, and reflective crystal jewelry rituals.',
      keywords: ['rose quartz meaning', 'crystals for love', 'crystal bracelet'],
    }
  }
  if (source.includes('citrine') || source.includes('yellow crystal')) {
    return {
      title: 'Citrine Crystal Bracelet for Confidence & Wealth',
      description:
        'Explore citrine meaning, traditional confidence and wealth symbolism, care, and crystal bracelet styling.',
      keywords: ['citrine meaning', 'crystals for wealth', 'citrine bracelet'],
    }
  }
  if (source.includes('moonstone')) {
    return {
      title: 'Moonstone Jewelry for Intuition & Emotional Balance',
      description:
        'Explore moonstone meaning, traditional intuition symbolism, care, and lunar-inspired crystal jewelry.',
      keywords: ['moonstone meaning', 'moonstone necklace', 'healing crystals'],
    }
  }
  if (/love|heart|rose|strawberry/.test(source)) {
    return {
      title: 'Crystal Bracelet for Love & Relationships',
      description:
        'Explore crystal meanings and traditional love symbolism for mindful relationship rituals and everyday crystal jewelry.',
      keywords: ['crystal for love', 'best crystal for love and relationships', 'crystal bracelet'],
    }
  }
  if (/wealth|fortune|prosperity|money|citrine|tiger.?s.eye/.test(source)) {
    return {
      title: 'Crystal Bracelet for Wealth & Good Fortune',
      description:
        'Explore traditional wealth, abundance, and good-fortune symbolism in crystal bracelets and gemstone jewelry.',
      keywords: ['crystal for money and wealth', 'crystals for money manifestation', 'crystal for good luck and success'],
    }
  }
  if (/protect|guardian|obsidian|black/.test(source)) {
    return {
      title: 'Protective Crystal Bracelet for Negative Energy',
      description:
        'Explore traditional protection symbolism, grounding crystal meanings, care, and reflective everyday wear.',
      keywords: ['crystal for protection from negative energy', 'crystals for negative energy protection', 'grounding crystals'],
    }
  }
  if (/sleep|calm|peace|moon/.test(source)) {
    return {
      title: 'Crystal Jewelry for Calm, Sleep & Reflection',
      description:
        'Explore traditional calm and sleep symbolism, moon-inspired crystal meanings, care, and mindful evening ritual.',
      keywords: ['crystal for sleep', 'best crystals for restful sleep', 'moonstone meaning'],
    }
  }
  return {
    title: `${title.replace(/\n/g, ' ')} Meaning & Benefits`,
    description:
      'Explore traditional crystal meanings, materials, care notes, and reflective ritual context for this Lunar Talisman piece.',
    keywords: ['crystal meanings', 'crystal bracelet', 'crystal jewelry'],
  }
}

const ACTIVE_IMPORTED_PRODUCTS = importedProducts.filter(
  (product) => !REMOVED_IMPORTED_PRODUCT_IDS.has(product.id),
)

type ChakraDetailContent = {
  tagline: (name: string) => string
  material: string
  energy: string[]
  benefits: string[]
  howToWear: string[]
  careRitual: string[]
  specs: string[]
}

const CHAKRA_DETAIL_CONTENT: Record<ChakraId, ChakraDetailContent> = {
  root: {
    tagline: (name) =>
      `${name} is a grounding talisman for steadier days, rooted routines, and a calmer sense of belonging.`,
    material:
      'Natural crystal beads selected for a warm, tactile finish, strung on a flexible stretch cord for everyday wear.',
    energy: [
      'The Root Chakra is the body’s quiet foundation: safety, steadiness, and the confidence to take the next practical step. This piece is designed as a small visual and tactile reminder to return to the present moment.',
      'Use it when life feels scattered, when a new season asks for courage, or whenever you want your daily ritual to begin with both feet on the ground.',
    ],
    benefits: [
      'Supports a grounded, settled state of mind.',
      'Creates a tactile reminder for steady routines and clear boundaries.',
      'Pairs naturally with morning intention-setting and evening wind-down rituals.',
    ],
    howToWear: [
      'Wear it on the wrist that feels most natural during work, travel, or moments that call for extra steadiness.',
    ],
    careRitual: [
      'Wipe gently with a soft cloth and place it under moonlight overnight when you want to refresh the ritual connection.',
    ],
    specs: ['Grounding ritual', 'Everyday stretch fit'],
  },
  sacral: {
    tagline: (name) =>
      `${name} carries a warm Sacral Chakra rhythm for creativity, emotional flow, and the pleasure of being fully present.`,
    material:
      'Natural crystal beads with a polished finish, arranged to feel fluid on the wrist and comfortable through movement.',
    energy: [
      'The Sacral Chakra is associated with feeling, creativity, intimacy, and the ability to let life move through you. This talisman is a gentle cue to make room for curiosity instead of forcing every answer.',
      'Reach for it when inspiration feels distant, emotions feel held back, or you want to reconnect with the simple pleasure of making, moving, and feeling.',
    ],
    benefits: [
      'Encourages creative momentum without pressure.',
      'Invites softer emotional awareness and healthy flow.',
      'Makes a beautiful companion for journaling, art, dance, and restorative pauses.',
    ],
    howToWear: [
      'Wear it during creative sessions or on days when you want to stay open to new ideas, conversations, and sensory details.',
    ],
    careRitual: [
      'Clean with a dry or lightly damp soft cloth, then leave it in a calm space overnight before beginning a new intention.',
    ],
    specs: ['Creative flow ritual', 'Comfortable everyday fit'],
  },
  solar: {
    tagline: (name) =>
      `${name} is a Solar Plexus talisman for clear decisions, quiet confidence, and the courage to take up your own space.`,
    material:
      'Natural crystal beads chosen for a luminous polish, finished as a lightweight bracelet that can move with an active day.',
    energy: [
      'The Solar Plexus Chakra speaks to agency, direction, and the steady warmth of self-trust. This piece turns that idea into a wearable pause before you act, speak, or choose.',
      'Keep it close when you are starting something new, setting a boundary, or practising the kind of confidence that feels calm rather than performative.',
    ],
    benefits: [
      'Supports a clearer sense of intention before action.',
      'Turns moments of hesitation into small, repeatable acts of self-trust.',
      'Complements planning, presentations, movement, and new beginnings.',
    ],
    howToWear: [
      'Wear it on busy or decision-heavy days and touch the beads once before taking your next step.',
    ],
    careRitual: [
      'Polish with a soft cloth and let it rest near a warm window or candlelight during a reset ritual; avoid prolonged heat and water.',
    ],
    specs: ['Confidence ritual', 'Lightweight stretch fit'],
  },
  heart: {
    tagline: (name) =>
      `${name} is a Heart Chakra companion for softer boundaries, self-acceptance, and love that begins at home.`,
    material:
      'Natural crystal beads with a smooth, gentle polish designed to sit close to the skin as a daily heart-centred reminder.',
    energy: [
      'The Heart Chakra is where care, compassion, grief, and connection meet. This talisman is not a promise to feel perfect; it is a gentle invitation to meet yourself with more room and less judgement.',
      'Wear it through relationship transitions, quiet self-care, or any day when you want tenderness and discernment to exist together.',
    ],
    benefits: [
      'Encourages self-kindness without losing healthy boundaries.',
      'Supports reflective moments around connection, trust, and repair.',
      'Pairs with gratitude practice, breathwork, and restorative evening rituals.',
    ],
    howToWear: [
      'Wear it close to the heart or on the wrist during conversations, journaling, and moments of intentional self-care.',
    ],
    careRitual: [
      'Wipe gently after wear and place it on a clean cloth under soft moonlight as you name one thing you are ready to receive.',
    ],
    specs: ['Heart-centred ritual', 'Soft polished finish'],
  },
  throat: {
    tagline: (name) =>
      `${name} is a Throat Chakra talisman for honest expression, thoughtful listening, and words that feel like your own.`,
    material:
      'Natural crystal beads or accents with a clear polished finish, assembled for a light, easy-to-layer everyday piece.',
    energy: [
      'The Throat Chakra is the space between inner knowing and spoken truth. This talisman offers a small pause to listen first, then choose language that is clear, kind, and yours.',
      'Keep it nearby before a difficult conversation, a creative presentation, or any moment when you want to communicate without abandoning yourself.',
    ],
    benefits: [
      'Encourages clear, measured communication.',
      'Creates a grounding cue before speaking, writing, or listening.',
      'Supports creative voice and honest self-expression.',
    ],
    howToWear: [
      'Wear it before meetings, writing sessions, or conversations where clarity and compassion both matter.',
    ],
    careRitual: [
      'Clean with a soft cloth and rest it beside a notebook; write one sentence of truth before putting it on again.',
    ],
    specs: ['Expression ritual', 'Easy layering profile'],
  },
  'third-eye': {
    tagline: (name) =>
      `${name} is a Third Eye talisman for intuition, inner clarity, and the quiet intelligence beneath the noise.`,
    material:
      'Natural crystal beads selected for depth and light play, polished to make the piece feel intentional in both stillness and motion.',
    energy: [
      'The Third Eye Chakra is a language for inner attention: the ability to notice patterns, trust discernment, and let insight arrive without rushing it. This piece is designed as a visual anchor for that pause.',
      'Use it during meditation, study, dream journaling, or any transition where you want to separate intuition from the volume of outside opinions.',
    ],
    benefits: [
      'Supports reflective attention and pattern recognition.',
      'Creates a calmer cue for meditation and focused study.',
      'Encourages discernment before reacting or deciding.',
    ],
    howToWear: [
      'Wear it during quiet work, meditation, or evening reflection; hold the beads for three slow breaths when you need to reset.',
    ],
    careRitual: [
      'Wipe with a soft cloth and leave it in a dim, peaceful place overnight after an especially full day.',
    ],
    specs: ['Intuition ritual', 'Polished depth and light'],
  },
  crown: {
    tagline: (name) =>
      `${name} is a Crown Chakra talisman for stillness, spiritual connection, and a wider field of possibility.`,
    material:
      'Natural crystal beads and accents with a light-catching polish, arranged as a quiet piece for ritual, reflection, and everyday wear.',
    energy: [
      'The Crown Chakra is less about having every answer and more about making space for meaning, wonder, and a perspective larger than the immediate moment. This talisman marks that space with something you can return to.',
      'Keep it close during meditation, moon rituals, creative reflection, or the first quiet minutes before a new chapter begins.',
    ],
    benefits: [
      'Encourages stillness and spacious attention.',
      'Supports personal rituals around reflection, gratitude, and intention.',
      'Makes a gentle companion for meditation, reading, and moonlit pauses.',
    ],
    howToWear: [
      'Wear it during meditation, reflective walks, or whenever you want a visible reminder to slow down and widen the view.',
    ],
    careRitual: [
      'Place it on a clean cloth under moonlight overnight, then hold it briefly and name the quality you want to carry forward.',
    ],
    specs: ['Stillness ritual', 'Light-catching natural stone'],
  },
}

function enrichedImportedProduct(product: (typeof importedProducts)[number]) {
  const content = CHAKRA_DETAIL_CONTENT[product.chakra]
  // This runs while the module is being created. Keep it independent of the
  // later display-name helpers so a product page can never block the whole app
  // from mounting during startup.
  const displayName = `${product.chakraName} crystal talisman`
  const isGenericTagline =
    !product.tagline.trim() ||
    product.tagline.trim().toLowerCase() === `${product.chakraName.toLowerCase()} crystal talisman.`

  return {
    desc: isGenericTagline ? content.tagline(displayName) : product.tagline,
    material: product.material.trim() || content.material,
    energy: product.energy.length ? product.energy : content.energy,
    benefits: product.benefits.length ? product.benefits : content.benefits,
    howToWear: product.howToWear.length ? product.howToWear : content.howToWear,
    careRitual: product.careRitual.length ? product.careRitual : content.careRitual,
    specs: product.specs.length ? product.specs : content.specs,
  }
}

const IMPORTED_DETAILS: DetailData[] = ACTIVE_IMPORTED_PRODUCTS.map((product) => {
  const content = enrichedImportedProduct(product)
  const price = adjustedProductPrice(product.price)

  return {
    id: product.id,
    eyebrow: product.chakraName,
    title: product.name,
    desc: content.desc,
    color: product.color,
    image: product.image,
    images: product.images,
    specs: [
      product.chakraName,
      ...content.specs.slice(0, 2),
      `$${price}`,
    ],
    body: [
      `Material — ${content.material}`,
      ...content.energy,
      `Benefits — ${content.benefits.join(' ')}`,
      ...content.howToWear.map((item) => `How to wear — ${item}`),
      ...content.careRitual.map((item) => `Care & ritual — ${item}`),
    ],
  }
})

const IMPORTED_TILES: Tile[] = ACTIVE_IMPORTED_PRODUCTS.map((product) => ({
  id: product.id,
  title: product.name,
  desc: product.tagline,
  color: product.color,
  image: product.image,
  eyebrow: product.chakraName,
  target: `/detail/${product.id}`,
}))

const CHAKRA_NAV_TILES: Tile[] = CHAKRA_COLLECTIONS.map((chakra) => {
  const products = ACTIVE_IMPORTED_PRODUCTS.filter((product) => product.chakra === chakra.id)
  const featured = products[0]

  return {
    id: `chakra-${chakra.id}`,
    title: chakra.title,
    desc: `${chakra.desc} ${products.length} talismans await.`,
    color: featured?.color ?? '#ece7fb',
    image: featured?.image,
    eyebrow: chakra.eyebrow,
    target: `/series/chakra-${chakra.id}`,
  }
})

const IMPORTED_PRODUCT_SERIES_BY_ID = new Map(
  ACTIVE_IMPORTED_PRODUCTS.map((product) => [product.id, `chakra-${product.chakra}`]),
)

function guideToTile(guide: ImportedSeriesGuide): Tile {
  return {
    id: guide.id,
    title: guide.title,
    desc: guide.excerpt,
    color: guide.color,
    image: guide.image,
    eyebrow: guide.eyebrow,
    target: `/guide/${guide.id}`,
  }
}

function guideTilesFor(series: GuideSeries): Tile[] {
  return importedSeriesGuides
    .filter((guide) => guide.series === series)
    .map(guideToTile)
}

const DETAILS: DetailData[] = [
  ...PRODUCTS.filter((product) => !REMOVED_ZODIAC_IDS.has(product.id)),
  ...ZODIAC_DETAILS.filter((detail) => !REMOVED_ZODIAC_IDS.has(detail.id)),
  ...IMPORTED_DETAILS,
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

const PRODUCT_TILES: Tile[] = [
  ...PRODUCTS.filter((product) => !REMOVED_ZODIAC_IDS.has(product.id)).map(
    (product) => ({
      id: product.id,
      title: product.title.replace(' · ', '\n'),
      desc: product.desc,
      color: product.color,
      image: product.image,
      eyebrow: product.eyebrow,
      target: `/detail/${product.id}`,
    }),
  ),
  ...IMPORTED_TILES,
]

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

const CHAKRA_TILES: Tile[] = CHAKRA_NAV_TILES

const CHAKRA_SERIES: SeriesPageData[] = CHAKRA_COLLECTIONS.map((chakra) => {
  const products = IMPORTED_TILES.filter((product) => product.id.startsWith(`${chakra.id}-`))
  const featured = products[0]

  return {
    id: `chakra-${chakra.id}`,
    eyebrow: chakra.eyebrow,
    title: chakra.title.replace(/^[A-Z ]+\n/, ''),
    desc: `${chakra.desc} Explore ${products.length} pieces curated for this energy centre.`,
    color: featured?.color ?? '#ece7fb',
    tiles: products,
  }
})

const MAIN_PROJECT_TILES: Tile[] = [
  {
    id: 'worlds',
    title: 'WORLDS\nCrystal Journey',
     desc: 'Enter the full energy universe through chakras, moon phases, and crystal talismans.',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    eyebrow: 'Worlds',
    target: '/series/worlds',
  },
  {
    id: 'chakra',
    title: 'CHAKRAS\nChakra Healing',
     desc: 'Seven energy centres, from root to crown.',
    color: '#dcedc2',
    image: CARD_IMAGES[1],
    eyebrow: 'Chakras',
    target: '/series/chakra',
  },
  {
    id: 'rituals',
    title: 'RITUALS\nLunar Rituals',
     desc: 'Set intentions at the new moon; cleanse and charge at the full moon.',
    color: '#c3e3f4',
    image: CARD_IMAGES[2],
    eyebrow: 'Rituals',
    target: '/series/rituals',
  },
  {
    id: 'crystals',
    title: 'CRYSTALS\nCrystal Talismans',
     desc: 'Browse every crystal piece and its energy page.',
    color: '#f3cdd6',
    image: CARD_IMAGES[1],
    eyebrow: 'Crystals',
    target: '/series/crystals',
  },
  {
    id: 'connect',
    title: 'CONNECT\nBegin the Connection',
     desc: 'Find your present frequency through the quiz, guides, and talismans.',
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
    title: 'Crystal Journey',
     desc: 'Enter through chakras, moon phases, and crystal talismans to find your present resonance.',
    color: '#f3cdd6',
    tiles: [
      {
        id: 'chakra',
        title: 'Chakra Healing',
         desc: 'A complete path through seven energy centres',
        color: '#dcedc2',
        image: CARD_IMAGES[1],
        target: '/series/chakra',
      },
      {
        id: 'lunar',
        title: 'Lunar Rituals',
         desc: 'New moon, full moon, and everyday cleansing',
        color: '#c3e3f4',
        image: CARD_IMAGES[2],
        target: '/series/lunar',
      },
      ...guideTilesFor('worlds'),
    ],
  },
  {
    id: 'collections',
    eyebrow: 'Project Portals',
    title: 'Project Portals',
     desc: 'Five portals: journey, chakras, rituals, crystals, and connection.',
    color: '#f0e4c0',
    tiles: MAIN_PROJECT_TILES,
  },
  {
    id: 'rituals',
    eyebrow: 'Rituals',
    title: 'Lunar Rituals',
     desc: 'Set intentions at the new moon and cleanse your crystals at the full moon.',
    color: '#c3e3f4',
    tiles: [
      ...PRODUCT_TILES.filter((tile) =>
        ['new-moon-set', 'full-moon-necklace'].includes(tile.id),
      ),
      {
        id: 'full-moon-ritual',
        title: 'Full Moon\nRitual Guide',
         desc: 'An eight-step crystal awakening ritual',
        color: '#dcedc2',
        image: CARD_IMAGES[2],
        target: '/detail/full-moon-ritual',
      },
      ...guideTilesFor('rituals'),
    ],
  },
  {
    id: 'zodiac',
    eyebrow: 'Zodiac',
    title: 'Zodiac Guardians',
     desc: 'Call in a crystal guardian aligned with the language of your chart.',
    color: '#dcd2f2',
    tiles: ZODIAC_TILES,
  },
  {
    id: 'chakra',
    eyebrow: 'Chakras',
    title: 'Chakra Healing Collection',
     desc: 'A complete seven-chakra path, with every crystal aligned to an energy centre.',
    color: '#dcedc2',
    tiles: [...CHAKRA_TILES, ...guideTilesFor('chakra')],
  },
  ...CHAKRA_SERIES,
  {
    id: 'lunar',
    eyebrow: 'Lunar',
    title: 'Lunar Ritual Collection',
     desc: 'From new moon to full moon, each crystal is attuned to a lunar moment.',
    color: '#c3e3f4',
    tiles: PRODUCT_TILES.filter((tile) =>
      ['new-moon-set', 'full-moon-necklace'].includes(tile.id),
    ),
  },
  {
    id: 'crystals',
    eyebrow: 'Crystals',
    title: 'All Crystal Talismans',
     desc: 'Browse every crystal piece and enter its individual energy page.',
    color: '#f3cdd6',
    tiles: [...guideTilesFor('crystals'), ...PRODUCT_TILES],
  },
  {
    id: 'connect',
    eyebrow: 'Connect',
    title: 'Begin the Connection',
     desc: 'Start with the quiz or crystals to find your path.',
    color: '#ece7fb',
    tiles: [
      {
        id: 'chakra-test',
        title: 'Seven Chakras\nQuiz',
         desc: 'Discover which energy centre needs balance',
        color: '#dcedc2',
        image: CARD_IMAGES[1],
        target: '/detail/chakra-test',
      },
      {
        id: 'crystals',
        title: 'Crystal Talismans\nBrowse all',
         desc: 'Browse every crystal talisman',
        color: '#f3cdd6',
        image: CARD_IMAGES[2],
        target: '/series/crystals',
      },
      ...guideTilesFor('connect'),
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
    name: getEnglishTitle(detail.id, detail.title).replace(/\n/g, ' '),
    price: getDetailPrice(detail),
    quantity: 1,
    image: detail.image,
    color: detail.color,
    eyebrow: detail.eyebrow,
  }
}

function adminProductToTile(product: StoredAdminProduct): Tile {
  const collection = englishCollectionName(product.collection)
  const pricing = getSalePricing(`admin-${product.id}`, product.price)
  return {
    id: `admin-${product.id}`,
    title: englishProductName(product.name, collection, product.id).replace(' · ', '\n'),
    desc: `${collection} · ${product.stock} in stock · ${formatProductPrice(pricing.salePrice)}`,
    color: '#ece7fb',
    image: product.image,
    eyebrow: 'Admin Product',
    target: `/detail/admin-${product.id}`,
  }
}

function adminProductToDetail(product: StoredAdminProduct): DetailData {
  const collection = englishCollectionName(product.collection)
  return {
    id: `admin-${product.id}`,
    eyebrow: collection,
    title: englishProductName(product.name, collection, product.id),
    desc: `Published product · ${product.stock} in stock · ${formatProductPrice(product.price)}`,
    color: '#ece7fb',
    image: product.image,
    specs: [collection, `${product.stock} in stock`, formatProductPrice(product.price), 'Published'],
    body: [
      'This talisman was published from the brand admin console.',
      'Product availability and price are maintained by the Lunar Talisman operations team.',
    ],
  }
}

function englishCollectionName(value: string) {
  const collectionMap: Record<string, string> = {
    脉轮疗愈: 'Chakra Healing',
    月相仪式: 'Lunar Rituals',
    水晶护符: 'Crystal Talismans',
    星座守护: 'Zodiac Guardians',
  }
  return collectionMap[value] || (CJK_TEXT.test(value) ? 'Crystal Talismans' : value)
}

function formatProductPrice(value: number) {
  return `$${value.toLocaleString('en-US')}`
}

function adjustedProductPrice(value: number) {
  const price = Number(value)
  return Number.isFinite(price) && price < 100 ? price + 100 : price
}

function promotionSeed(id: string) {
  let hash = 2166136261
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function getSalePricing(id: string, value: number) {
  const originalPrice = Math.max(1, Math.round(adjustedProductPrice(value)))
  const seed = promotionSeed(id)
  const discountPercent =
    originalPrice > 200
      ? 20 + (seed % 11)
      : 6 + (seed % 10)
  const salePrice = Math.max(
    1,
    Math.round((originalPrice * (100 - discountPercent)) / 100),
  )
  return { originalPrice, salePrice, discountPercent }
}

function getDetailBasePrice(detail: DetailData) {
  const priceSpec = detail.specs.find((spec) => spec.startsWith('$'))
  if (priceSpec) {
    const parsed = Number(priceSpec.replace(/[^0-9.]/g, ''))
    if (Number.isFinite(parsed) && parsed > 0) return adjustedProductPrice(parsed)
  }

  const priceMap: Record<string, number> = {
    'scorpio-amethyst': 189,
    'heart-rose-quartz': 169,
    'solar-citrine': 179,
    'new-moon-set': 129,
    'root-garnet': 175,
    'full-moon-necklace': 149,
  }

  return adjustedProductPrice(priceMap[detail.id] ?? 189)
}

function getDetailPricing(detail: DetailData) {
  return getSalePricing(detail.id, getDetailBasePrice(detail))
}

function getDetailPrice(detail: DetailData) {
  return getDetailPricing(detail).salePrice
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
  if (tile.target.startsWith('/guide/')) return 'Read guide'
  return tile.target.startsWith('/detail/') ? 'View details' : 'Enter collection'
}

const ENGLISH_TITLE_BY_ID: Record<string, string> = {
  'scorpio-amethyst': 'Scorpio Guardian\nAmethyst Bracelet',
  'heart-rose-quartz': 'Heart Healing\nRose Quartz Bracelet',
  'solar-citrine': 'Solar Plexus\nCitrine Courage Bracelet',
  'new-moon-set': 'New Moon Ritual\nCleansing Set',
  'root-garnet': 'Root Chakra\nGarnet Grounding Bracelet',
  'full-moon-necklace': 'Full Moon Blessing\nMoonstone Necklace',
  'aries-carnelian': 'Aries Guardian\nCarnelian Bracelet',
  'taurus-rose-quartz': 'Taurus Guardian\nRose Quartz Bracelet',
  'gemini-aquamarine': 'Gemini Guardian\nAquamarine Necklace',
  'cancer-moonstone': 'Cancer Guardian\nMoonstone Bracelet',
  'leo-citrine': 'Leo Guardian\nCitrine Bracelet',
  'virgo-amazonite': 'Virgo Guardian\nAmazonite Bracelet',
  'libra-rose-quartz': 'Libra Guardian\nRose Quartz Bracelet',
  'sagittarius-lapis': 'Sagittarius Guardian\nLapis Necklace',
  'capricorn-garnet': 'Capricorn Guardian\nGarnet Bracelet',
  'aquarius-fluorite': 'Aquarius Guardian\nFluorite Bracelet',
  'pisces-amethyst': 'Pisces Guardian\nAmethyst Bracelet',
  'sacral-moonstone': 'Sacral Chakra\nMoonstone Bracelet',
  'throat-aquamarine': 'Throat Chakra\nAquamarine Necklace',
  'third-eye-amethyst': 'Third Eye Chakra\nAmethyst Bracelet',
  'crown-clear-quartz': 'Crown Chakra\nClear Quartz Bracelet',
  'full-moon-ritual': 'Full Moon\nRitual Guide',
  'chakra-test': 'Seven Chakras\nQuiz',
  lunar: 'Lunar Ritual Collection',
  collections: 'Crystal Collections',
  worlds: 'WORLDS\nCrystal Journey',
  chakra: 'CHAKRAS\nChakra Healing',
  rituals: 'RITUALS\nLunar Rituals',
  crystals: 'CRYSTALS\nCrystal Talismans',
  connect: 'CONNECT\nBegin the Connection',
}

const PRODUCT_NAME_TOKENS: Array<[string, string]> = [
  ['披星戴月', 'Starlit Blessing'],
  ['甜夏之恋', 'Sweet Summer Love'],
  ['薄荷夏日', 'Mint Summer'],
  ['紫气东来', 'Purple Dawn'],
  ['金水相生', 'Golden Water Harmony'],
  ['补水聚财', 'Water Wealth'],
  ['五行喜木', 'Wood Element Blessing'],
  ['多宝水晶', 'Treasure Crystal'],
  ['九紫离火', 'Nine Purple Fire'],
  ['红石榴石', 'Garnet'],
  ['红玉髓', 'Carnelian'],
  ['黄水晶', 'Citrine'],
  ['紫水晶', 'Amethyst'],
  ['玫瑰晶', 'Rose Quartz'],
  ['粉水晶', 'Rose Quartz'],
  ['粉晶', 'Rose Quartz'],
  ['月光石', 'Moonstone'],
  ['白水晶', 'Clear Quartz'],
  ['海蓝宝', 'Aquamarine'],
  ['黑曜石', 'Obsidian'],
  ['绿幽灵', 'Green Phantom Quartz'],
  ['草莓晶', 'Strawberry Quartz'],
  ['水草玛瑙', 'Moss Agate'],
  ['玛瑙', 'Agate'],
  ['玉髓', 'Chalcedony'],
  ['虎眼', "Tiger's Eye"],
  ['白月光', 'White Moonstone'],
  ['星光', 'Starlight'],
  ['星星', 'Star'],
  ['葫芦', 'Gourd'],
  ['吊坠', 'Pendant'],
  ['平安扣', 'Peace Coin'],
  ['貔貅', 'Pixiu'],
  ['补木', 'Wood Element'],
  ['聚财', 'Wealth'],
  ['幸福', 'Happiness'],
  ['好运', 'Good Fortune'],
  ['守护', 'Guardian'],
  ['疗愈', 'Healing'],
  ['能量', 'Energy'],
  ['天然', 'Natural'],
  ['手串', 'Bracelet'],
  ['手链', 'Bracelet'],
  ['项链', 'Necklace'],
]
const CJK_TEXT = /[\u3400-\u9fff]/

function englishProductName(name: string, chakraName = 'Crystal', id = '') {
  if (!CJK_TEXT.test(name)) return name

  let translated = name
  for (const [source, target] of PRODUCT_NAME_TOKENS) {
    translated = translated.replaceAll(source, ` ${target} `)
  }
  translated = translated
    .replace(/[【】「」《》（）()]/g, ' ')
    .replace(/[\u3400-\u9fff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const code = id
    .split('-')
    .slice(-2)
    .join(' ')
    .replace(/[^A-Za-z0-9. ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const base = translated || `${chakraName} Crystal Talisman`
  return code && !/\d/.test(base)
    ? `${base} · ${code}`
    : base
}

function getEnglishTitle(id: string, title: string) {
  if (ENGLISH_TITLE_BY_ID[id]) return ENGLISH_TITLE_BY_ID[id]
  const imported = ACTIVE_IMPORTED_PRODUCTS.find((product) => product.id === id)
  if (imported) return englishProductName(imported.name, imported.chakraName, imported.id)
  if (id.startsWith('admin-')) {
    const adminProduct = getPublishedAdminProducts().find(
      (product) => `admin-${product.id}` === id,
    )
    if (adminProduct) return englishProductName(adminProduct.name, adminProduct.collection, id)
  }
  return CJK_TEXT.test(title) ? englishProductName(title, 'Crystal', id) : title
}

function getTileSpecs(tile: Tile) {
  const detail = getTileDetail(tile)
  if (!detail) return []
  return detail.specs.slice(0, 3)
}

function getSeriesIdForDetail(detailId: string) {
  const importedSeriesId = IMPORTED_PRODUCT_SERIES_BY_ID.get(detailId)
  if (importedSeriesId) return importedSeriesId
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
  const chakra = CHAKRA_COLLECTIONS.find((item) => `chakra-${item.id}` === id)
  if (chakra) return `${chakra.eyebrow} talismans`
  if (id === 'crystals') return 'All talismans'
  if (id === 'chakra') return 'Chakra talismans'
  if (id === 'lunar' || id === 'rituals') return 'Lunar ritual pieces'
  if (id === 'connect') return 'Connection paths'
  if (id === 'worlds') return 'Explore the paths'
  return 'Collection pieces'
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
  const previewTiles = tiles.slice(0, 3)

  return (
    <>
      <section
        style={{
          marginTop: 30,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 28,
          alignItems: 'end',
        }}
        className="max-[760px]:!grid-cols-1"
      >
        <div
          style={{
            maxWidth: 780,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.78)',
              padding: '9px 14px',
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: series.color,
                boxShadow: `0 0 18px ${series.color}`,
              }}
            />
            {series.eyebrow} Collection
          </div>
          <h1
            style={{
              margin: '20px 0 0',
              fontFamily: "'Lobster', cursive",
              fontSize: 'clamp(58px, 8vw, 116px)',
              lineHeight: 0.86,
              color: '#fff',
              whiteSpace: 'pre-line',
              textShadow: '0 14px 42px rgba(40, 21, 68, 0.34)',
            }}
          >
            {series.title}
          </h1>
          <p
            style={{
              margin: '22px 0 0',
              maxWidth: 660,
              fontSize: 'clamp(16px, 1.6vw, 19px)',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.72)',
            }}
          >
            {series.desc}
          </p>
        </div>
        <div
          style={{
            minWidth: 220,
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 28,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08))',
            padding: 22,
            color: '#fff',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            boxShadow: '0 20px 70px rgba(38,20,55,0.16)',
          }}
        >
          <p
            style={{
              margin: 0,
              color: 'rgba(255,255,255,0.58)',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Available Pieces
          </p>
          <div
            style={{
              marginTop: 8,
              fontFamily: "'Viaoda Libre', serif",
              fontSize: 56,
              lineHeight: 0.9,
            }}
          >
            {tiles.length}
          </div>
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {previewTiles.map((tile) => (
              <span
                key={tile.id}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: tile.color,
                  border: '1px solid rgba(255,255,255,0.48)',
                  boxShadow: `0 0 14px ${tile.color}`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {featured ? (
        <div
          style={{
            marginTop: 38,
            borderRadius: 40,
            border: '1px solid rgba(255,255,255,0.3)',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.82), rgba(236,231,251,0.64))',
            boxShadow: '0 30px 90px rgba(38,20,55,0.2)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 0.92fr) minmax(0, 1.08fr)',
            color: '#3a2530',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className="max-[860px]:!grid-cols-1"
        >
          <button
            type="button"
            onClick={() => navigate(featured.target)}
            style={{
              minHeight: 430,
              border: 0,
              padding: 0,
              position: 'relative',
              backgroundColor: featured.color,
              backgroundImage: featured.image ? `url(${featured.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(31,18,43,0.22))',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                border: '1px solid rgba(255,255,255,0.34)',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '9px 13px',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(12px)',
              }}
            >
              Featured
            </div>
          </button>

          <div
            style={{
              padding: 'clamp(28px, 4vw, 50px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                color: 'rgba(58,37,48,0.48)',
                fontSize: 12,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              主推护符
            </p>
            <h2
              style={{
                margin: '14px 0 0',
                fontFamily: "'Lobster', cursive",
                fontSize: 'clamp(38px, 5vw, 68px)',
                lineHeight: 0.92,
                whiteSpace: 'pre-line',
              }}
            >
              {getEnglishTitle(featured.id, featured.title)}
            </h2>
            <p
              style={{
                margin: '20px 0 0',
                maxWidth: 560,
                color: 'rgba(58,37,48,0.66)',
                fontSize: 16,
                lineHeight: 1.78,
              }}
            >
              {featured.desc}
            </p>
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              {(featuredDetail ? featuredDetail.specs.slice(0, 3) : [series.eyebrow, 'Crystal', 'Ritual']).map(
                (spec) => (
                  <span
                    key={spec}
                    style={{
                      border: '1px solid rgba(58,37,48,0.12)',
                      borderRadius: 999,
                      padding: '9px 13px',
                      background: 'rgba(255,255,255,0.42)',
                      color: 'rgba(58,37,48,0.68)',
                      fontSize: 12,
                    }}
                  >
                    {spec}
                  </span>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate(featured.target)}
              style={{
                marginTop: 30,
                alignSelf: 'flex-start',
                border: '1px solid rgba(58,37,48,0.14)',
                borderRadius: 999,
                background: 'rgba(58,37,48,0.88)',
                color: '#fff',
                padding: '14px 20px',
                fontSize: 13,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 16px 42px rgba(58,37,48,0.18)',
              }}
            >
              {featuredDetail
                ? `${formatProductPrice(getDetailPrice(featuredDetail))} · View details`
                : getTileAction(featured)} →
            </button>
          </div>
        </div>
      ) : null}
    </>
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
    <section style={{ marginTop: 54 }}>
      <div
        style={{
          marginBottom: 22,
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-between',
          gap: 18,
        }}
        className="max-[720px]:!items-start max-[720px]:!flex-col"
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.54)',
            }}
          >
            {subtitle}
          </p>
          <h2
            style={{
              margin: '10px 0 0',
              fontFamily: "'Lobster', cursive",
              fontSize: 'clamp(34px, 4.2vw, 60px)',
              lineHeight: 1,
              color: '#fff',
            }}
          >
            {title}
          </h2>
        </div>
        <p
          style={{
            margin: 0,
            maxWidth: 360,
            color: 'rgba(255,255,255,0.58)',
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          每一张卡片都可以进入对应单页，查看材质、仪式说明与订单信息。
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 22,
          alignItems: 'stretch',
        }}
      >
        {tiles.map((tile) => {
          const detail = getTileDetail(tile)
          const pricing = detail ? getDetailPricing(detail) : null
          const action = getTileAction(tile)
          const specs = getTileSpecs(tile)
          const isProductImage =
            tile.target.startsWith('/detail/') || tile.id.startsWith('chakra-')

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => navigate(tile.target)}
              style={{
                border: '1px solid rgba(255,255,255,0.28)',
                borderRadius: 30,
                overflow: 'hidden',
                padding: 0,
                textAlign: 'left',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.62), rgba(255,255,255,0.44))',
                color: '#3a2530',
                boxShadow: '0 24px 72px rgba(60,33,80,0.13)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                cursor: 'pointer',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: isProductImage ? '4 / 3' : '16 / 11',
                  backgroundColor: isProductImage ? '#fff' : tile.color,
                  backgroundImage: tile.image ? `url(${tile.image})` : undefined,
                  backgroundSize: isProductImage ? 'contain' : 'cover',
                  backgroundRepeat: 'no-repeat',
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
                {pricing ? (
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
                    −{pricing.discountPercent}% · {formatProductPrice(pricing.salePrice)}
                  </span>
                ) : null}
              </div>

              <div
                style={{
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "'Lobster', cursive",
                    fontSize: 24,
                    lineHeight: 1.08,
                    whiteSpace: 'pre-line',
                    color: '#3a2530',
                  }}
                >
                  {getEnglishTitle(tile.id, tile.title)}
                </h3>
                <p
                  style={{
                    margin: '12px 0 0',
                    color: 'rgba(58,37,48,0.64)',
                    lineHeight: 1.65,
                    fontSize: 15,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
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
                    {specs.slice(0, 2).map((spec) => (
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
                    marginTop: 'auto',
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

  if (page === 'series' && id) {
    return SERIES.some((series) => series.id === id) ? { page: 'series', id } : { page: 'notFound' }
  }
  if (page === 'detail' && id) {
    const isPublishedDetail =
      !REMOVED_IMPORTED_PRODUCT_IDS.has(id) &&
      !REMOVED_ZODIAC_IDS.has(id) &&
      DETAILS.some((detail) => detail.id === id)
    const isPublishedAdminDetail =
      id.startsWith('admin-') &&
      getPublishedAdminProducts().some((product) => `admin-${product.id}` === id)
    return isPublishedDetail || isPublishedAdminDetail
      ? { page: 'detail', id }
      : { page: 'notFound' }
  }
  if (page === 'guide' && id) {
    return importedSeriesGuides.some((guide) => guide.id === id)
      ? { page: 'guide', id }
      : { page: 'notFound' }
  }
  if (page === 'cart') return { page: 'cart' }
  if (page === 'track') return { page: 'track' }
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

  return page ? { page: 'notFound' } : { page: 'home' }
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

  useEffect(() => {
    let raf = 0
    let latest = { x: 0, y: 0 }

    const onMouseMove = (event: MouseEvent) => {
      latest = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      }
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        setMouse(latest)
      })
    }

    window.addEventListener('mousemove', onMouseMove)

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
  visible = true,
}: {
  navigate: NavigateFn
  cartCount?: number
  onOpenCart?: () => void
  visible?: boolean
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
      aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
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
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        inset: '0 0 auto',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-22px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 360ms ease, transform 520ms cubic-bezier(0.16, 1, 0.3, 1)',
        background:
          'linear-gradient(180deg, rgba(67,52,104,0.66), rgba(67,52,104,0.36))',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 30px rgba(35,23,63,0.12)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
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
        fontFamily: "'Lobster', cursive",
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
        Lunar{' '}
        <span
          style={{
            color: desktop ? 'rgba(255,220,180,0.7)' : '#6b2e0e',
            fontSize: '0.8em',
          }}
        >
          ·
        </span>{' '}
        <em style={{ fontStyle: 'normal' }}>Talisman</em>
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
        Moonlit Rituals
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
      Guided by moonlight, every crystal carries a seven-chakra frequency.
      Choose your talisman and begin within.
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
            aria-label={`Jump to experience section ${dot + 1}`}
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
          aria-label="Scroll down to enter the seven-chakra crystal universe"
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
          fontFamily: "'Lobster', cursive",
          fontSize: 'clamp(28px, 8vw, 78px)',
          color: '#fff',
          letterSpacing: '0.03em',
          lineHeight: 1.05,
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
        }}
      >
        The Seven Chakra Crystal Universe
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
                  fontFamily: "'Lobster', cursive",
                  fontSize: isMobile ? 22 : 30,
                  lineHeight: 1,
                  color: '#3a2530',
                }}
              >
                {getEnglishTitle(card.id, card.title)}
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
  const chakraSeo = CHAKRA_SEO_META[id.replace(/^chakra-/, '')]
  const genericSeo = SERIES_SEO_META[id]
  const seriesTitle = chakraSeo?.title ?? genericSeo?.title ?? displaySeries.title.replace(/\n/g, ' ')
  const seriesDescription = chakraSeo?.description ?? genericSeo?.description ?? displaySeries.desc
  usePageMeta({
    title: `${seriesTitle} | Lunar Talisman`,
    description: seriesDescription,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: seriesTitle,
      description: seriesDescription,
      keywords: chakraSeo?.keywords ?? genericSeo?.keywords ?? ['crystal jewelry', 'crystal bracelet', 'healing crystals'],
      url: `${SITE_ORIGIN}/series/${id}/`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Lunar Talisman',
        url: SITE_ORIGIN,
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: displaySeries.tiles.slice(0, 50).map((tile, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tile.title.replace(/\n/g, ' '),
          url: `${SITE_ORIGIN}${tile.target}/`,
        })),
      },
    },
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
  const [activeImage, setActiveImage] = useState('')
  const adminDetail = getPublishedAdminProducts()
    .filter((product) => product.collection !== '星座守护')
    .map(adminProductToDetail)
    .find((item) => item.id === id)
  const detail =
    adminDetail ??
    DETAILS.find((item) => item.id === id && !REMOVED_ZODIAC_IDS.has(item.id)) ??
    DETAILS.find((item) => item.id === 'chakra-test')!
  const galleryImages = useMemo(
    () =>
      detail.images?.length
        ? detail.images
        : detail.image
          ? [detail.image]
          : [],
    [detail.image, detail.images],
  )
  const primaryGalleryImage = galleryImages[0] ?? ''
  const displayedImage = galleryImages.includes(activeImage)
    ? activeImage
    : primaryGalleryImage
  useEffect(() => {
    setActiveImage(primaryGalleryImage)
  }, [detail.id, primaryGalleryImage])
  const detailPricing = getDetailPricing(detail)
  const detailPrice = detailPricing.salePrice
  const detailSeriesId = getSeriesIdForDetail(detail.id)
  const productSeo = getProductSeoMeta(
    detail.id,
    getEnglishTitle(detail.id, detail.title),
  )
  usePageMeta({
    title: `${productSeo.title} | Lunar Talisman`,
    description: productSeo.description,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: getEnglishTitle(detail.id, detail.title).replace(/\n/g, ' '),
      description: productSeo.description,
      keywords: productSeo.keywords,
      url: `${SITE_ORIGIN}/detail/${detail.id}/`,
      image: galleryImages
        .slice(0, 8)
        .map((image) => (image.startsWith('http') ? image : `${SITE_ORIGIN}${image}`)),
      brand: {
        '@type': 'Brand',
        name: 'Lunar Talisman',
      },
      category: detail.eyebrow,
      offers: {
        '@type': 'Offer',
        url: `${SITE_ORIGIN}/detail/${detail.id}/`,
        priceCurrency: 'USD',
        price: detailPrice,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
      isRelatedTo: {
        '@type': 'CollectionPage',
        name: `${detailSeriesId} crystal collection`,
        url: `${SITE_ORIGIN}/series/${detailSeriesId}/`,
      },
    },
  })
  const relatedTiles = (
    SERIES.find((item) => item.id === detailSeriesId)?.tiles ?? PRODUCT_TILES
  )
    .filter((tile) => tile.id !== detail.id && !REMOVED_ZODIAC_IDS.has(tile.id))
    .slice(0, 4)
  const handleAddToCart = () => {
    addToCart(detailToCartLine(detail))
    trackEvent('add_to_cart', { value: detailPrice })
    setCartNotice('Added to cart. Continue exploring or head to checkout to add shipping details and an order note.')
  }

  return (
    <AtmosphericShell navigate={navigate} cartCount={cartCount} onOpenCart={onOpenCart}>
      <article
        style={{
          width: 'min(1220px, calc(100% - 32px))',
          margin: '0 auto',
          padding: '88px 0 80px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.22fr) minmax(320px, 0.78fr)',
          gap: 24,
          alignItems: 'start',
        }}
        className="max-[900px]:!w-[calc(100%-20px)] max-[900px]:!grid-cols-1 max-[900px]:!pt-[88px]"
      >
        <section
          style={{
            gridColumn: '2',
            gridRow: '1',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 22,
            padding: 'clamp(22px, 3vw, 32px)',
            borderRadius: 30,
            border: '1px solid rgba(255,255,255,0.22)',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.78), rgba(244,233,255,0.52))',
            boxShadow: '0 24px 68px rgba(55,27,66,0.12)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
          className="max-[900px]:!col-auto max-[900px]:!row-auto"
        >
          <div style={{ minWidth: 0 }}>
            <button
              type="button"
              onClick={() => navigate('/series/' + detailSeriesId)}
              style={{
                border: '1px solid rgba(58,37,48,0.16)',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.72)',
                color: '#3a2530',
                padding: '10px 15px',
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(10px)',
              }}
            >
              Back to collection
            </button>

            <div
              style={{
                marginTop: 16,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: 'rgba(58,37,48,0.08)',
                  color: '#3a2530',
                  fontSize: 12,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff9f6e, #f0c36b)',
                    boxShadow: '0 0 12px rgba(240, 195, 107, 0.6)',
                  }}
                />
                {detail.eyebrow}
              </span>
              <span
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: 'rgba(58,37,48,0.06)',
                  color: 'rgba(58,37,48,0.68)',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Curated piece
              </span>
            </div>

            <h1
              style={{
                margin: '14px 0 0',
                fontFamily: "'Lobster', cursive",
                fontSize: 'clamp(38px, 3.7vw, 54px)',
                lineHeight: 1,
                color: '#3a2530',
                maxWidth: 520,
                overflowWrap: 'anywhere',
              }}
            >
              {getEnglishTitle(detail.id, detail.title)}
            </h1>

            <p
              style={{
                margin: '14px 0 0',
                fontSize: 16,
                lineHeight: 1.68,
                color: 'rgba(58,37,48,0.72)',
                maxWidth: 520,
              }}
            >
              {detail.desc}
            </p>
          </div>

          <div
            style={{
              minWidth: 0,
              alignSelf: 'stretch',
              padding: '22px',
              borderRadius: 26,
              background: 'linear-gradient(155deg, rgba(255,255,255,0.58), rgba(58,37,48,0.09))',
              border: '1px solid rgba(58,37,48,0.1)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.38)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(58,37,48,0.56)',
              }}
            >
              Price
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 34,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: '#3a2530',
              }}
            >
              {formatProductPrice(detailPrice)}
            </div>
            <div
              style={{
                marginTop: 7,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: 13,
                lineHeight: 1.2,
              }}
            >
              <span
                style={{
                  color: 'rgba(58,37,48,0.48)',
                  textDecoration: 'line-through',
                }}
              >
                {formatProductPrice(detailPricing.originalPrice)}
              </span>
              <span
                style={{
                  borderRadius: 999,
                  background: 'rgba(151, 87, 130, 0.12)',
                  color: '#8d416f',
                  padding: '5px 8px',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                }}
              >
                Save {detailPricing.discountPercent}%
              </span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: 'rgba(58,37,48,0.64)' }}>
              Secure checkout on cart page with shipping details and order note.
            </div>
            <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
              <button
                type="button"
                onClick={handleAddToCart}
                style={{
                  border: 0,
                  borderRadius: 999,
                  background: '#3a2530',
                  color: '#fff',
                  padding: '14px 18px',
                  fontSize: 13,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 14px 30px rgba(58,37,48,0.22)',
                }}
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddToCart()
                  onOpenCart?.()
                }}
                style={{
                  border: '1px solid rgba(58,37,48,0.14)',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.72)',
                  color: '#3a2530',
                  padding: '13px 18px',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                Checkout now
              </button>
            </div>
            <div
              style={{
                marginTop: 14,
                display: 'grid',
                gap: 8,
                fontSize: 12,
                color: 'rgba(58,37,48,0.68)',
                lineHeight: 1.4,
              }}
            >
              <div>• In stock and ready to ship</div>
              <div>• PayPal secure checkout enabled</div>
              <div>• Worldwide delivery supported</div>
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'contents',
          }}
        >
          <section
            style={{
              gridColumn: '1',
              gridRow: '1 / span 2',
              display: 'grid',
              gridTemplateRows: 'minmax(0, 1fr) auto',
              gap: 16,
              alignContent: 'start',
              height: '100%',
            }}
            className="max-[900px]:!col-auto max-[900px]:!row-auto"
          >
            <div
              style={{
                position: 'relative',
                minHeight: 'clamp(640px, 57vw, 760px)',
                borderRadius: 30,
                border: '1px solid rgba(255,255,255,0.18)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.88), rgba(247,240,255,0.72))',
                boxShadow: '0 22px 68px rgba(0,0,0,0.30)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: displayedImage ? 'url(' + displayedImage + ')' : undefined,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(58,37,48,0.24), rgba(58,37,48,0) 28%)',
                }}
              />
              {detailPrice ? (
                <div
                  style={{
                    position: 'absolute',
                    right: 18,
                    top: 18,
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #8d416f, #5d385d)',
                    color: '#fff',
                    padding: '10px 14px',
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    boxShadow: '0 10px 22px rgba(96, 49, 85, 0.28)',
                  }}
                >
                  −{detailPricing.discountPercent}% off
                </div>
              ) : null}
            </div>

            {galleryImages.length > 1 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gridAutoRows: 'minmax(0, 1fr)',
                  gap: 10,
                  height: 'clamp(400px, 31vw, 500px)',
                  padding: 4,
                  borderRadius: 26,
                  background: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  alignItems: 'stretch',
                }}
                className="max-[640px]:!grid-cols-3 max-[640px]:!h-auto"
                aria-label="Product image gallery"
              >
                {galleryImages.map((image, index) => {
                  const isActive = image === displayedImage
                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      aria-label={'View product image ' + (index + 1)}
                      aria-pressed={isActive}
                      style={{
                        height: '100%',
                        minHeight: 0,
                        padding: 10,
                        borderRadius: 20,
                        overflow: 'hidden',
                        background: isActive ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.68)',
                        border: isActive
                          ? '2px solid rgba(58,37,48,0.72)'
                          : '1px solid rgba(255,255,255,0.56)',
                        boxShadow: isActive
                          ? '0 10px 24px rgba(58,37,48,0.18)'
                          : '0 8px 18px rgba(58,37,48,0.08)',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={image}
                        alt={getEnglishTitle(detail.id, detail.title).replace(/\n/g, ' ') + ' view ' + (index + 1)}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </section>

          <aside
            style={{
              gridColumn: '2',
              gridRow: '2',
              borderRadius: 30,
              background: detail.color,
              padding: 'clamp(22px, 3vw, 32px)',
              color: '#3a2530',
              boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
              alignSelf: 'stretch',
              position: 'sticky',
              top: 88,
              maxWidth: 'none',
            }}
            className="max-[900px]:!col-auto max-[900px]:!row-auto max-[900px]:!sticky max-[900px]:!top-0"
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(58,37,48,0.56)',
              }}
            >
              Craft notes
            </p>
            <div
              style={{
                marginTop: 14,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 10,
              }}
              className="max-[560px]:!grid-cols-1"
            >
              {detail.specs.filter((spec) => !spec.trim().startsWith('$')).map((spec) => (
                <div
                  key={spec}
                  style={{
                    border: '1px solid rgba(58,37,48,0.18)',
                    borderRadius: 18,
                    minHeight: 52,
                    padding: '11px 13px',
                    fontSize: 13,
                    lineHeight: 1.35,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(58,37,48,0.76)',
                    background: 'rgba(255,255,255,0.22)',
                  }}
                >
                  {spec}
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                borderTop: '1px solid rgba(58,37,48,0.12)',
                paddingTop: 18,
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>Designed to feel quiet</div>
                <div style={{ color: 'rgba(58,37,48,0.66)', fontSize: 13, lineHeight: 1.7 }}>
                  Refined enough to sit inside your day, present enough to feel intentional.
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: 'rgba(58,37,48,0.70)',
                }}
              >
                Chosen for its color, texture, and a calm presence that layers easily into everyday wear.
              </div>
              {cartNotice ? (
                <div
                  style={{
                    borderRadius: 22,
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.54)',
                    color: '#55744f',
                    fontSize: 13,
                    lineHeight: 1.5,
                    fontWeight: 800,
                  }}
                >
                  {cartNotice}
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        {detail.body.length ? (
          <section
            style={{
              gridColumn: '1 / -1',
              width: '100%',
              padding: 'clamp(26px, 3.6vw, 40px)',
              borderRadius: 34,
              border: '1px solid rgba(255,255,255,0.28)',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.76), rgba(238,231,251,0.58))',
              boxShadow: '0 24px 72px rgba(60,33,80,0.12)',
              color: '#3a2530',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(58,37,48,0.52)',
              }}
            >
              The ritual behind your talisman
            </p>
            <h2
              style={{
                margin: '12px 0 22px',
                fontFamily: "'Lobster', cursive",
                fontSize: 'clamp(28px, 3.6vw, 42px)',
                lineHeight: 1,
              }}
            >
              Made to be part of your everyday ritual
            </h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {detail.body.map((paragraph) => (
                <p
                  key={paragraph}
                  style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.8,
                    color: 'rgba(58,37,48,0.74)',
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        <div style={{ gridColumn: '1 / -1', marginTop: 6 }}>
          <SeriesListingGrid
            title="Keep exploring your resonance"
            subtitle={detail.eyebrow + ' · Related'}
            tiles={relatedTiles.length ? relatedTiles : PRODUCT_TILES.slice(0, 4)}
            navigate={navigate}
          />
        </div>
      </article>
    </AtmosphericShell>
  )
}

type GuideBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'quote'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; rows: string[][] }

function cleanGuideText(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\([^)]*\)/g, '$1')
    .trim()
}

function parseGuideMarkdown(markdown: string): GuideBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: GuideBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()
    if (!line || /^#\s/.test(line)) {
      index += 1
      continue
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/)
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length as 2 | 3,
        text: cleanGuideText(heading[2]),
      })
      index += 1
      continue
    }

    if (line.startsWith('>')) {
      const quoteLines: string[] = []
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'quote', text: cleanGuideText(quoteLines.join(' ')) })
      continue
    }

    if (line.startsWith('|')) {
      const rows: string[][] = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        const cells = lines[index]
          .split('|')
          .slice(1, -1)
          .map((cell) => cleanGuideText(cell))
        if (!cells.every((cell) => /^-+$/.test(cell))) rows.push(cells)
        index += 1
      }
      if (rows.length) blocks.push({ type: 'table', rows })
      continue
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/)
    const unordered = line.match(/^[-*]\s+(.+)$/)
    if (ordered || unordered) {
      const items: string[] = []
      const isOrdered = Boolean(ordered)
      while (index < lines.length) {
        const current = lines[index].trim()
        const match = isOrdered
          ? current.match(/^\d+\.\s+(.+)$/)
          : current.match(/^[-*]\s+(.+)$/)
        if (!match) break
        items.push(cleanGuideText(match[1]))
        index += 1
      }
      blocks.push({ type: 'list', ordered: isOrdered, items })
      continue
    }

    const paragraphLines: string[] = []
    while (index < lines.length) {
      const current = lines[index].trim()
      if (
        !current ||
        /^#{1,3}\s/.test(current) ||
        current.startsWith('>') ||
        current.startsWith('|') ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current)
      ) {
        break
      }
      paragraphLines.push(current)
      index += 1
    }
    if (paragraphLines.length) {
      blocks.push({ type: 'paragraph', text: cleanGuideText(paragraphLines.join(' ')) })
      continue
    }
    index += 1
  }

  return blocks
}

function GuideMarkdown({ markdown }: { markdown: string }) {
  const blocks = parseGuideMarkdown(markdown)

  return (
    <div data-no-auto-translate="true">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return block.level === 2 ? (
            <h2
              key={`${block.text}-${index}`}
              style={{
                margin: index === 0 ? 0 : '38px 0 0',
                color: '#3a2530',
                fontFamily: "'Lobster', cursive",
                fontSize: 'clamp(30px, 4vw, 46px)',
                lineHeight: 1,
              }}
            >
              {block.text}
            </h2>
          ) : (
            <h3
              key={`${block.text}-${index}`}
              style={{
                margin: '26px 0 0',
                color: '#3a2530',
                fontSize: 20,
                lineHeight: 1.35,
                fontWeight: 900,
              }}
            >
              {block.text}
            </h3>
          )
        }

        if (block.type === 'quote') {
          return (
            <blockquote
              key={`${block.text}-${index}`}
              style={{
                margin: '22px 0 0',
                borderLeft: '3px solid rgba(58,37,48,0.34)',
                padding: '6px 0 6px 18px',
                color: 'rgba(58,37,48,0.68)',
                fontSize: 18,
                fontStyle: 'italic',
                lineHeight: 1.7,
              }}
            >
              {block.text}
            </blockquote>
          )
        }

        if (block.type === 'list') {
          const List = block.ordered ? 'ol' : 'ul'
          return (
            <List
              key={`list-${index}`}
              style={{
                margin: '18px 0 0',
                paddingLeft: 24,
                color: 'rgba(58,37,48,0.78)',
                fontSize: 16,
                lineHeight: 1.85,
              }}
            >
              {block.items.map((item) => (
                <li key={item} style={{ marginBottom: 6 }}>
                  {item}
                </li>
              ))}
            </List>
          )
        }

        if (block.type === 'table') {
          return (
            <div
              key={`table-${index}`}
              style={{
                marginTop: 22,
                overflowX: 'auto',
                border: '1px solid rgba(58,37,48,0.14)',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.34)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={`${row.join('-')}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${cell}-${cellIndex}`}
                          style={{
                            padding: '12px 14px',
                            borderBottom:
                              rowIndex < block.rows.length - 1
                                ? '1px solid rgba(58,37,48,0.12)'
                                : 0,
                            color: 'rgba(58,37,48,0.76)',
                            fontSize: 14,
                            fontWeight: rowIndex === 0 ? 900 : 500,
                            lineHeight: 1.55,
                            verticalAlign: 'top',
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        return (
          <p
            key={`${block.text}-${index}`}
            style={{
              margin: '18px 0 0',
              color: 'rgba(58,37,48,0.78)',
              fontSize: 16,
              lineHeight: 1.88,
            }}
          >
            {block.text}
          </p>
        )
      })}
    </div>
  )
}

function GuidePage({
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
  const guide = importedSeriesGuides.find((item) => item.id === id) ?? importedSeriesGuides[0]
  void GuideMarkdown
  const relatedGuides = guideTilesFor(guide.series)
    .filter((tile) => tile.id !== guide.id)
    .slice(0, 3)
  const guideSeo = GUIDE_SEO_META[id]

  usePageMeta({
    title: `${guideSeo?.title ?? guide.title} | Lunar Talisman`,
    description: guideSeo?.description ?? guide.excerpt,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guideSeo?.title ?? guide.title,
      description: guideSeo?.description ?? guide.excerpt,
      keywords: guideSeo?.keywords ?? ['crystal guide', 'crystal meanings', 'crystal rituals'],
      url: `${SITE_ORIGIN}/guide/${guide.id}/`,
      image: guide.image.startsWith('http') ? guide.image : `${SITE_ORIGIN}${guide.image}`,
      author: {
        '@type': 'Organization',
        name: 'Lunar Talisman',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Lunar Talisman',
        url: SITE_ORIGIN,
      },
      isPartOf: {
        '@type': 'CollectionPage',
        name: `${guide.series} crystal guides`,
        url: `${SITE_ORIGIN}/series/${guide.series}/`,
      },
    },
  })

  return (
    <AtmosphericShell navigate={navigate} cartCount={cartCount} onOpenCart={onOpenCart}>
      <article
        style={{
          width: 'min(1120px, calc(100% - 40px))',
          margin: '0 auto',
          padding: '128px 0 96px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(`/series/${guide.series}`)}
          style={{
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.84)',
            padding: '10px 16px',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          ← Back to collection
        </button>

        <section
          style={{
            marginTop: 26,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 0.9fr) minmax(320px, 1.1fr)',
            gap: 32,
            alignItems: 'stretch',
          }}
          className="max-[900px]:!grid-cols-1"
        >
          <div
            style={{
              minHeight: 460,
              borderRadius: 38,
              border: '1px solid rgba(255,255,255,0.18)',
              backgroundImage: `url(${guide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.34)',
            }}
          />
          <div
            style={{
              borderRadius: 38,
              background: guide.color,
              padding: 'clamp(28px, 4vw, 48px)',
              color: '#3a2530',
              boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(58,37,48,0.56)',
              }}
            >
              {guide.eyebrow}
            </p>
            <h1
              style={{
                margin: '18px 0 0',
                fontFamily: "'Lobster', cursive",
                fontSize: 'clamp(46px, 6vw, 76px)',
                lineHeight: 0.96,
              }}
            >
              {guide.title}
            </h1>
            <p
              style={{
                margin: '22px 0 0',
                color: 'rgba(58,37,48,0.68)',
                fontSize: 18,
                lineHeight: 1.72,
              }}
            >
              {guide.excerpt}
            </p>
          </div>
        </section>

        {relatedGuides.length ? (
          <SeriesListingGrid
            title="Continue the journey"
            subtitle={`${guide.eyebrow} · Related guides`}
            tiles={relatedGuides}
            navigate={navigate}
          />
        ) : null}
      </article>
    </AtmosphericShell>
  )
}

const LEGAL_PAGES = {
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    desc: 'We collect only the information needed to fulfil orders, support customers, and improve the site.',
    sections: [
      {
        title: 'Information we collect',
        body: 'When you place an order, subscribe, or contact us, we may collect your name, email, delivery address, order details, and limited browsing data needed to keep the site safe and useful.',
      },
      {
        title: 'How we use it',
        body: 'We use this information for order fulfilment, delivery updates, customer support, fraud prevention, site security, and basic performance measurement.',
      },
      {
        title: 'Data protection',
        body: 'Order data is handled through protected server services. We do not intentionally expose customer addresses, phone numbers, or order notes in public pages.',
      },
    ],
  },
  terms: {
    eyebrow: 'Terms',
    title: 'Terms of Service',
    desc: 'By using Lunar Talisman, you agree to the practical terms that govern browsing, ordering, delivery, and support.',
    sections: [
      {
        title: 'Product information',
        body: 'Natural crystal jewellery can vary slightly in colour, pattern, and size. These differences are part of the character of a natural stone and are not manufacturing defects.',
      },
      {
        title: 'Wellness disclaimer',
        body: 'Chakra, crystal energy, and ritual content is offered for lifestyle and spiritual reflection. It is not medical, psychological, financial, or professional advice.',
      },
      {
        title: 'Order responsibility',
        body: 'Please check the product, quantity, and delivery details before submitting an order request. Contact us promptly if an address needs correcting.',
      },
    ],
  },
  shipping: {
    eyebrow: 'Shipping',
    title: 'Shipping Policy',
    desc: 'We prepare each talisman after the order is confirmed and keep the fulfilment status visible.',
    sections: [
      {
        title: 'Handling time',
        body: 'Standard pieces are usually prepared within 2–5 business days. Lunar ritual batches may be scheduled around a new moon or full moon date.',
      },
      {
        title: 'Tracking',
        body: 'Once a carrier accepts the parcel, the tracking number can be viewed from the Track Your Order page using the order number and checkout email.',
      },
      {
        title: 'International delivery',
        body: 'Delivery times, duties, and import requirements vary by destination. Any local taxes or customs charges are the responsibility of the recipient unless otherwise stated at checkout.',
      },
    ],
  },
  refund: {
    eyebrow: 'Refund',
    title: 'Refund & Returns',
    desc: 'We want every talisman to be chosen with care and to arrive in the condition promised.',
    sections: [
      {
        title: 'When to contact us',
        body: 'If an item arrives damaged, incorrect, or with a clear quality issue, contact us within 7 days of delivery with photos and your order number.',
      },
      {
        title: 'Exclusions',
        body: 'Worn items, items that cannot be resold, personalised ritual pieces, and preference-based complaints about natural stone variation are generally not eligible for return.',
      },
      {
        title: 'Resolution',
        body: 'Keep the original packaging, item photos, and order information. After review, we may arrange a replacement, exchange, or refund where appropriate.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Contact Us',
    desc: 'Questions about orders, collaborations, products, or lunar ritual batches can start here.',
    sections: [
      {
        title: 'Customer care',
        body: 'Email hello@lunartalisman.com for order, product, or delivery questions. Please include your order number when one exists.',
      },
      {
        title: 'Brand partnerships',
        body: 'Creators, boutiques, and spiritual spaces are welcome to share a short introduction and partnership idea by email.',
      },
      {
        title: 'Response time',
        body: 'We usually reply within 1–3 business days. Full moon periods and new product batches may take a little longer.',
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
            fontFamily: "'Lobster', cursive",
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
          {id === 'contact' || id === 'refund' ? <SupportRequestForm type={id} /> : null}
        </div>
      </section>
    </AtmosphericShell>
  )
}

function NotFoundPage({
  navigate,
  cartCount,
  onOpenCart,
}: {
  navigate: NavigateFn
  cartCount: number
  onOpenCart?: () => void
}) {
  usePageMeta({
    title: 'Page Not Found | Lunar Talisman',
    description:
      'The Lunar Talisman page you requested is no longer available. Explore our current crystal collections instead.',
    noindex: true,
  })

  return (
    <AtmosphericShell navigate={navigate} cartCount={cartCount} onOpenCart={onOpenCart}>
      <section
        style={{
          width: 'min(860px, calc(100% - 40px))',
          minHeight: '100vh',
          margin: '0 auto',
          padding: 'clamp(150px, 20vh, 220px) 0 96px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Page moved
        </p>
        <h1
          style={{
            maxWidth: 680,
            margin: '18px auto 0',
            fontFamily: "'Lobster', cursive",
            fontSize: 'clamp(58px, 10vw, 116px)',
            lineHeight: 0.92,
            color: '#fff',
            textShadow: '0 2px 24px rgba(0,0,0,0.45)',
          }}
        >
          This path has
          <br />
          dissolved.
        </h1>
        <p
          style={{
            maxWidth: 560,
            margin: '24px auto 0',
            fontSize: 'clamp(17px, 2vw, 20px)',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.76)',
          }}
        >
          The talisman or guide you requested is no longer available. Continue with the
          current crystal collections.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
            marginTop: 34,
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/series/crystals')}
            style={{
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.9)',
              color: '#3a2530',
              padding: '13px 20px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Explore talismans
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              padding: '13px 20px',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Return home
          </button>
        </div>
      </section>
    </AtmosphericShell>
  )
}

function SupportRequestForm({ type }: { type: 'contact' | 'refund' }) {
  const [form, setForm] = useState({ name: '', email: '', orderId: '', message: '' })
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setNotice('Please enter your name, email, and message.')
      return
    }
    setSending(true)
    try {
      const result = await submitSupportRequest({
        type: type === 'refund' ? 'refund' : 'contact',
        name: form.name,
        email: form.email,
        orderId: form.orderId,
        message: form.message,
      })
      setNotice(`Request received. Your reference is ${result.requestId}.`)
      setForm({ name: '', email: '', orderId: '', message: '' })
    } catch {
      setNotice('We could not send your request. Please try again shortly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        marginTop: 14,
        paddingTop: 26,
        borderTop: '1px solid rgba(58,37,48,0.12)',
        display: 'grid',
        gap: 12,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 22 }}>
        {type === 'refund' ? 'Start a return or refund request' : 'Send a request'}
      </h2>
      <div className="max-[640px]:!grid-cols-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Your name"
          style={formFieldStyle}
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="Email used for your order"
          style={formFieldStyle}
        />
      </div>
      <input
        value={form.orderId}
        onChange={(event) => setForm((current) => ({ ...current, orderId: event.target.value }))}
        placeholder="Order number (optional for general questions)"
        style={formFieldStyle}
      />
      <textarea
        rows={5}
        value={form.message}
        onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
        placeholder={type === 'refund' ? 'Tell us what arrived and include any relevant details.' : 'How can we help?'}
        style={{ ...formFieldStyle, resize: 'vertical', fontFamily: 'inherit' }}
      />
      <button
        type="submit"
        disabled={sending}
        style={{
          justifySelf: 'start',
          border: 0,
          borderRadius: 999,
          background: '#3a2530',
          color: '#fff',
          padding: '12px 18px',
          fontWeight: 900,
          cursor: sending ? 'wait' : 'pointer',
          opacity: sending ? 0.7 : 1,
        }}
      >
        {sending ? 'Sending…' : 'Send request'}
      </button>
      {notice ? (
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(58,37,48,0.66)' }}>{notice}</p>
      ) : null}
    </form>
  )
}

const TRACKING_STATUS_LABELS: Record<string, string> = {
  待支付: 'Awaiting payment',
  待发货: 'Order received',
  备货中: 'Preparing your order',
  已发货: 'Shipped',
  运输中: 'In transit',
  已签收: 'Delivered',
}

function trackingStatusLabel(status = '') {
  return TRACKING_STATUS_LABELS[status] || status || 'Order received'
}

function trackingTime(value = '') {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || 'Recently updated'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function carrierTrackingUrl(carrier: string, trackingNumber: string) {
  const number = encodeURIComponent(trackingNumber.trim())
  if (!number) return ''
  const normalizedCarrier = carrier.toLowerCase()
  if (normalizedCarrier.includes('ups')) return `https://www.ups.com/track?tracknum=${number}`
  if (normalizedCarrier.includes('usps')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${number}`
  }
  if (normalizedCarrier.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${number}`
  }
  if (normalizedCarrier.includes('dhl')) {
    return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${number}`
  }
  return `https://www.17track.net/en?nums=${number}`
}

function TrackOrderPage({
  navigate,
  cartCount,
  onOpenCart,
}: {
  navigate: NavigateFn
  cartCount: number
  onOpenCart?: () => void
}) {
  usePageMeta({
    title: 'Track Your Order | Lunar Talisman',
    description:
      'Track a Lunar Talisman order with the order number and email used at checkout.',
    noindex: true,
  })

  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<PublicTrackingOrder | null>(null)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    setOrder(null)
    if (!orderId.trim() || !email.trim()) {
      setNotice('Enter your order number and the email used at checkout.')
      return
    }

    setLoading(true)
    try {
      setOrder(await trackPublicOrder(orderId, email))
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.includes('order_not_found')) {
        setNotice('We could not match that order number and email. Please check both and try again.')
      } else if (message.includes('rate_limited')) {
        setNotice('Too many attempts. Please wait a few minutes before trying again.')
      } else {
        setNotice('Tracking is temporarily unavailable. Please try again shortly.')
      }
    } finally {
      setLoading(false)
    }
  }

  const events =
    order?.trackingEvents?.length
      ? [...order.trackingEvents].reverse()
      : order
        ? [
            {
              status: order.shippingStatus || '待发货',
              detail: 'Your order request has been received and is waiting for fulfilment.',
              at: order.createdAt,
            },
          ]
        : []
  const carrierUrl = order
    ? carrierTrackingUrl(order.trackingCarrier || '', order.trackingNumber || '')
    : ''
  const fieldStyle: CSSProperties = {
    width: '100%',
    border: '1px solid rgba(58,37,48,0.14)',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.84)',
    color: '#3a2530',
    padding: '14px 15px',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 15,
  }

  return (
    <AtmosphericShell navigate={navigate} cartCount={cartCount} onOpenCart={onOpenCart}>
      <section
        style={{
          width: 'min(1040px, calc(100% - 40px))',
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
            cursor: 'pointer',
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
          Order Tracking
        </p>
        <h1
          style={{
            margin: '14px 0 0',
            fontFamily: "'Lobster', cursive",
            fontSize: 'clamp(54px, 8vw, 108px)',
            lineHeight: 0.94,
            color: '#fff',
            textShadow: '0 2px 24px rgba(0,0,0,0.45)',
          }}
        >
          Follow your talisman
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
          Enter your order number and checkout email. Delivery details are only shown after both
          details match.
        </p>

        <div
          style={{
            borderRadius: 38,
            background: 'rgba(255,255,255,0.84)',
            padding: 'clamp(28px, 4vw, 46px)',
            color: '#3a2530',
            boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          }}
        >
          <form
            onSubmit={handleLookup}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto',
              alignItems: 'end',
              gap: 14,
            }}
            className="max-[760px]:!grid-cols-1"
          >
            <label style={{ display: 'grid', gap: 8 }}>
              <span
                style={{
                  color: 'rgba(58,37,48,0.58)',
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Order number
              </span>
              <input
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="LT-20260817-XXXXXXXX"
                autoComplete="off"
                style={fieldStyle}
              />
            </label>
            <label style={{ display: 'grid', gap: 8 }}>
              <span
                style={{
                  color: 'rgba(58,37,48,0.58)',
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Checkout email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={fieldStyle}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              style={{
                border: 0,
                borderRadius: 16,
                background: '#3a2530',
                color: '#fff',
                padding: '14px 20px',
                minHeight: 50,
                fontWeight: 900,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 14px 30px rgba(58,37,48,0.18)',
              }}
            >
              {loading ? 'Looking up…' : 'Track order'}
            </button>
          </form>

          {notice ? (
            <p
              role="status"
              style={{
                margin: '18px 0 0',
                borderRadius: 16,
                padding: '12px 14px',
                background: 'rgba(214,151,121,0.14)',
                color: '#76524a',
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              {notice}
            </p>
          ) : null}

          {order ? (
            <div style={{ marginTop: 30, display: 'grid', gap: 22 }}>
              <div
                style={{
                  borderRadius: 26,
                  padding: '22px 24px',
                  background:
                    'linear-gradient(135deg, rgba(231,218,255,0.78), rgba(255,245,234,0.76))',
                  border: '1px solid rgba(58,37,48,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 18,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: 'rgba(58,37,48,0.56)',
                      fontSize: 12,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {order.id}
                  </p>
                  <h2
                    style={{
                      margin: '8px 0 0',
                      fontFamily: "'Viaoda Libre', serif",
                      fontSize: 30,
                    }}
                  >
                    {trackingStatusLabel(order.shippingStatus)}
                  </h2>
                  <p style={{ margin: '8px 0 0', color: 'rgba(58,37,48,0.68)' }}>
                    {order.product}
                  </p>
                </div>
                <div style={{ minWidth: 190 }}>
                  <p
                    style={{
                      margin: 0,
                      color: 'rgba(58,37,48,0.56)',
                      fontSize: 12,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Delivery
                  </p>
                  <p style={{ margin: '8px 0 0', fontWeight: 900 }}>
                    {order.shippingMethod === 'express' ? 'Express shipping' : 'Standard shipping'}
                  </p>
                  <p style={{ margin: '6px 0 0', color: 'rgba(58,37,48,0.68)', fontSize: 14 }}>
                    {[order.shippingCountry, order.shippingRegion]
                      .filter(Boolean)
                      .join(' · ') || 'Delivery destination pending'}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.1fr) minmax(260px, 0.9fr)',
                  gap: 22,
                }}
                className="max-[760px]:!grid-cols-1"
              >
                <section
                  style={{
                    borderRadius: 26,
                    padding: 24,
                    background: 'rgba(255,255,255,0.58)',
                    border: '1px solid rgba(58,37,48,0.1)',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 20 }}>Delivery timeline</h3>
                  <div style={{ marginTop: 20, display: 'grid', gap: 0 }}>
                    {events.map((event, index) => (
                      <div
                        key={`${event.at}-${event.status}-${index}`}
                        style={{
                          position: 'relative',
                          display: 'grid',
                          gridTemplateColumns: '18px minmax(0, 1fr)',
                          gap: 12,
                          paddingBottom: index === events.length - 1 ? 0 : 22,
                        }}
                      >
                        <span
                          style={{
                            position: 'relative',
                            width: 14,
                            height: 14,
                            marginTop: 4,
                            borderRadius: 999,
                            background: index === 0 ? '#806eb4' : '#d5c9e7',
                            boxShadow: index === 0 ? '0 0 0 5px rgba(128,110,180,0.13)' : 'none',
                          }}
                        >
                          {index !== events.length - 1 ? (
                            <span
                              style={{
                                position: 'absolute',
                                left: 6,
                                top: 14,
                                width: 2,
                                height: 25,
                                background: 'rgba(58,37,48,0.12)',
                              }}
                            />
                          ) : null}
                        </span>
                        <div>
                          <strong>{trackingStatusLabel(event.status)}</strong>
                          <p
                            style={{
                              margin: '5px 0 0',
                              color: 'rgba(58,37,48,0.68)',
                              fontSize: 14,
                              lineHeight: 1.55,
                            }}
                          >
                            {event.detail}
                          </p>
                          <p
                            style={{
                              margin: '7px 0 0',
                              color: 'rgba(58,37,48,0.46)',
                              fontSize: 12,
                            }}
                          >
                            {trackingTime(event.at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <aside
                  style={{
                    borderRadius: 26,
                    padding: 24,
                    background: 'rgba(255,249,241,0.74)',
                    border: '1px solid rgba(58,37,48,0.1)',
                    alignSelf: 'start',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: 'rgba(58,37,48,0.56)',
                      fontSize: 12,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Carrier tracking
                  </p>
                  {order.trackingNumber ? (
                    <>
                      <h3 style={{ margin: '10px 0 0', fontSize: 20 }}>
                        {order.trackingCarrier || 'Shipment carrier'}
                      </h3>
                      <code
                        style={{
                          display: 'block',
                          marginTop: 12,
                          overflowWrap: 'anywhere',
                          color: 'rgba(58,37,48,0.72)',
                          fontSize: 14,
                        }}
                      >
                        {order.trackingNumber}
                      </code>
                      <a
                        href={carrierUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          marginTop: 18,
                          borderRadius: 999,
                          background: '#3a2530',
                          color: '#fff',
                          padding: '12px 16px',
                          fontWeight: 900,
                          textDecoration: 'none',
                        }}
                      >
                        Open carrier tracking ↗
                      </a>
                    </>
                  ) : (
                    <p
                      style={{
                        margin: '12px 0 0',
                        color: 'rgba(58,37,48,0.68)',
                        fontSize: 14,
                        lineHeight: 1.65,
                      }}
                    >
                      A tracking number will appear here as soon as your parcel is handed to the
                      carrier.
                    </p>
                  )}
                </aside>
              </div>
            </div>
          ) : null}
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
    title: 'Cart & Delivery | Lunar Talisman',
    description: 'Review your cart, choose delivery, and submit an order request.',
  })

  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [doneOrderId, setDoneOrderId] = useState('')
  const [paymentReady, setPaymentReady] = useState<boolean | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    shippingRegion: 'Americas',
    shippingCountry: 'United States',
    shippingMethod: 'standard',
    message: '',
  })

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee =
    SHIPPING_RATES[form.shippingRegion as ShippingRegion]?.[
      form.shippingMethod as 'standard' | 'express'
    ] ?? 8
  const total = subtotal + (cart.length ? shippingFee : 0)

  useEffect(() => {
    let active = true
    getPaymentConfiguration()
      .then((config) => {
        if (active) setPaymentReady(config.configured)
      })
      .catch(() => {
        if (active) setPaymentReady(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const paypalState = query.get('paypal')
    const paypalOrderId = query.get('token')
    if (!paypalState || !paypalOrderId) return

    let active = true
    setSubmitting(true)
    if (paypalState === 'success') {
      capturePaypalOrder(paypalOrderId)
        .then((order) => {
          if (!active) return
          setDoneOrderId(order.id)
          clearCart()
          trackEvent('purchase', { value: order.amount })
          setNotice('Payment confirmed. Your order is now in fulfilment, and a confirmation email is on its way.')
        })
        .catch(() => {
          if (active) {
            setNotice(
              'We could not confirm the PayPal payment automatically. Please do not pay again—contact support with your PayPal receipt.',
            )
          }
        })
        .finally(() => {
          if (active) setSubmitting(false)
        })
    } else {
      cancelPaypalOrder(paypalOrderId)
        .catch(() => undefined)
        .finally(() => {
          if (active) {
            setNotice('PayPal checkout was cancelled. Your cart is still here whenever you are ready.')
            setSubmitting(false)
          }
        })
    }

    window.history.replaceState(null, '', '/cart')
    return () => {
      active = false
    }
  }, [clearCart])

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
      setNotice('Your cart is empty. Add a talisman before continuing.')
      return
    }

    if (!form.name.trim() || !form.email.trim() || !form.address.trim()) {
      setNotice('Please complete your name, email, and delivery address.')
      return
    }

    if (paymentReady === false) {
      setNotice('Secure PayPal checkout is not enabled yet. Please check back shortly.')
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
          : `${cart[0].name} and ${cart.reduce((sum, item) => sum + item.quantity, 0) - 1} more`,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      channel: 'Website checkout',
      amount: total,
      shippingRegion: form.shippingRegion as PublicOrder['shippingRegion'],
      shippingCountry: form.shippingCountry,
      shippingMethod: form.shippingMethod,
      shippingFee,
      shippingStatus: '待支付',
      message: form.message.trim(),
      status: '待处理',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    }

    setSubmitting(true)
    try {
      trackEvent('begin_checkout', { value: total })
      const created = await createPublicOrder(order)
      const payment = await createPaypalOrder(created.id)
      trackEvent('payment_started', { value: total })
      window.location.assign(payment.approvalUrl)
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'We could not start secure PayPal checkout. Please try again.'
      setNotice(
        `${message} Your cart and delivery details are still here.`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!drawer) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.()
    }

    const body = document.body
    const root = document.documentElement
    const previousBodyOverflow = body.style.overflow
    const previousBodyOverscroll = body.style.overscrollBehavior
    const previousBodyPaddingRight = body.style.paddingRight
    const previousRootOverflow = root.style.overflow
    const scrollbarWidth = window.innerWidth - root.clientWidth

    // The drawer is the only scrolling surface while checkout is open.
    // This stops background/Lenis scrolling and avoids two competing scrollbars.
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    root.style.overflow = 'hidden'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    window.addEventListener('keydown', onKeyDown)
    return () => {
      body.style.overflow = previousBodyOverflow
      body.style.overscrollBehavior = previousBodyOverscroll
      body.style.paddingRight = previousBodyPaddingRight
      root.style.overflow = previousRootOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
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
                Cart & delivery
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
              Continue shopping
            </button>
            <button
              type="button"
              onClick={() => navigate('/track')}
              style={{
                border: '1px solid rgba(58,37,48,0.16)',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.55)',
                color: '#3a2530',
                padding: '10px 14px',
                cursor: 'pointer',
              }}
            >
              Track an order
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
                    {formatProductPrice(item.price)} each
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifySelf: 'end', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ border: 0, width: 36, height: 36, borderRadius: 999, background: '#f2ede6', cursor: 'pointer' }} aria-label="Decrease quantity">
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 900 }}>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ border: 0, width: 36, height: 36, borderRadius: 999, background: '#f2ede6', cursor: 'pointer' }} aria-label="Increase quantity">
                    <Plus size={16} />
                  </button>
                  <button type="button" onClick={() => updateQuantity(item.id, 0)} style={{ border: 0, width: 36, height: 36, borderRadius: 999, background: '#f9e8e8', cursor: 'pointer' }} aria-label="Remove item">
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
                <div style={{ fontSize: 18, fontWeight: 900 }}>Your talisman is waiting to be discovered</div>
                <p style={{ margin: '10px 0 0' }}>Choose a piece from a collection, then return to arrange delivery and leave a note.</p>
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
            <h2 style={{ margin: 0, fontSize: 22 }}>Checkout details</h2>
          </div>
          <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <MessageSquare size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                Name
              </span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} style={formFieldStyle} placeholder="Recipient name" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <Mail size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                Email
              </span>
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} style={formFieldStyle} placeholder="For order updates" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <Phone size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                Phone
              </span>
              <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} style={formFieldStyle} placeholder="Optional" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                Delivery address
              </span>
              <textarea rows={3} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} style={{ ...formFieldStyle, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Full delivery address" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                Delivery country
              </span>
              <select
                value={form.shippingCountry}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    shippingCountry: event.target.value,
                    shippingRegion: getShippingRegionForCountry(event.target.value),
                  }))
                }
                style={formFieldStyle}
              >
                {(Object.entries(SHIPPING_DESTINATIONS) as Array<
                  [ShippingRegion, readonly string[]]
                >).map(([region, countries]) => (
                  <optgroup key={region} label={region}>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span style={{ fontSize: 12, color: 'rgba(58,37,48,0.54)', lineHeight: 1.45 }}>
                Shipping rate: {form.shippingRegion}
              </span>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <Truck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                Shipping method
              </span>
              <select value={form.shippingMethod} onChange={(event) => setForm((current) => ({ ...current, shippingMethod: event.target.value }))} style={formFieldStyle}>
                <option value="standard">
                  Standard shipping · ${SHIPPING_RATES[form.shippingRegion as ShippingRegion].standard}
                </option>
                <option value="express">
                  Express shipping · ${SHIPPING_RATES[form.shippingRegion as ShippingRegion].express}
                </option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(58,37,48,0.58)' }}>
                <MessageSquare size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                Order note
              </span>
              <textarea rows={4} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} style={{ ...formFieldStyle, resize: 'vertical', fontFamily: 'inherit' }} placeholder="e.g. gift wrapping, low-light packaging, or other delivery notes" />
            </label>

            <div style={{ marginTop: 8, borderTop: '1px solid rgba(58,37,48,0.12)', paddingTop: 16, display: 'grid', gap: 8 }}>
              <Row label="Items subtotal" value={formatProductPrice(subtotal)} />
              <Row label="Shipping" value={cart.length ? formatProductPrice(shippingFee) : '$0'} />
              <Row label="Total" value={formatProductPrice(total)} strong />
            </div>

            <button
              type="submit"
              disabled={submitting || paymentReady !== true}
              aria-label="Pay securely with PayPal"
              style={{
                border: 0,
                borderRadius: 14,
                minHeight: 52,
                background: paymentReady ? '#ffc439' : 'rgba(58,37,48,0.16)',
                color: '#003087',
                padding: '12px 18px',
                fontWeight: 900,
                cursor: submitting || paymentReady !== true ? 'wait' : 'pointer',
                boxShadow: paymentReady ? '0 14px 30px rgba(255,196,57,0.28)' : 'none',
                opacity: submitting || paymentReady !== true ? 0.72 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 9,
                fontSize: 17,
                letterSpacing: '-0.02em',
              }}
            >
              {submitting ? (
                'Opening secure checkout...'
              ) : paymentReady === null ? (
                'Preparing PayPal...'
              ) : paymentReady ? (
                <>
                  <span style={{ color: '#003087', fontWeight: 950 }}>Pay</span>
                  <span style={{ color: '#009cde', fontWeight: 950 }}>Pal</span>
                  <span
                    style={{
                      width: 1,
                      height: 21,
                      margin: '0 2px',
                      background: 'rgba(0,48,135,0.22)',
                    }}
                  />
                  <span style={{ color: '#003087', fontSize: 14, letterSpacing: 0 }}>
                    Checkout
                  </span>
                </>
              ) : (
                'PayPal checkout unavailable'
              )}
            </button>
            <p style={{ margin: 0, color: 'rgba(58,37,48,0.5)', fontSize: 12, lineHeight: 1.5 }}>
              Payment is completed securely on PayPal. We only confirm your order after PayPal verifies the capture. Handling is usually 2–5 business days; local taxes or duties may apply.
            </p>

            {notice ? (
              <div style={{ borderRadius: 18, padding: '12px 14px', background: 'rgba(255,255,255,0.6)', color: '#55744f', fontSize: 13, fontWeight: 800, lineHeight: 1.5 }}>
                {notice}
                {doneOrderId ? <div style={{ marginTop: 4, color: '#3a2530' }}>Order number: {doneOrderId}</div> : null}
                {doneOrderId ? (
                  <button
                    type="button"
                    onClick={() => navigate('/track')}
                    style={{
                      marginTop: 10,
                      border: 0,
                      borderRadius: 999,
                      background: '#3a2530',
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    Track this order
                  </button>
                ) : null}
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
        aria-label="Cart drawer"
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
          data-lenis-prevent
          style={{
            marginLeft: 'auto',
            height: '100dvh',
            maxHeight: '100dvh',
            width: 'min(520px, 100%)',
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollbarGutter: 'stable',
            touchAction: 'pan-y',
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
                Cart
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close cart"
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
            Complete your cart, delivery details, and order note here without leaving the current page.
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
  pageTitle = 'Lunar Talisman · Crystal Jewelry & Chakra Rituals',
  pageDescription =
    'Discover crystal jewelry, chakra bracelets, gemstone talismans, lunar rituals, and practical crystal guides from Lunar Talisman.',
}: {
  navigate: NavigateFn
  cartCount: number
  onOpenCart?: () => void
  pageTitle?: string
  pageDescription?: string
}) {
  usePageMeta({
    title: pageTitle,
    description: pageDescription,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'Lunar Talisman',
          url: SITE_ORIGIN,
          logo: `${SITE_ORIGIN}/og-image.svg`,
          description:
            'Crystal jewelry, chakra bracelets, lunar rituals, and reflective crystal education.',
        },
        {
          '@type': 'WebSite',
          name: 'Lunar Talisman',
          url: SITE_ORIGIN,
          description: pageDescription,
        },
      ],
    },
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
      raf = 0
      const container = containerRef.current
      if (container) {
        const maxScroll = container.scrollHeight - window.innerHeight
        const nextProgress = clamp(window.scrollY / Math.max(1, maxScroll))
        scrollProgressRef.current = nextProgress
        setScrollProgress((current) =>
          Math.abs(current - nextProgress) > 0.0001 ? nextProgress : current,
        )
      }
    }

    const requestUpdate = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (raf) window.cancelAnimationFrame(raf)
    }
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

        <Navigation
          navigate={navigate}
          cartCount={cartCount}
          onOpenCart={onOpenCart}
          visible={scrollProgress >= 0.7}
        />
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
  useEnglishUi(
    `${route.page}-${'id' in route ? route.id : ''}-${cartOpen ? 'cart-open' : 'cart-closed'}`,
  )
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

  if (route.page === 'guide') {
    return (
      <>
        <GuidePage
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

  if (route.page === 'cart') {
    return (
      <>
        <HomePage
          navigate={goTo}
          cartCount={cartCount}
          onOpenCart={openCart}
          pageTitle="Cart & Delivery | Lunar Talisman"
          pageDescription="Review your cart, choose delivery, and submit an order request."
        />
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

  if (route.page === 'track') {
    return (
      <>
        <TrackOrderPage navigate={goTo} cartCount={cartCount} onOpenCart={openCart} />
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

  if (route.page === 'notFound') {
    return (
      <>
        <NotFoundPage navigate={goTo} cartCount={cartCount} onOpenCart={openCart} />
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
