import { useEffect, useMemo, useRef } from 'react'

const STAR_COLORS = [
  'rgba(255,255,255,0.85)',
  'rgba(155,142,196,0.65)',
  'rgba(212,183,106,0.58)',
  'rgba(138,164,184,0.52)',
]

interface Star {
  x: number
  y: number
  r: number
  opacity: number
  speed: number
  color: string
}

export function CinematicMotionBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stars = useMemo<Star[]>(() => [], [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      stars.splice(0, stars.length)
      const count = window.innerWidth < 768 ? 90 : 170
      for (let i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 1.35 + 0.35,
          opacity: Math.random() * 0.45 + 0.18,
          speed: (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const gradient = ctx.createRadialGradient(
        window.innerWidth * 0.5,
        window.innerHeight * 0.42,
        0,
        window.innerWidth * 0.5,
        window.innerHeight * 0.42,
        Math.max(window.innerWidth, window.innerHeight) * 0.75,
      )
      gradient.addColorStop(0, 'rgba(58, 29, 88, 0.52)')
      gradient.addColorStop(0.48, 'rgba(8, 10, 26, 0.78)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.96)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      stars.forEach((star) => {
        if (!prefersReducedMotion) {
          star.opacity += star.speed
          if (star.opacity > 0.78 || star.opacity < 0.16) {
            star.speed *= -1
          }
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = star.color.replace(/[\d.]+\)$/u, `${star.opacity})`)
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [stars])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 h-screen w-screen pointer-events-none"
    />
  )
}
