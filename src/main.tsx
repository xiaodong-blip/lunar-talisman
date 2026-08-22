import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import App from './App.tsx'
import { SmoothScrollBridge } from './components/SmoothScrollBridge'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScrollBridge />
    <App />
  </StrictMode>,
)
