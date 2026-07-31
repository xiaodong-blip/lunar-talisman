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
    title: '扎根 / Root',
    description: '我们的水晶来自大地深处，每一颗都经过精心挑选。',
  },
  {
    chakraColor: 'solar',
    iconClass: 'text-chakra-solar',
    icon: Sun,
    title: '行动 / Action',
    description: '在特定月相时刻进行净化与加持仪式。',
  },
  {
    chakraColor: 'crown',
    iconClass: 'text-chakra-crown',
    icon: Sparkles,
    title: '觉醒 / Awaken',
    description: '将七脉轮能量注入饰品，交付到你的手中。',
  },
] as const

export function AboutPage() {
  usePageMeta({
    title: '关于 Lunar Talisman | 扎根大地，仰望星空',
    description:
      '了解 Lunar Talisman 的品牌故事：从大地水晶、月相净化到七脉轮能量饰品。',
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
            扎根大地，仰望星空
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-text-secondary md:text-lg">
            Lunar Talisman 相信，水晶不是遥远神秘的摆设，而是日常生活里温柔的能量锚点。我们以七脉轮为色彩语言，以月相为仪式节奏，把每一件饰品都做成可以佩戴的提醒：你可以安定，也可以发光。
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
          <h2 className="mt-8 text-4xl text-text-primary">开始你的水晶之旅</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-text-secondary">
            如果你还不知道哪件护符适合当下的自己，就让三道题帮你听见身体和直觉的答案。
          </p>
          <Link to="/quiz" className="mt-7 inline-flex">
            <Button variant="gold" size="lg">进入水晶测试</Button>
          </Link>
        </section>
      </div>
    </div>
  )
}
