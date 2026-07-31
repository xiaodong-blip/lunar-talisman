import {
  Circle,
  Flame,
  Leaf,
  Mountain,
  Sparkles,
  Star,
  Waves,
  Wind,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CrystalProduct } from '../../data/products'
import { chakras } from '../../data/chakras'
import { ChakraCard } from '../ui/ChakraCard'
import { Section } from '../ui/Section'
import { getChakraHex, type ChakraColorKey } from '../ui/chakra'

type EnergySpecProps = {
  product: CrystalProduct
}

const chakraIcons: Record<string, LucideIcon> = {
  root: Mountain,
  sacral: Waves,
  solar: Flame,
  heart: Leaf,
  throat: Wind,
  'third-eye': Star,
  crown: Sparkles,
}

const elementIcons: Record<string, LucideIcon> = {
  土: Mountain,
  水: Waves,
  火: Flame,
  风: Wind,
  以太: Sparkles,
}

const zodiacLabels: Record<string, string> = {
  aries: '白羊座',
  taurus: '金牛座',
  gemini: '双子座',
  cancer: '巨蟹座',
  leo: '狮子座',
  virgo: '处女座',
  libra: '天秤座',
  scorpio: '天蝎座',
  sagittarius: '射手座',
  capricorn: '摩羯座',
  aquarius: '水瓶座',
  pisces: '双鱼座',
}

function getChakra(id?: string) {
  return chakras.find((chakra) => chakra.id === id)
}

function SpecCard({
  chakraColor,
  icon: Icon,
  label,
  title,
  description,
}: {
  chakraColor: ChakraColorKey
  icon: LucideIcon
  label: string
  title: string
  description: string
}) {
  const color = getChakraHex(chakraColor)

  return (
    <ChakraCard chakraColor={chakraColor} hoverable={false} className="h-full">
      <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-cream"
          style={{ color }}
        >
          <Icon size={36} strokeWidth={1.6} />
        </span>
        <p className="mt-5 text-xs uppercase tracking-[0.24em] text-text-muted">
          {label}
        </p>
        <h3 className="mt-2 text-2xl text-text-primary">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
      </div>
    </ChakraCard>
  )
}

export function EnergySpec({ product }: EnergySpecProps) {
  const primary = getChakra(product.primaryChakra)
  const secondary = getChakra(product.secondaryChakra)
  const PrimaryIcon = chakraIcons[product.primaryChakra] ?? Sparkles
  const secondaryColor = product.secondaryChakra ?? product.primaryChakra
  const SecondaryIcon = chakraIcons[secondaryColor] ?? Circle
  const ElementIcon = elementIcons[product.element] ?? Sparkles
  const zodiacText = product.zodiacSigns?.length
    ? product.zodiacSigns.map((sign) => zodiacLabels[sign] ?? sign).join(' / ')
    : '全星座适用'

  return (
    <Section
      title="能量属性"
      subtitle="每件护符都拥有自己的脉轮、元素与星象对应关系。"
      chakraAccent={product.primaryChakra}
      tight
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SpecCard
          chakraColor={product.primaryChakra}
          icon={PrimaryIcon}
          label="主导脉轮"
          title={primary ? `${primary.name} · ${primary.nameEn}` : '七脉轮'}
          description={primary ? `${primary.location} · ${primary.affirmation}` : '以核心能量为主导。'}
        />
        <SpecCard
          chakraColor={secondaryColor}
          icon={SecondaryIcon}
          label="辅助脉轮"
          title={secondary ? `${secondary.name} · ${secondary.nameEn}` : '主导能量延展'}
          description={
            secondary
              ? `${secondary.location} · ${secondary.affirmation}`
              : '此款以单一主导脉轮为核心，能量更集中。'
          }
        />
        <SpecCard
          chakraColor={product.primaryChakra}
          icon={ElementIcon}
          label="对应元素"
          title={product.element}
          description={`元素 ${product.element} 与 ${product.crystalType} 的质感共同形成佩戴场域。`}
        />
        <SpecCard
          chakraColor={product.secondaryChakra ?? 'crown'}
          icon={Star}
          label="星座关联"
          title={zodiacText}
          description={
            product.zodiacSigns?.length
              ? '与星盘水象直觉能量相呼应，适合作为守护款佩戴。'
              : '不限制星座，按当下能量状态选择即可。'
          }
        />
      </div>
    </Section>
  )
}
