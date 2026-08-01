import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import App from './App.tsx'

gsap.registerPlugin(ScrollTrigger)

if (typeof globalThis !== 'undefined') {
  ;(globalThis as typeof globalThis & {
    gsap?: typeof gsap
    ScrollTrigger?: typeof ScrollTrigger
  }).gsap = gsap
  ;(globalThis as typeof globalThis & {
    gsap?: typeof gsap
    ScrollTrigger?: typeof ScrollTrigger
  }).ScrollTrigger = ScrollTrigger
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
