import { ChakraScroll } from '../components/home/ChakraScroll'
import { CollectionGrid } from '../components/home/CollectionGrid'
import { CrystalQuiz } from '../components/home/CrystalQuiz'
import { HeroSection } from '../components/home/HeroSection'
import { MoonPhaseBanner } from '../components/home/MoonPhaseBanner'
import { RitualGuide } from '../components/home/RitualGuide'
import { TestimonialCarousel } from '../components/home/TestimonialCarousel'
import { EnergyParticles } from '../components/ui/EnergyParticles'
import { usePageMeta } from '../hooks/usePageMeta'

export function HomePage() {
  usePageMeta({
    title: 'Lunar Talisman · Healing Crystal Jewelry & Rituals',
    description:
      'Lunar Talisman is a healing crystal jewelry studio pairing natural stones, moonlit rituals, and personal intention.',
  })

  return (
    <div className="relative isolate overflow-hidden bg-warm-cream">
      <EnergyParticles />
      <div className="relative z-10">
        <HeroSection />
        <ChakraScroll />
        <MoonPhaseBanner />
        <CollectionGrid />
        <CrystalQuiz />
        <RitualGuide />
        <TestimonialCarousel />
      </div>
    </div>
  )
}
