import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import './index.css'
import App from './App.tsx'

declare global {
  interface Window {
    gsap: typeof gsap
    ScrollTrigger: typeof ScrollTrigger
  }
}

gsap.registerPlugin(ScrollTrigger)

if (typeof window !== 'undefined') {
  window.gsap = gsap
  window.ScrollTrigger = ScrollTrigger
}

function SmoothScrollBridge() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      duration: 1.1,
    })

    lenis.on('scroll', ScrollTrigger.update)

    let frameId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frameId = window.requestAnimationFrame(raf)
    }
    frameId = window.requestAnimationFrame(raf)

    return () => {
      window.cancelAnimationFrame(frameId)
      lenis.destroy()
    }
  }, [])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScrollBridge />
    <App />
  </StrictMode>,
)
