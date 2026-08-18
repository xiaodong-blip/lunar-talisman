import { Droplets, Flame, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CrystalProduct } from '../../data/products'
import { ChakraCard } from '../ui/ChakraCard'
import { getChakraHex, hexToRgba } from '../ui/chakra'

type RitualCardProps = {
  product: CrystalProduct
}

const ritualSteps = [
  {
    title: 'Cleanse',
    description:
      'Rest the crystal under moonlight before wearing it, or pass white sage smoke around it three times.',
    icon: Droplets,
  },
  {
    title: 'Charge',
    description:
      'Hold the talisman in both hands and imagine its chakra gently lighting up.',
    icon: Flame,
  },
  {
    title: 'Activate',
    description:
      'Wear it close to the body and speak one affirmation connected to your present intention.',
    icon: Sparkles,
  },
]

export function RitualCard({ product }: RitualCardProps) {
  const heartColor = getChakraHex('heart')

  return (
    <section className="content-wrap px-4 py-12 md:px-6 md:py-16">
      <ChakraCard
        chakraColor="heart"
        hoverable={false}
        className="bg-white/[0.9] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.24)] backdrop-blur-md md:p-8"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(heartColor, 0.15)}, rgba(255,251,247,0.92) 34%, rgba(255,251,247,0.96) 100%)`,
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-chakra-heart">
              Activation Ritual
            </p>
            <h2 className="mt-3 text-3xl text-text-primary md:text-4xl">
              Activate your {product.name}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-text-secondary">
              The ritual does not need to be complicated. Give this talisman a clear beginning and let it become a daily reminder of your intention.
            </p>
          </div>

          <div className="space-y-4">
            {ritualSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border bg-white/72 p-4"
                >
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warm-cream text-chakra-heart">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3 className="text-xl text-text-primary">
                        {String(index + 1).padStart(2, '0')} · {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="rounded-2xl border border-chakra-heart/25 bg-chakra-heart/10 p-4 text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Ritual tools:</span>
              <Link to="/series/rituals" className="ml-2 text-chakra-heart transition-colors hover:text-text-primary">
                Palo santo
              </Link>
              <span className="mx-2 text-text-muted">/</span>
              <Link to="/series/rituals" className="text-chakra-heart transition-colors hover:text-text-primary">
                White sage
              </Link>
            </div>
          </div>
        </div>
      </ChakraCard>
    </section>
  )
}
