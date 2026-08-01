import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import App from './App.tsx'

gsap.registerPlugin(ScrollTrigger)

if (typeof window !== 'undefined') {
  ;(
    window as Window & {
      gsap?: typeof gsap
      ScrollTrigger?: typeof ScrollTrigger
    }
  ).gsap = gsap
  ;(
    window as Window & {
      gsap?: typeof gsap
      ScrollTrigger?: typeof ScrollTrigger
    }
  ).ScrollTrigger = ScrollTrigger
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
