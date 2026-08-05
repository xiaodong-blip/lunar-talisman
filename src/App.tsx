import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

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

const DETAILS: DetailData[] = [
  ...PRODUCTS,
  {
    id: 'zodiac',
    eyebrow: 'Collection',
    title: '星座守护系列',
    desc: '十二星座专属水晶，每颗都由对应脉轮能量加持。',
    color: '#dcd2f2',
    image: CARD_IMAGES[0],
    specs: ['十二星座', '顶轮', '星盘能量', '守护佩戴'],
    body: [
      '星座守护系列把星盘元素与水晶频率连接起来，让每个星座都有自己的护符入口。',
      '适合想从星座特质出发，找到专属水晶的人。',
    ],
  },
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
    specs: ['星座', '颜色直觉', '能量需求', '产品推荐'],
    body: [
      '测试入口会从星座、当下需求和颜色直觉三个维度出发。',
      '最终结果会推荐你的守护脉轮和对应水晶。',
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

const PRODUCT_TILES: Tile[] = PRODUCTS.map((product) => ({
  id: product.id,
  title: product.title.replace(' · ', '\n'),
  desc: product.desc,
  color: product.color,
  image: product.image,
  eyebrow: product.eyebrow,
  target: `/detail/${product.id}`,
}))

const SERIES: SeriesPageData[] = [
  {
    id: 'worlds',
    eyebrow: 'Worlds',
    title: '水晶旅程',
    desc: '从星座、脉轮与月相三个入口进入，找到与你当前频率共振的护符。',
    color: '#f3cdd6',
    tiles: [
      {
        id: 'zodiac',
        title: '星座守护',
        desc: '十二星座专属水晶入口',
        color: '#dcd2f2',
        image: CARD_IMAGES[0],
        target: '/series/zodiac',
      },
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
    eyebrow: 'Three Portals',
    title: '三大系列',
    desc: 'Zodiac 更轻灵，Chakra 更疗愈，Lunar 更具仪式感。',
    color: '#f0e4c0',
    tiles: [
      {
        id: 'zodiac',
        title: 'Zodiac\n星座守护',
        desc: '由星盘进入水晶频率',
        color: '#dcd2f2',
        image: CARD_IMAGES[0],
        target: '/series/zodiac',
      },
      {
        id: 'chakra',
        title: 'Chakra\n脉轮疗愈',
        desc: '从海底轮到顶轮的能量旅程',
        color: '#dcedc2',
        image: CARD_IMAGES[1],
        target: '/series/chakra',
      },
      {
        id: 'lunar',
        title: 'Lunar\n月相仪式',
        desc: '让水晶跟随月光呼吸',
        color: '#c3e3f4',
        image: CARD_IMAGES[2],
        target: '/series/lunar',
      },
    ],
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
    tiles: PRODUCT_TILES.filter((tile) =>
      ['scorpio-amethyst', 'full-moon-necklace'].includes(tile.id),
    ),
  },
  {
    id: 'chakra',
    eyebrow: 'Chakras',
    title: '脉轮疗愈系列',
    desc: '七脉轮完整疗愈路径，每一件水晶都对应一个能量中心。',
    color: '#dcedc2',
    tiles: [
      ...PRODUCT_TILES.filter((tile) =>
        ['heart-rose-quartz', 'solar-citrine', 'root-garnet'].includes(tile.id),
      ),
      {
        id: 'chakra-test',
        title: '七脉轮\n自测入口',
        desc: '找到你此刻最需要平衡的能量中心',
        color: '#f0e4c0',
        image: CARD_IMAGES[0],
        target: '/detail/chakra-test',
      },
    ],
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
    desc: '水晶、星座、脉轮与月相仪式的知识入口。',
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
]

const ARC_CARDS: Tile[] = [
  ...SERIES.find((series) => series.id === 'collections')!.tiles,
  ...PRODUCT_TILES,
].slice(0, 9)

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function routeFromPath(): Route {
  const [page, id] = window.location.pathname.split('/').filter(Boolean)

  if (page === 'series' && id) return { page: 'series', id }
  if (page === 'detail' && id) return { page: 'detail', id }

  return { page: 'home' }
}

function useRoute() {
  const [route, setRoute] = useState<Route>(() => routeFromPath())

  useEffect(() => {
    const onPop = () => setRoute(routeFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

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

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M4 2.5v7l5-3.5-5-3.5Z" fill="#3b1a0a" />
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

function Navigation({ navigate }: { navigate: NavigateFn }) {
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
        {navButton('Connect', '/series/codex')}
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
          {navButton('Connect', '/series/worlds')}
        </div>
      </div>
    </nav>
  )
}

function FeatureCard({
  image,
  label,
  number,
  desktop,
  onClick,
}: {
  image: string
  label: string
  number?: string
  desktop?: boolean
  onClick: () => void
}) {
  const size = desktop ? 158 : 140
  const radius = desktop ? 28 : 22

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: radius,
        overflow: 'hidden',
        border: 0,
        padding: 0,
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(15,5,8,0.78) 0%, rgba(15,5,8,0.34) 44%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          height: '44%',
          borderRadius: radius - 10,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to top, black 0%, black 72%, transparent 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#fff',
          fontFamily: "'Imprima', sans-serif",
          fontSize: desktop ? 18 : 13,
          textShadow: '0 1px 8px rgba(0,0,0,0.55)',
        }}
      >
        {number ? (
          <span
            style={{
              fontFamily: "'Viaoda Libre', serif",
              fontSize: desktop ? 36 : 28,
              lineHeight: 1,
            }}
          >
            {number}
          </span>
        ) : (
          <span
            style={{
              width: desktop ? 30 : 26,
              height: desktop ? 30 : 26,
              borderRadius: 999,
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
            }}
          >
            <PlayIcon />
          </span>
        )}
        <span>{label}</span>
      </div>
    </button>
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
  navigate,
  onDescend,
  onProgressJump,
}: {
  opacity: number
  uiVisible: boolean
  isMobile: boolean
  isDesktop: boolean
  navigate: NavigateFn
  onDescend: () => void
  onProgressJump: (progress: number) => void
}) {
  const commonFade: CSSProperties = {
    opacity: uiVisible ? opacity : 0,
    transform: uiVisible ? 'translateY(0)' : 'translateY(18px)',
    transition: 'opacity 0.9s ease, transform 0.9s ease',
  }

  const cards = (
    <>
      <FeatureCard
        image={CARD_IMAGES[0]}
        label="水晶旅程"
        desktop={isDesktop}
        onClick={() => navigate('/series/worlds')}
      />
      <FeatureCard
        image={CARD_IMAGES[1]}
        label="三大系列"
        number="3"
        desktop={isDesktop}
        onClick={() => navigate('/series/collections')}
      />
      <FeatureCard
        image={CARD_IMAGES[2]}
        label="月相仪式"
        desktop={isDesktop}
        onClick={() => navigate('/series/rituals')}
      />
    </>
  )

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
          <FeatureCard
            image={CARD_IMAGES[0]}
            label="水晶旅程"
            onClick={() => navigate('/series/worlds')}
          />
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
          <div style={{ display: 'flex', gap: 14 }}>{cards}</div>
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

          <div
            style={{
              opacity: uiVisible ? opacity : 0,
              transform: uiVisible
                ? 'translateY(-50%)'
                : 'translateY(calc(-50% + 18px))',
              transition:
                'opacity 0.9s ease 0.55s, transform 0.9s ease 0.55s',
              position: 'absolute',
              right: 40,
              top: '50%',
              display: 'flex',
              gap: 12,
            }}
          >
            {cards}
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
        星座守护、脉轮疗愈与月相仪式交织成一条旅程；每一件水晶都对应你此刻最需要的频率。
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
}: {
  cards: Tile[]
  rotationOffset: number
  isMobile: boolean
  opacity: number
  navigate: NavigateFn
}) {
  const cardSpacingDeg = isMobile ? 12 : 9
  const centerIndex = Math.floor(cards.length / 2)
  const arcRadius = isMobile ? 700 : 1100
  const cardW = isMobile ? 160 : 220
  const cardH = isMobile ? 175 : 230
  const sliderH = isMobile ? 260 : 360
  const lift = isMobile ? 140 : 200

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
        opacity,
        pointerEvents: opacity > 0.12 ? 'auto' : 'none',
      }}
    >
      {cards.map((card, index) => {
        const baseDeg = (index - centerIndex) * cardSpacingDeg
        const deg = baseDeg - rotationOffset + centerIndex * cardSpacingDeg
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
              border: 0,
              boxShadow: '0 8px 40px rgba(80,40,60,0.18)',
              transform: `rotate(${deg}deg)`,
              transformOrigin: `${cardW / 2}px ${arcRadius}px`,
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
}: {
  navigate: NavigateFn
  children: ReactNode
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
      <Navigation navigate={navigate} />
      <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>
    </main>
  )
}

function TileCard({ tile, navigate }: { tile: Tile; navigate: NavigateFn }) {
  return (
    <button
      type="button"
      onClick={() => navigate(tile.target)}
      style={{
        minHeight: 270,
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 32,
        overflow: 'hidden',
        background: tile.color,
        boxShadow: '0 18px 60px rgba(0,0,0,0.24)',
        textAlign: 'left',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          height: 145,
          position: 'relative',
          overflow: 'hidden',
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
              'linear-gradient(to top, rgba(30,18,28,0.62), rgba(30,18,28,0.06))',
          }}
        />
      </div>
      <div style={{ padding: 24 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(58,37,48,0.52)',
          }}
        >
          {tile.eyebrow ?? 'Lunar Portal'}
        </p>
        <h3
          style={{
            margin: '10px 0 0',
            whiteSpace: 'pre-line',
            fontFamily: "'Viaoda Libre', serif",
            fontSize: 'clamp(30px, 4vw, 44px)',
            lineHeight: 0.96,
            color: '#3a2530',
          }}
        >
          {tile.title}
        </h3>
        <p
          style={{
            margin: '14px 0 0',
            fontSize: 15,
            lineHeight: 1.55,
            color: 'rgba(58,37,48,0.66)',
          }}
        >
          {tile.desc}
        </p>
      </div>
    </button>
  )
}

function SeriesPage({
  id,
  navigate,
}: {
  id: string
  navigate: NavigateFn
}) {
  const series = SERIES.find((item) => item.id === id) ?? SERIES[0]

  return (
    <AtmosphericShell navigate={navigate}>
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

        <p
          style={{
            margin: '44px 0 0',
            fontSize: 13,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          {series.eyebrow}
        </p>
        <h1
          style={{
            margin: '14px 0 0',
            maxWidth: 760,
            fontFamily: "'Viaoda Libre', serif",
            fontSize: 'clamp(58px, 9vw, 118px)',
            lineHeight: 0.92,
            color: '#fff',
            textShadow: '0 2px 24px rgba(0,0,0,0.45)',
          }}
        >
          {series.title}
        </h1>
        <p
          style={{
            margin: '22px 0 0',
            maxWidth: 620,
            fontSize: 19,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          {series.desc}
        </p>

        <div
          style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 22,
          }}
        >
          {series.tiles.map((tile) => (
            <TileCard key={tile.id} tile={tile} navigate={navigate} />
          ))}
        </div>
      </section>
    </AtmosphericShell>
  )
}

function DetailPage({
  id,
  navigate,
}: {
  id: string
  navigate: NavigateFn
}) {
  const detail =
    DETAILS.find((item) => item.id === id) ??
    DETAILS.find((item) => item.id === 'chakra-test')!

  return (
    <AtmosphericShell navigate={navigate}>
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
            onClick={() => navigate('/series/worlds')}
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
        </div>
      </article>
    </AtmosphericShell>
  )
}

function HomePage({
  navigate,
}: {
  navigate: NavigateFn
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
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
        setScrollProgress(clamp(window.scrollY / Math.max(1, maxScroll)))
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

  const values = useMemo(() => {
    const ep = easeInOut(scrollProgress)
    const scene1Opacity = clamp(1 - scrollProgress / 0.22)
    const scene2Opacity = clamp((scrollProgress - 0.68) / 0.16)
    const arcSweepDeg = (ARC_CARDS.length - 1) * 8
    const rotationOffset = lerp(
      0,
      arcSweepDeg,
      clamp((scrollProgress - 0.7) / 0.3),
    )
    return {
      ep,
      scene1Opacity,
      scene2Opacity,
      rotationOffset,
      mx: isMobile ? 0 : mouse.x,
      my: isMobile ? 0 : mouse.y,
    }
  }, [isMobile, mouse.x, mouse.y, scrollProgress])

  const worldTransform = `translate3d(${-values.mx * MAG.world}px, ${-values.my * MAG.world}px, 0) scale(${lerp(1, 1.18, values.ep)})`
  const cloudTransform = `translate3d(${-values.mx * MAG.clouds}px, ${-values.my * MAG.clouds * 0.4}px, 0) scale(${lerp(1, 1.4, values.ep)})`
  const portalTransform = `translate3d(${-values.mx * MAG.portal}px, ${-values.my * MAG.portal}px, 0) scale(${lerp(1, 7.5, values.ep)})`
  const curtainLTransform = `translate3d(${(curtainsOpen ? -62 : 0) - lerp(0, 150, values.ep)}%, ${-values.my * MAG.curtainL * 0.3}px, 0) translateX(${-values.mx * MAG.curtainL}px) scale(${lerp(1, 1.3, values.ep)})`
  const curtainRTransform = `translate3d(${(curtainsOpen ? 62 : 0) + lerp(0, 150, values.ep)}%, ${-values.my * MAG.curtainR * 0.3}px, 0) translateX(${-values.mx * MAG.curtainR}px) scale(${lerp(1, 1.3, values.ep)})`

  return (
    <div ref={containerRef} style={{ height: '480vh', position: 'relative' }}>
      <div
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

        <Navigation navigate={navigate} />
        <SceneOneUI
          opacity={values.scene1Opacity}
          uiVisible={uiVisible}
          isMobile={isMobile}
          isDesktop={isDesktop}
          navigate={navigate}
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

  if (route.page === 'series') {
    return <SeriesPage id={route.id} navigate={navigate} />
  }

  if (route.page === 'detail') {
    return <DetailPage id={route.id} navigate={navigate} />
  }

  return <HomePage navigate={navigate} />
}

export default App
