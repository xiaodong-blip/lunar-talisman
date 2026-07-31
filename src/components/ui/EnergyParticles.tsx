import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../utils/cn'
import { chakraHexMap } from './chakra'
import { hexToRgba } from './chakra'

type ParticleSeed = {
  size: number
  speed: number
  drift: number
  phase: number
  alpha: number
  color: string
}

type EnergyParticlesProps = {
  count?: number
  palette?: string[]
  className?: string
}

type Particle = ParticleSeed & {
  x: number
  y: number
}

const defaultPalette = Object.values(chakraHexMap)

export function EnergyParticles({
  count = 120,
  palette = defaultPalette,
  className,
}: EnergyParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const lastTimeRef = useRef<number>(0)
  const [effectiveCount, setEffectiveCount] = useState(count)

  useEffect(() => {
    const getResponsiveCount = () => {
      if (window.innerWidth >= 640) return count
      if (count >= 100) return 60
      if (count >= 70) return 50
      return Math.max(24, Math.round(count / 2))
    }

    const updateCount = () => setEffectiveCount(getResponsiveCount())

    updateCount()
    window.addEventListener('resize', updateCount)

    return () => window.removeEventListener('resize', updateCount)
  }, [count])

  const seeds = useMemo<ParticleSeed[]>(
    () =>
      Array.from({ length: effectiveCount }, () => {
        const color = palette[Math.floor(Math.random() * palette.length)]

        return {
          size: 2 + Math.random() * 2,
          speed: 0.18 + Math.random() * 0.4,
          drift: (Math.random() - 0.5) * 0.3,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.2 + Math.random() * 0.2,
          color,
        }
      }),
    [effectiveCount, palette],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let animationFrame = 0

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const pixelRatio = Math.max(1, window.devicePixelRatio || 1)

      particlesRef.current = seeds.map((seed) => ({
        ...seed,
        x: Math.random() * width,
        y: Math.random() * height,
      }))

      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const draw = (time: number) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time
      }

      const delta = (time - lastTimeRef.current) / 16.67
      lastTimeRef.current = time

      context.clearRect(0, 0, width, height)

      for (const particle of particlesRef.current) {
        particle.y -= particle.speed * delta
        particle.x += Math.sin(time / 900 + particle.phase) * particle.drift * delta

        if (particle.y < -20) {
          particle.y = height + 20 + Math.random() * 40
          particle.x = Math.random() * width
        }

        if (particle.x < -20) particle.x = width + 20
        if (particle.x > width + 20) particle.x = -20

        context.beginPath()
        context.fillStyle = hexToRgba(particle.color, particle.alpha)
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        context.fill()
      }

      animationFrame = window.requestAnimationFrame(draw)
    }

    resize()
    animationFrame = window.requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [seeds])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 z-0 h-full w-full pointer-events-none', className)}
      aria-hidden="true"
    />
  )
}
