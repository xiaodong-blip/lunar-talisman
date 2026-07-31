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
    title: 'Lunar Talisman · 月光护符 | 七脉轮水晶',
    description:
      'Lunar Talisman 是明亮温暖的玄学水晶饰品独立站，以七脉轮光谱、月相仪式和水晶测试为你匹配专属护符。',
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
