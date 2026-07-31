import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type RevealDirection = 'bottom' | 'left' | 'right' | 'fade'

type ScrollRevealOptions = {
  from: RevealDirection
  delay?: number
  duration?: number
  distance?: number
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  from,
  delay = 0,
  duration = 0.8,
  distance = 40,
}: ScrollRevealOptions) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const initialState =
      from === 'bottom'
        ? { y: distance, opacity: 0 }
        : from === 'left'
          ? { x: -distance, opacity: 0 }
          : from === 'right'
            ? { x: distance, opacity: 0 }
            : { opacity: 0 }

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        initialState,
        {
          x: 0,
          y: 0,
          opacity: 1,
          delay,
          duration,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reset',
          },
        },
      )
    }, element)

    return () => context.revert()
  }, [delay, distance, duration, from])

  return ref
}
