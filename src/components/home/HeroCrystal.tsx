import { Canvas } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'

function CrystalMesh() {
  return (
    <Float speed={1.8} rotationIntensity={0.7} floatIntensity={1.6}>
      <mesh rotation={[0.15, 0.4, 0.2]} scale={1.6}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#d8cdf1"
          roughness={0.15}
          metalness={0.18}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh position={[0, -0.08, 0]} rotation={[0.2, 0.5, 0.1]} scale={1.1}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#b9a4e0"
          roughness={0.22}
          metalness={0.12}
          transparent
          opacity={0.45}
        />
      </mesh>
      <Sparkles count={30} scale={3.5} size={2.3} speed={0.35} color="#9b8ec4" />
    </Float>
  )
}

export function HeroCrystal() {
  return (
    <div className="relative min-h-[360px] overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[2, 3, 4]} intensity={2.4} color="#f7efe5" />
        <pointLight position={[-3, -2, 3]} intensity={1.6} color="#d4b76a" />
        <pointLight position={[0, 2, 5]} intensity={1.1} color="#9b8ec4" />
        <CrystalMesh />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {[
          'root',
          'sacral',
          'solar',
          'heart',
          'throat',
          'third-eye',
          'crown',
        ].map((chakra, index) => (
          <span
            key={chakra}
            className="h-2.5 w-2.5 rounded-full border border-white/60 shadow-sm"
            style={{
              background:
                [
                  'var(--color-chakra-root)',
                  'var(--color-chakra-sacral)',
                  'var(--color-chakra-solar)',
                  'var(--color-chakra-heart)',
                  'var(--color-chakra-throat)',
                  'var(--color-chakra-third-eye)',
                  'var(--color-chakra-crown)',
                ][index],
            }}
          />
        ))}
      </div>
    </div>
  )
}

