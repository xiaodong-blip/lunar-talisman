import { Link } from 'react-router-dom'
import { Mountain, Sparkles, Sun } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ChakraCard } from '../components/ui/ChakraCard'
import { EnergyParticles } from '../components/ui/EnergyParticles'
import { usePageMeta } from '../hooks/usePageMeta'

const storyCards = [
  {
    chakraColor: 'root',
    iconClass: 'text-chakra-root',
    icon: Mountain,
    title: 'Grounded in natural stone',
    description: 'We select natural stones for their color, texture, and the traditional meanings people bring to them.',
  },
  {
    chakraColor: 'solar',
    iconClass: 'text-chakra-solar',
    icon: Sun,
    title: 'Care with intention',
    description: 'Each piece is prepared with a simple, mineral-aware care ritual that respects the stone.',
  },
  {
    chakraColor: 'crown',
    iconClass: 'text-chakra-crown',
    icon: Sparkles,
    title: 'Make it yours',
    description: 'Wear your jewelry as a tactile reminder for the quality you want to carry through the day.',
  },
] as const

export function AboutPage() {
  usePageMeta({
    title: 'About Lunar Talisman | Healing Crystal Jewelry',
    description:
      'Learn how Lunar Talisman pairs natural stones, moonlit care, and intention-led jewelry for everyday rituals.',
  })

  return (
    <div className="relative isolate overflow-hidden bg-warm-cream">
      <div className="chakra-gradient absolute inset-x-0 top-0 h-[2px] opacity-90" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-chakra-root opacity-80" />
      <EnergyParticles count={80} className="opacity-70" />

      <div className="content-wrap relative z-10 px-4 py-16 md:px-6 md:py-24">
        <section className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-chakra-crown">
            About Lunar Talisman
          </p>
          <h1 className="mt-5 text-5xl text-text-primary md:text-7xl">
            Rooted in stone, guided by moonlight
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-text-secondary md:text-lg">
            Lunar Talisman treats crystal jewelry as a tangible reminder for everyday attention. We select natural stones for their color, texture, and traditional symbolism, then shape each piece around a simple ritual you can make your own.
          </p>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          {storyCards.map((card) => {
            const Icon = card.icon

            return (
              <ChakraCard
                key={card.title}
                chakraColor={card.chakraColor}
                className="h-full"
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-cream ${card.iconClass}`}>
                  <Icon size={30} strokeWidth={1.6} />
                </span>
                <h2 className="mt-8 text-3xl text-text-primary">{card.title}</h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  {card.description}
                </p>
              </ChakraCard>
            )
          })}
        </section>

        <section className="mt-16 rounded-[36px] border border-border bg-card/86 p-6 text-center shadow-[0_20px_60px_rgba(58,53,48,0.06)] md:p-10">
          <div className="chakra-gradient mx-auto h-1.5 w-40 rounded-full" />
          <h2 className="mt-8 text-4xl text-text-primary">Begin your crystal ritual</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-text-secondary">
            If you are unsure where to begin, three quiet prompts can help you choose a stone by intention, comfort, and instinct.
          </p>
          <Link to="/quiz" className="mt-7 inline-flex">
            <Button variant="gold" size="lg">Open the crystal finder</Button>
          </Link>
        </section>
      </div>
    </div>
  )
}
