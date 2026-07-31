import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { EnergyParticles } from '../ui/EnergyParticles'
import { getChakraHex } from '../ui/chakra'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const SYNODIC_MONTH = 29.53058867
const SOLAR_HEX = getChakraHex('solar')
const MS_PER_DAY = 24 * 60 * 60 * 1000

function getMoonData(referenceDate = new Date()) {
  const now = new Date(referenceDate)
  const utcNow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
  )

  const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14)
  const age = ((utcNow - referenceNewMoon) / MS_PER_DAY) % SYNODIC_MONTH
  const normalizedAge = age < 0 ? age + SYNODIC_MONTH : age
  const phase = normalizedAge / SYNODIC_MONTH
  const nextFullMoonDays =
    ((SYNODIC_MONTH / 2 - normalizedAge) % SYNODIC_MONTH + SYNODIC_MONTH) %
    SYNODIC_MONTH
  const nextFullMoon = new Date(now.getTime() + nextFullMoonDays * MS_PER_DAY)

  return { phase, nextFullMoon }
}

function formatMoonDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function MoonGlyph({ phase }: { phase: number }) {
  const phaseIndex = Math.round(phase * 8) % 8
  const offsetMap = [0, 18, 12, 6, 999, -6, -12, -18]
  const offset = offsetMap[phaseIndex]
  const showOverlay = phaseIndex !== 4

  return (
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill={SOLAR_HEX} />
      {showOverlay ? (
        <circle cx={32 + offset} cy="32" r="22" fill="#FCF9F4" />
      ) : null}
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke={SOLAR_HEX}
        strokeWidth="2"
        opacity="0.35"
      />
    </svg>
  )
}

export function MoonPhaseBanner() {
  const { phase, nextFullMoon } = useMemo(() => getMoonData(new Date()), [])
  const nextFullMoonLabel = formatMoonDate(nextFullMoon)
  const navigate = useNavigate()
  const revealRef = useScrollReveal<HTMLElement>({ from: 'fade' })

  return (
    <section
      ref={revealRef}
      className="relative isolate overflow-hidden border-y bg-warm-cream"
      style={{ borderTopColor: `${SOLAR_HEX}26`, borderBottomColor: `${SOLAR_HEX}26` }}
    >
      <div className="chakra-gradient h-[2px] w-full" />
      <div className="relative">
        <EnergyParticles count={42} palette={[SOLAR_HEX]} className="opacity-70" />

        <div className="content-wrap relative z-10 px-4 py-6 md:px-6 md:py-8">
          <div className="flex flex-col gap-5 rounded-[28px] border border-border bg-white/70 px-5 py-5 backdrop-blur-sm md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-4">
              <MoonGlyph phase={phase} />
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-chakra-solar">
                  满月仪式
                </p>
                <h3 className="mt-1 text-2xl text-text-primary">
                  下一批满月加持批次
                </h3>
              </div>
            </div>

            <p className="max-w-xl text-sm leading-7 text-text-secondary md:text-base">
              {nextFullMoonLabel} 发货，适合想把月相仪式感真正带回生活的人。
            </p>

            <div className="flex md:justify-end">
              <Button variant="gold" size="lg" onClick={() => navigate('/quiz')}>
                预约满月仪式
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="chakra-gradient h-[2px] w-full" />
    </section>
  )
}
