import { useLayoutEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { chakras } from '../../data/chakras'

type ChakraOrb = {
  id: string
  hex: string
  angle: number
  radius: number
  bobAmplitude: number
  bobSpeed: number
  pulseSpeed: number
}

const chakraColors = [
  '#C4816B',
  '#D49A6A',
  '#D4B76A',
  '#8AA88A',
  '#8AA4B8',
  '#8A8EB8',
  '#9B8EC4',
]

function CrystalOrbitScene() {
  const crystalRef = useRef<Mesh | null>(null)
  const orbitGroupRef = useRef<Group | null>(null)
  const orbRefs = useRef<Array<Mesh | null>>([])
  const orbRevealRefs = useRef<Array<{ value: number }>>([])

  const orbs = useMemo<ChakraOrb[]>(
    () =>
      Array.from({ length: 7 }).map((_, index) => ({
        id: chakras[index].id,
        hex: chakraColors[index],
        angle: (index / 7) * Math.PI * 2,
        radius: 2.5,
        bobAmplitude: 0.12 + index * 0.01,
        bobSpeed: 0.95 + index * 0.12,
        pulseSpeed: 0.7 + index * 0.05,
      })),
    [],
  )

  orbs.forEach((_, index) => {
    if (!orbRevealRefs.current[index]) {
      orbRevealRefs.current[index] = { value: 0 }
    }
  })

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const maxTilt = Math.PI / 12

    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.3
      crystalRef.current.rotation.x = Math.sin(time * 0.5) * 0.06
      crystalRef.current.rotation.z = Math.cos(time * 0.35) * 0.04
    }

    if (orbitGroupRef.current) {
      const targetX = -state.pointer.y * maxTilt * 0.6
      const targetY = state.pointer.x * maxTilt
      const ease = Math.min(delta * 5, 1)

      orbitGroupRef.current.rotation.x +=
        (targetX - orbitGroupRef.current.rotation.x) * ease
      orbitGroupRef.current.rotation.y +=
        (targetY - orbitGroupRef.current.rotation.y) * ease
    }

    orbs.forEach((orb, index) => {
      const mesh = orbRefs.current[index]
      if (!mesh) return

      const angle = orb.angle + time * 0.16
      const pulse = 0.86 + Math.sin(time * orb.pulseSpeed + index) * 0.05
      const reveal = orbRevealRefs.current[index]?.value ?? 1

      mesh.position.x = Math.cos(angle) * orb.radius
      mesh.position.z = Math.sin(angle) * orb.radius
      mesh.position.y = Math.sin(time * orb.bobSpeed + index) * orb.bobAmplitude
      mesh.scale.setScalar(reveal * pulse)
    })
  })

  useLayoutEffect(() => {
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

    if (crystalRef.current) {
      crystalRef.current.scale.setScalar(0.84)
      timeline.to(crystalRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1,
      })
    }

    orbRefs.current.forEach((mesh, index) => {
      if (!mesh) return

      orbRevealRefs.current[index].value = 0
      timeline.to(
        orbRevealRefs.current[index],
        {
          value: 1,
          duration: 0.55,
        },
        0.6 + index * 0.1,
      )
    })

    return () => {
      timeline.kill()
    }
  }, [])

  return (
    <group>
      <ambientLight color="#FFF5E8" intensity={2} />
      <directionalLight position={[5, 5, 5]} color="#FFFBF0" intensity={2.5} />
      <pointLight position={[0, 3, 2]} color="#9B8EC4" intensity={4} />

      <group ref={orbitGroupRef} position={[0, 0, 0.35]}>
        {orbs.map((orb, index) => (
          <mesh
            key={orb.id}
            ref={(node) => {
              orbRefs.current[index] = node
            }}
            position={[
              Math.cos(orb.angle) * orb.radius,
              Math.sin(orb.angle) * 0.12,
              Math.sin(orb.angle) * orb.radius,
            ]}
            renderOrder={index + 1}
          >
            <sphereGeometry args={[0.15, 20, 20]} />
            <meshStandardMaterial
              color={orb.hex}
              emissive={orb.hex}
              emissiveIntensity={0.3}
              roughness={0.35}
              metalness={0.12}
            />
          </mesh>
        ))}
      </group>

      <mesh ref={crystalRef} position={[0, 0, 0]} rotation={[0.25, 0.45, 0.1]}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshPhysicalMaterial
          color="#9B8EC4"
          roughness={0.12}
          metalness={0.05}
          clearcoat={0.4}
          clearcoatRoughness={0.12}
          flatShading
          reflectivity={0.4}
        />
      </mesh>
    </group>
  )
}

export function HeroSection() {
  const navigate = useNavigate()
  const textRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { x: -48, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        )

        gsap.fromTo(
          textRef.current.querySelectorAll('[data-hero-line]'),
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.08,
            delay: 0.1,
          },
        )
      }

      if (sceneRef.current) {
        gsap.fromTo(
          sceneRef.current,
          { x: 56, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, delay: 0.2, ease: 'power3.out' },
        )
      }
    }, textRef)

    return () => context.revert()
  }, [])

  return (
    <section className="bg-warm-cream pt-20 sm:pt-24 lg:min-h-screen lg:pt-28">
      <div className="content-wrap grid gap-8 px-4 pb-12 md:px-6 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-2 lg:items-center lg:gap-10 lg:pb-16">
        <div ref={textRef} className="max-w-2xl">
          <div data-hero-line>
            <Badge variant="crown">顶轮觉醒 · 水晶护符</Badge>
          </div>

          <h1 data-hero-line className="mt-5 max-w-3xl leading-[0.95] text-text-primary">
            唤醒你的{' '}
            <span
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #C4816B, #D49A6A, #D4B76A, #8AA88A, #8AA4B8, #8A8EB8, #9B8EC4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline',
              }}
            >
              七脉轮
            </span>
            {' '}能量
          </h1>

          <p
            data-hero-line
            className="mt-6 max-w-xl text-base leading-7 text-text-secondary md:text-lg"
          >
            Lunar Talisman 以月光为引，将七脉轮能量注入每一颗水晶。选择你的护符，开启内在的能量之旅。
          </p>

          <div data-hero-line className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="gold"
              size="lg"
              onClick={() => navigate('/collections')}
            >
              探索系列
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/quiz')}
            >
              水晶测试
            </Button>
          </div>

          <p data-hero-line className="mt-6 text-sm text-text-muted md:text-base">
            12 星座守护 · 7 脉轮疗愈 · 8 月相仪式 · 由月光加持
          </p>
        </div>

        <div
          ref={sceneRef}
          className="relative flex min-h-[300px] items-center justify-center sm:min-h-[420px] lg:min-h-[680px]"
          aria-label="七脉轮水晶能量场"
        >
          <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_center,rgba(155,142,196,0.08),rgba(252,249,244,0)_68%)]" />
          <Canvas
            camera={{ position: [0, 0, 6], fov: 42 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            className="relative z-10"
            style={{ background: 'transparent' }}
          >
            <CrystalOrbitScene />
          </Canvas>
        </div>
      </div>
    </section>
  )
}
