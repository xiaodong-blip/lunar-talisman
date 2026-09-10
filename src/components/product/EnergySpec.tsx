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
  Earth: Mountain,
  Water: Waves,
  Fire: Flame,
  Air: Wind,
  Ether: Sparkles,
}

const zodiacLabels: Record<string, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces',
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
    <ChakraCard
      chakraColor={chakraColor}
      hoverable={false}
      className="h-full bg-white/[0.9] shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-md"
    >
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
    : 'All zodiac signs'

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.32em] text-white/45">
          Energy Specification
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">
          Crystal profile
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
          Every piece has its own material, color story, and reflective intention.
        </p>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SpecCard
          chakraColor={product.primaryChakra}
          icon={PrimaryIcon}
          label="Primary intention"
          title={primary ? `${primary.nameEn}` : 'Personal intention'}
          description={primary ? `${primary.location} · ${primary.affirmation}` : 'Choose the meaning that feels most useful today.'}
        />
        <SpecCard
          chakraColor={secondaryColor}
          icon={SecondaryIcon}
          label="Secondary intention"
          title={secondary ? `${secondary.nameEn}` : 'Intention in focus'}
          description={
            secondary
              ? `${secondary.location} · ${secondary.affirmation}`
              : 'A single clear intention can be enough.'
          }
        />
        <SpecCard
          chakraColor={product.primaryChakra}
          icon={ElementIcon}
          label="Element"
          title={product.element}
          description={`The ${product.element} element and ${product.crystalType} texture shape the feel of this piece.`}
        />
        <SpecCard
          chakraColor={product.secondaryChakra ?? 'crown'}
          icon={Star}
          label="Zodiac note"
          title={zodiacText}
          description={
            product.zodiacSigns?.length
              ? 'A symbolic correspondence for shoppers who enjoy astrology.'
              : 'No zodiac sign required; choose by material, color, and personal preference.'
          }
        />
      </div>
    </section>
  )
}
